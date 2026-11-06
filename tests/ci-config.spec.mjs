import { test, expect } from 'playwright/test';
import fs from 'node:fs';

// The CI pipeline runs the suite as parallel groups and ends in one job named `verify`, the name the branch-protection
// ruleset requires. These checks keep that wiring honest, so a rename or a mistyped group cannot silently stop
// verification or leave tests out.
const read = (file) => fs.readFileSync(file, 'utf8');
const config = read('playwright.config.mjs');
const declared = [...config.match(/const GROUPS = \{([\s\S]*?)\n\};/)[1].matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1]);
const valid = new Set([...declared, 'rest']);

for (const file of ['.github/workflows/ci.yml', '.github/workflows/deploy-production.yml']) {
  test.describe(file, () => {
    const workflow = read(file);

    test('has a job called exactly "verify" that needs the static checks and the test groups', () => {
      const job = workflow.match(/\n  verify:\n([\s\S]*?)(?=\n  [a-z-]+:\n|$)/)[1];
      expect(job).toContain('needs: [static, tests]');
      expect(job).toContain('if: always()');
      expect(job, 'a "name:" would rename the required status check').not.toMatch(/^\s{4}name:/m);
      expect(job).toContain('exit 1');
    });

    test('every matrix group exists in playwright.config.mjs, and the automatic "rest" group runs', () => {
      const groups = [...workflow.matchAll(/\{ name: [\w-]+, group: (\w+),/g)].map((m) => m[1]);
      expect(groups.length).toBeGreaterThan(0);
      for (const group of groups) expect(valid.has(group), `unknown group ${group}`).toBe(true);
      expect(groups, 'every declared group must run').toEqual(expect.arrayContaining(declared));
      expect(groups, 'tests outside the named groups only run in "rest"').toContain('rest');
    });

    test('uses the shared prepare action and installs the browser only for test jobs', () => {
      expect(workflow).toContain('uses: ./.github/actions/prepare');
      expect(workflow.match(/browser: 'true'/g)).toHaveLength(1);
    });
  });
}

test('every spec file belongs to exactly one group (unlisted files go to "rest")', () => {
  const specs = fs.readdirSync('tests').filter((f) => f.endsWith('.spec.mjs'));
  expect(specs.length).toBeGreaterThan(5);
  const patterns = Object.fromEntries(declared.map((name) => {
    const body = config.match(new RegExp(`\\b${name}: \\[(.*?)\\]`))[1];
    return [name, [...body.matchAll(/\/(.+?)\//g)].map((m) => new RegExp(m[1]))];
  }));
  for (const spec of specs) {
    const hits = declared.filter((name) => patterns[name].some((re) => re.test(spec)));
    expect(hits.length, `${spec} is in groups: ${hits.join(', ')}`).toBeLessThanOrEqual(1);
  }
});

// Script injection: ${{ ... }} expressions are expanded BEFORE the shell sees the script, so a crafted value (a dispatch
// input, a branch name, a PR title) could become code. Untrusted values must reach `run:` scripts through env: instead.
test('no workflow expands untrusted values (inputs, event data, branch names) inside a run script', () => {
  const UNTRUSTED = /\$\{\{\s*(inputs\.|github\.event\.|github\.head_ref|github\.ref_name)/;
  const offenders = [];
  for (const file of fs.readdirSync('.github/workflows').filter((f) => f.endsWith('.yml'))) {
    const lines = read(`.github/workflows/${file}`).split('\n');
    let runIndent = -1;
    lines.forEach((line, i) => {
      const indent = line.length - line.trimStart().length;
      if (runIndent >= 0 && line.trim() && indent <= runIndent) runIndent = -1;
      const start = line.match(/^(\s*)(?:- )?run:\s*(.*)$/);
      if (start) { runIndent = start[1].length; if (UNTRUSTED.test(start[2])) offenders.push(`${file}:${i + 1}`); return; }
      if (runIndent >= 0 && UNTRUSTED.test(line)) offenders.push(`${file}:${i + 1}`);
    });
  }
  expect(offenders, 'move these into an env: variable and use "$NAME" in the script').toEqual([]);
});

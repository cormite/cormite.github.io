# Analytics Event Map

This document defines the Google Analytics 4 events intentionally tracked by the site.

## Principles

- Track only meaningful user actions.
- Keep event names stable over time.
- Prefer a small set of well-structured parameters over many ad hoc parameters.
- Avoid tracking sensitive personal data.
- Preserve multilingual context through `page_language`.

## Common Parameter

All tracked events include:

- `page_language`
  - Values: `en`, `es`, `it`

## Events

### `cv_download`

Triggered when a user clicks a CV download button.

Parameters:

- `source`
  - Values: `hero`, `about`
- `file_name`
  - Example: `carlos-fernandez-san-millan-en.pdf`

### `contact_email_draft_opened`

Triggered when a user initiates email contact.

Sources:

- Hero contact CTA
- Contact form submit action

Parameters:

- `method`
  - Values: `hero_cta`, `contact_form`
- `has_name`
  - Boolean, form flow only
- `has_email`
  - Boolean, form flow only
- `has_message`
  - Boolean, form flow only

Note:

- Do not send the actual name, email, or message content to analytics.

### `language_switch`

Triggered when a user clicks a language switcher control.

Parameters:

- `target_language`
  - Values: `en`, `es`, `it`

### `social_link_click`

Triggered when a user clicks an outbound social/profile link.

Parameters:

- `platform`
  - Values currently inferred: `linkedin`, `github`, `website`, `external`, `unknown`
- `location`
  - Values: `hero`, `contact`
- `destination`
  - Example: `https://linkedin.com/in/carlosfernandezsanmillan`

## Implementation Source

Current implementation lives in:

- `assets/js/site-interactions.js`

## Change Rules

When adding or changing analytics:

1. Update this document first.
2. Keep event names backward-compatible when possible.
3. Avoid renaming parameters unless there is a strong reason.
4. Validate in GA4 Realtime after deployment.
5. Recheck privacy implications before tracking new user inputs or identifiers.

## Validation Checklist

After deployment, verify in GA4 Realtime that these actions produce events:

1. Download CV from hero section
2. Download CV from about section
3. Click hero contact CTA
4. Submit contact form
5. Switch language
6. Click LinkedIn/GitHub/profile links

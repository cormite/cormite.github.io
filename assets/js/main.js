'use strict';

(function bootstrapSite(global) {
  const utils = global.__SITE_UTILS || {};
  const render = global.__SITE_RENDER || {};
  const interactions = global.__SITE_INTERACTIONS || {};

  const { onReady } = utils;
  const { detectLanguage, setCurrentLanguage, renderAll } = render;
  const { enhanceUi, refreshAnimatedUi } = interactions;

  if (!onReady || !detectLanguage || !setCurrentLanguage || !renderAll || !enhanceUi || !refreshAnimatedUi) {
    throw new Error('Site bootstrap dependencies are missing');
  }

  function bootstrap() {
    try {
      setCurrentLanguage(detectLanguage());
      renderAll();
      enhanceUi();
    } catch (error) {
      console.error('Site bootstrap failed:', error);
      setCurrentLanguage(render.DEFAULT_LANG || 'en');
      renderAll();
      refreshAnimatedUi();
    }
  }

  onReady(bootstrap);
}(globalThis));

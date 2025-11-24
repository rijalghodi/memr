import type { Plugin } from "vite";

import { BRAND } from "./lib/brand";

export function htmlMetaPlugin(): Plugin {
  return {
    name: "html-meta",
    transformIndexHtml(html) {
      const metaTags = [
        `<meta name="description" content="${BRAND.SITE_DESCRIPTION}" />`,
        `<meta name="keywords" content="${BRAND.KEYWORDS.join(", ")}" />`,
        `<meta name="author" content="${BRAND.AUTHOR}" />`,
        `<meta property="og:type" content="website" />`,
        `<meta property="og:site_name" content="${BRAND.SITE_NAME}" />`,
        `<meta property="og:title" content="${BRAND.APP_NAME} - ${BRAND.APP_TAGLINE}" />`,
        `<meta property="og:description" content="${BRAND.SITE_DESCRIPTION}" />`,
        `<meta property="og:image" content="${BRAND.OG_IMAGE_URL}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${BRAND.APP_NAME} - ${BRAND.APP_TAGLINE}" />`,
        `<meta name="twitter:description" content="${BRAND.SITE_DESCRIPTION}" />`,
        `<meta name="twitter:image" content="${BRAND.OG_IMAGE_URL}" />`,
      ].join("\n    ");

      // Replace the existing title tag
      let result = html.replace(
        /<title>.*?<\/title>/,
        `<title>${BRAND.APP_NAME} - ${BRAND.APP_TAGLINE}</title>`,
      );

      // Inject meta tags before the closing </head> tag
      result = result.replace(/<\/head>/, `    ${metaTags}\n  </head>`);

      return result;
    },
  };
}

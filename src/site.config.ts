import type { SiteConfig } from "./types";
import type { AstroExpressiveCodeOptions } from "astro-expressive-code";

export const siteConfig: SiteConfig = {
  // Used as both a meta property (src/components/BaseHead.astro L:31 + L:49) & the generated satori png (src/pages/og-image/[slug].png.ts)
  author: "kush1jpeg",
  // Date.prototype.toLocaleDateString() parameters, found in src/utils/date.ts.
  date: {
    locale: "en-GB",
    options: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  },
  // Used as the default description meta property and webmanifest description
  description: "journey of your 10x dev",
  // HTML lang property, found in src/layouts/Base.astro L:18 & astro.config.ts L:48
  lang: "en-GB",
  // Meta property, found in src/components/BaseHead.astro L:42
  ogLocale: "en_GB",
  /*
		- Used to construct the meta title property found in src/components/BaseHead.astro L:11
		- The webmanifest name found in astro.config.ts L:42
		- The link value found in src/components/layout/Header.astro L:35 - In the footer found in src/components/layout/Footer.astro L:12 */
  title: "malloc(brain)",
  // ! Please remember to replace the following site property with your own domain, used in astro.config.ts
  url: "https://kush1jpeg.github.io",
};

// Used to generate links in both the Header & Footer.
export const menuLinks: { path: string; title: string; target?: "_blank" }[] = [
  {
    path: "/posts/",
    title: "Blogs",
  },
  {
    path: "/projects/",
    title: "Projects",
  },
  {
    path: "/essays/",
    title: "Essays",
  },
  {
    path: "/about/",
    title: "About",
  },
  {
    title: "Resume",
    path: "/assets/Kushagra_Gupta_Backend_Intern_Resume.pdf",
  },
];

// https://expressive-code.com/reference/configuration/
export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
  styleOverrides: {
    borderRadius: "4px",
    codeFontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    codeFontSize: "0.875rem",
    codeLineHeight: "1.7142857rem",
    codePaddingInline: "1rem",
    frames: {
      frameBoxShadowCssValue: "none",
    },
    uiLineHeight: "inherit",
  },
  themeCssSelector(theme, { styleVariants }) {
    // If one dark and one light theme are available
    // generate theme CSS selectors compatible with cactus-theme dark mode switch
    if (styleVariants.length >= 2) {
      const baseTheme = styleVariants[0]?.theme;
      const altTheme = styleVariants.find(
        (v) => v.theme.type !== baseTheme?.type,
      )?.theme;
      if (theme === baseTheme || theme === altTheme)
        return `[data-theme='${theme.type}']`;
    }
    // return default selector
    return `[data-theme="${theme.name}"]`;
  },
  // One dark, one light theme => https://expressive-code.com/guides/themes/#available-themes
  themes: ["kanagawa-wave", "gruvbox-light-hard"], //expressive-code lets you define multiple themes and then select one acc to themeCssSelector
  useThemedScrollbars: true,
};

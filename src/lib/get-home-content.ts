import { homeContentByLocale, type HomeContent, type Locale } from "@/content/home-content";

// Static fallback accessor used when CMS content is unavailable.
export function getHomeContent(locale: Locale): HomeContent {
  return homeContentByLocale[locale] ?? homeContentByLocale.en;
}

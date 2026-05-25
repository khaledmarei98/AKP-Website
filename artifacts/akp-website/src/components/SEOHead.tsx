import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  keywords?: string;
  noindex?: boolean;
}

const SITE_NAME = "AKP Consulting";
const DEFAULT_DESCRIPTION =
  "AKP Consulting — Egypt's premier accounting, tax, HR, and ERP consulting firm. Big 4-caliber expertise for Egyptian businesses.";
const DEFAULT_IMAGE = "/opengraph.jpg";
const SITE_URL = "https://akp-consulting.com";

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  keywords,
  noindex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Accounting, Tax & HR Excellence`;
  const fullImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const canonicalUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  useEffect(() => {
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    if (keywords) setMeta("name", "keywords", keywords);

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", fullImage);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", SITE_NAME);

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", fullImage);

    setCanonical(canonicalUrl);
  }, [fullTitle, description, fullImage, canonicalUrl, type, keywords, noindex]);

  return null;
}

function setMeta(attrKey: "name" | "property", attrValue: string, content: string) {
  let el = document.querySelector(`meta[${attrKey}="${attrValue}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrKey, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", url);
}

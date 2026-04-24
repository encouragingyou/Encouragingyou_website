import contactInfo from "../../content/contactInfo/default.json" with { type: "json" };
import { getSiteSettings } from "./content-source-adapter.ts";
import { buildAbsoluteSiteUrl } from "./discovery.js";

function cleanStructuredDataValue(value) {
  if (Array.isArray(value)) {
    const cleanedItems = value
      .map((item) => cleanStructuredDataValue(item))
      .filter((item) => item !== undefined);

    return cleanedItems.length > 0 ? cleanedItems : undefined;
  }

  if (value && typeof value === "object") {
    const cleanedEntries = Object.entries(value)
      .map(([key, entryValue]) => [key, cleanStructuredDataValue(entryValue)])
      .filter(([, entryValue]) => entryValue !== undefined);

    return cleanedEntries.length > 0 ? Object.fromEntries(cleanedEntries) : undefined;
  }

  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  return value;
}

export function cleanStructuredData(value) {
  return cleanStructuredDataValue(value);
}

export function buildOrganizationReference() {
  const siteSettings = getSiteSettings();
  const contactPoint = {
    "@type": "ContactPoint",
    contactType: "general enquiries",
    email: contactInfo.publicEmail,
    areaServed: contactInfo.serviceAreaLabel,
    availableLanguage: "en-GB"
  };

  if (contactInfo.publicPhone) {
    contactPoint.telephone = contactInfo.publicPhone;
  }

  return cleanStructuredData({
    "@type": "Organization",
    name: siteSettings.legalName,
    url: siteSettings.siteUrl,
    email: contactInfo.publicEmail,
    sameAs: siteSettings.socialLinks.map((link) => link.url),
    areaServed: contactInfo.serviceAreaLabel,
    contactPoint: [contactPoint]
  });
}

export function buildSiteOrganizationStructuredData() {
  const siteSettings = getSiteSettings();
  return cleanStructuredData({
    "@context": "https://schema.org",
    ...buildOrganizationReference(),
    description: siteSettings.missionSummary
  });
}

export function buildWebsiteStructuredData({ description }) {
  const siteSettings = getSiteSettings();
  return cleanStructuredData({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteSettings.siteName,
    url: siteSettings.siteUrl,
    description,
    inLanguage: "en-GB"
  });
}

export function buildBreadcrumbStructuredData(items) {
  if (!items?.length) {
    return null;
  }

  return cleanStructuredData({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: buildAbsoluteSiteUrl(item.href)
    }))
  });
}

function resolveImageUrls(image) {
  if (!image) {
    return undefined;
  }

  const url = typeof image === "string" ? image : image.url;

  return url ? [url] : undefined;
}

/**
 * @param {{
 *   meta: any;
 *   type?: string;
 *   name?: any;
 *   description?: any;
 *   dateModified?: any;
 *   about?: any;
 *   isPartOf?: any;
 *   hasPart?: any;
 *   relatedLink?: any;
 *   mainEntity?: any;
 *   image?: any;
 * }} options
 */
export function buildWebPageStructuredData({
  meta,
  type = "WebPage",
  name = undefined,
  description = undefined,
  dateModified = undefined,
  about = undefined,
  isPartOf = undefined,
  hasPart = undefined,
  relatedLink = undefined,
  mainEntity = undefined,
  image = undefined
}) {
  const siteSettings = getSiteSettings();
  return cleanStructuredData({
    "@context": "https://schema.org",
    "@type": type,
    name: name ?? meta.title,
    url: meta.canonicalUrl,
    description: description ?? meta.description,
    isPartOf:
      isPartOf ??
      cleanStructuredData({
        "@type": "WebSite",
        name: siteSettings.siteName,
        url: siteSettings.siteUrl
      }),
    dateModified,
    about,
    hasPart,
    relatedLink,
    mainEntity,
    image: resolveImageUrls(image ?? meta.openGraph.image)
  });
}

export function buildCollectionPageStructuredData({ meta, itemList, breadcrumbs }) {
  const entries = [
    buildWebPageStructuredData({
      meta,
      type: "CollectionPage"
    })
  ];

  if (itemList?.length) {
    entries.push(
      cleanStructuredData({
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: itemList.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: buildAbsoluteSiteUrl(item.href),
          name: item.name
        }))
      })
    );
  }

  const breadcrumbSchema = buildBreadcrumbStructuredData(breadcrumbs);

  if (breadcrumbSchema) {
    entries.push(breadcrumbSchema);
  }

  return entries;
}

export function buildAboutPageStructuredData({ meta, breadcrumbs }) {
  const siteSettings = getSiteSettings();
  return [
    buildWebPageStructuredData({
      meta,
      type: "AboutPage",
      about: cleanStructuredData({
        "@type": "Organization",
        name: siteSettings.legalName,
        description: siteSettings.missionSummary,
        areaServed: siteSettings.serviceAreaLabel,
        sameAs: siteSettings.socialLinks.map((link) => link.url)
      })
    }),
    buildBreadcrumbStructuredData(breadcrumbs)
  ].filter(Boolean);
}

export function buildContactPageStructuredData({ meta, breadcrumbs }) {
  return [
    buildWebPageStructuredData({
      meta,
      type: "ContactPage",
      about: buildOrganizationReference(),
      mainEntity: buildOrganizationReference()
    }),
    buildBreadcrumbStructuredData(breadcrumbs)
  ].filter(Boolean);
}

export function buildFaqPageStructuredData(faqItems) {
  if (!faqItems?.length) {
    return null;
  }

  return cleanStructuredData({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  });
}

export function buildServiceStructuredData({
  name,
  description,
  areaServed = contactInfo.serviceAreaLabel,
  includeContext = true
}) {
  const siteSettings = getSiteSettings();
  return cleanStructuredData({
    "@context": includeContext ? "https://schema.org" : undefined,
    "@type": "Service",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: siteSettings.legalName,
      url: siteSettings.siteUrl
    },
    areaServed
  });
}

export function buildEditorialEventStructuredData({
  meta,
  name,
  description,
  startDate,
  endDate,
  eventStatus,
  locationLabel,
  image
}) {
  const siteSettings = getSiteSettings();
  return cleanStructuredData({
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description,
    url: meta.canonicalUrl,
    startDate,
    endDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus,
    location: locationLabel
      ? {
          "@type": "Place",
          name: locationLabel
        }
      : undefined,
    image: resolveImageUrls(image ?? meta.openGraph.image),
    organizer: {
      "@type": "Organization",
      name: siteSettings.legalName,
      url: siteSettings.siteUrl
    }
  });
}

export function buildArticleStructuredData({
  meta,
  headline,
  description,
  datePublished,
  expires,
  articleSection,
  image
}) {
  const siteSettings = getSiteSettings();
  return cleanStructuredData({
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: meta.canonicalUrl,
    datePublished,
    expires,
    articleSection,
    image: resolveImageUrls(image ?? meta.openGraph.image),
    author: {
      "@type": "Organization",
      name: siteSettings.legalName
    },
    publisher: {
      "@type": "Organization",
      name: siteSettings.legalName,
      url: siteSettings.siteUrl
    }
  });
}

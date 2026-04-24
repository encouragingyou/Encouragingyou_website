function buildMailtoHref(email) {
  return `mailto:${email}`;
}

function buildTelHref(phoneNumber) {
  return `tel:${phoneNumber.replace(/[^\d+]/gu, "")}`;
}

function getPrimarySocialLink(siteSettings) {
  return (
    siteSettings.socialLinks.find((link) => /instagram/iu.test(link.label)) ??
    siteSettings.socialLinks[0] ??
    null
  );
}

function extractInstagramHandle(url) {
  const match = url.match(/instagram\.com\/([^/?#]+)/iu);

  return match ? `@${match[1]}` : url;
}

export function deriveContactRouteState(contactInfo, siteSettings) {
  const primarySocialLink = getPrimarySocialLink(siteSettings);
  const phoneState = contactInfo.publicPhone
    ? "available"
    : contactInfo.publicPhoneStatus === "placeholder"
      ? "withheld"
      : "unavailable";
  const mapState = contactInfo.mapEmbedAllowedAtLaunch
    ? "embedded"
    : contactInfo.locationGuidance.publicDirectionsUrl
      ? "link-only"
      : "withheld";

  return {
    email: {
      state: "available",
      value: contactInfo.publicEmail,
      href: buildMailtoHref(contactInfo.publicEmail),
      statusLabel: "Primary public route"
    },
    phone: {
      state: phoneState,
      value: contactInfo.publicPhone,
      href: contactInfo.publicPhone ? buildTelHref(contactInfo.publicPhone) : null,
      statusLabel:
        phoneState === "available" ? "Phone published" : "Phone not published yet"
    },
    social: {
      state: primarySocialLink ? "available" : "unavailable",
      label: primarySocialLink?.label ?? "Social",
      value: primarySocialLink ? extractInstagramHandle(primarySocialLink.url) : null,
      href: primarySocialLink?.url ?? null,
      statusLabel: primarySocialLink
        ? "Social route available"
        : "No social route published"
    },
    location: {
      localityLabel: contactInfo.locationGuidance.generalLocalityLabel,
      venueState:
        contactInfo.venueDisclosurePolicy === "public-address" && contactInfo.venueAddress
          ? "public-address"
          : "shared-on-enquiry",
      mapState,
      publicDirectionsLabel: contactInfo.locationGuidance.publicDirectionsLabel,
      publicDirectionsUrl: contactInfo.locationGuidance.publicDirectionsUrl
    }
  };
}

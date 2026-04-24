export type ActionVariant = "primary" | "secondary" | "surface" | "text";
export type ShellNoticeTone = "info" | "important";

export type MediaKind = "illustration" | "icon";
export type MediaAltStrategy = "descriptive" | "decorative";
export type MediaOutputFormat = "avif" | "webp" | "png" | "svg";
export type MediaSourceType =
  | "ai-generated-people-illustration"
  | "ai-generated-symbolic-illustration"
  | "ai-generated-icon"
  | "consented-documentary-photo"
  | "consented-team-photo"
  | "consented-event-photo";
export type MediaParticipantRepresentation =
  | "synthetic-people"
  | "synthetic-symbolic"
  | "synthetic-icon"
  | "real-people"
  | "none";
export type MediaTrustImpact =
  | "atmospheric"
  | "wayfinding"
  | "narrative"
  | "trust-sensitive"
  | "evidence-bearing";
export type MediaEvidenceUse =
  | "illustrative-only"
  | "wayfinding-only"
  | "documentary-evidence"
  | "proof-supporting";
export type MediaConsentStatus =
  | "not-applicable-synthetic"
  | "required-before-use"
  | "pending-approval"
  | "approved-for-launch"
  | "approved-time-limited";
export type MediaReviewCadence = "change-driven" | "time-limited-before-reuse";
export type MediaSafeguardingSensitivity = "low" | "elevated" | "high";
export type MediaReplacementSourceType =
  | "consented-documentary-photo"
  | "consented-team-photo"
  | "consented-event-photo"
  | "vector-icon";
export type MediaDisclosureContext =
  | "hero"
  | "feature"
  | "narrative"
  | "detail"
  | "card"
  | "listing"
  | "sitewide";
export type MediaDisclosureVariant = "prominent" | "compact" | "sitewide";
export type StaticImageFormat =
  | "avif"
  | "webp"
  | "svg"
  | "png"
  | "jpeg"
  | "jpg"
  | "tiff"
  | "gif";
export type MediaProvenance =
  | "supplied-ai-illustration-master"
  | "supplied-ai-icon-master";
export type MediaReplacementPriority =
  | "keep-for-launch"
  | "replace-trust-critical-first"
  | "vectorize-after-launch";

export interface ActionLink {
  label: string;
  href: string;
  variant: ActionVariant;
}

export interface ShellLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface RelatedLinkGroup {
  title: string;
  links: ShellLink[];
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface ShellNotice {
  id: string;
  title: string;
  body: string;
  tone: ShellNoticeTone;
  action?: ShellLink;
}

export interface FooterGroup {
  title: string;
  items: ShellLink[];
}

export interface FooterSupportModel {
  eyebrow: string;
  title: string;
  summary: string;
  primaryAction: ActionLink;
  secondaryAction?: ActionLink;
}

export interface GlobalShellModel {
  brand: {
    name: string;
    tag: string;
    summary: string;
  };
  skipLinks: ShellLink[];
  utilityItems: ShellLink[];
  primaryItems: ShellLink[];
  headerCta: ShellLink;
  footerGroups: FooterGroup[];
  footerSupport: FooterSupportModel;
  publicEmail: string;
  serviceAreaLabel: string;
  aiDisclosure: MediaDisclosure | null;
  breadcrumbs: BreadcrumbItem[];
  backLink: ShellLink | null;
  notices: ShellNotice[];
  relatedLinkGroup: RelatedLinkGroup | null;
}

export interface SeoMetaImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface SeoMetadata {
  title: string;
  description: string;
  summary: string;
  canonicalPath: string;
  canonicalUrl: string;
  robots: string;
  indexable: boolean;
  breadcrumbLabel: string;
  openGraph: {
    title: string;
    description: string;
    type: "website" | "article";
    url: string;
    siteName: string;
    locale: string;
    image: SeoMetaImage | null;
  };
  twitter: {
    card: "summary" | "summary_large_image";
    title: string;
    description: string;
    image: SeoMetaImage | null;
  };
}

export interface CompatibilityRender {
  publicPath: string;
  format: MediaOutputFormat;
  width: number | null;
  height: number | null;
}

export interface MediaDeliveryContract {
  formats: MediaOutputFormat[];
  responsiveWidths: number[] | null;
  defaultWidth: number | null;
  fixedWidth: number | null;
  fixedHeight: number | null;
}

export interface MediaDisclosureRules {
  mode: "none" | "contextual";
  defaultVariant: MediaDisclosureVariant;
  prominentContexts: Exclude<MediaDisclosureContext, "sitewide">[];
  compactContexts: Exclude<MediaDisclosureContext, "sitewide">[];
}

export interface MediaDisclosure {
  noticeId: string;
  title?: string;
  text: string;
  variant: MediaDisclosureVariant;
  context: MediaDisclosureContext;
}

export interface MediaAsset {
  id: string;
  kind: MediaKind;
  family: string;
  label: string;
  canonicalSourcePath: string;
  masterAssetPath: string;
  provenance: MediaProvenance;
  masterDimensions: {
    width: number;
    height: number;
  };
  focalIntent: string;
  altStrategy: MediaAltStrategy;
  alt: string;
  decorative: boolean;
  caption: string | null;
  aiGenerated: boolean;
  requiresDisclosure: boolean;
  sourceType: MediaSourceType;
  participantRepresentation: MediaParticipantRepresentation;
  trustImpact: MediaTrustImpact;
  evidenceUse: MediaEvidenceUse;
  consentStatus: MediaConsentStatus;
  reviewCadence: MediaReviewCadence;
  reviewExpiry: string | null;
  safeguardingSensitivity: MediaSafeguardingSensitivity;
  restrictedRouteFamilies: string[];
  launchApproved: boolean;
  noticeId?: string | null;
  replacementPriority: MediaReplacementPriority;
  replacementSourceType: MediaReplacementSourceType;
  replacementNotes: string;
  disclosure: MediaDisclosureRules;
  preferredContexts: string[];
  astroDelivery: MediaDeliveryContract;
  compatibilityRenders: CompatibilityRender[];
  aspectRatio: number;
}

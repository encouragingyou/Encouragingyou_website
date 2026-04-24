import consentAwareMicrocopy from "../../content/consentAwareMicrocopy/default.json" with { type: "json" };
import ctaBlocks from "../../content/ctaBlocks/default.json" with { type: "json" };
import discovery from "../../content/discovery/default.json" with { type: "json" };
import editorialSystem from "../../content/editorialSystem/default.json" with { type: "json" };
import legalPages from "../../content/legalPages/default.json" with { type: "json" };
import navigation from "../../content/navigation/default.json" with { type: "json" };
import notices from "../../content/notices/default.json" with { type: "json" };
import pageDefinitions from "../../content/pageDefinitions/launch.json" with { type: "json" };
import resilienceStates from "../../content/resilienceStates/default.json" with { type: "json" };
import cmsPublicReadModel from "../../data/generated/cms-public-read-model.json" with { type: "json" };
import trustSignals from "../../content/trustSignals/default.json" with { type: "json" };
import { resolvePublicSiteUrl } from "../deployment/context.js";

const allPages = [
  ...pageDefinitions.launchPages,
  ...pageDefinitions.placeholderPages,
  ...pageDefinitions.phaseTwoPages
];

const cmsCollections = cmsPublicReadModel.collections;
const accessibilityStatement = cmsCollections.accessibilityStatement;
const contactInfo = cmsCollections.contactInfo;
const faqs = cmsCollections.faqs;
const formSurfaces = cmsCollections.formSurfaces;
const homePage = cmsCollections.homePage;
const involvementRoutes = cmsCollections.involvementRoutes;
const privacyNotice = cmsCollections.privacyNotice;
const programmePageContent = cmsCollections.programmePageContent;
const routePages = cmsCollections.routePages;
const safeguardingInfo = cmsCollections.safeguardingInfo;
const seo = cmsCollections.seo;
const sessionPageContent = cmsCollections.sessionPageContent;
const sitePolicy = cmsCollections.sitePolicy;
const siteSettings = cmsCollections.siteSettings;
const storageAccess = cmsCollections.storageAccess;
const updatesFeed = cmsCollections.updatesFeed;
const programmes = cmsCollections.programmes.items;
const sessions = cmsCollections.sessions.items;

const pageIndex = new Map(allPages.map((page) => [page.id, page]));
const noticeIndex = new Map(notices.notices.map((notice) => [notice.id, notice]));
const ctaIndex = new Map(ctaBlocks.blocks.map((block) => [block.id, block]));
const faqGroupIndex = new Map(faqs.groups.map((group) => [group.id, group]));
const trustSignalIndex = new Map(
  trustSignals.signals.map((signal) => [signal.id, signal])
);
const involvementRouteIndex = new Map(
  involvementRoutes.routes.map((route) => [route.id, route])
);
const legalPageIndex = new Map(legalPages.pages.map((page) => [page.id, page]));
const programmeIndex = new Map(
  programmes.map((programme) => [programme.slug, programme])
);
const sessionIndex = new Map(sessions.map((session) => [session.slug, session]));
const routePageIndex = new Map(routePages.pages.map((page) => [page.pageId, page]));
const sessionPageContentIndex = new Map(
  sessionPageContent.pages.map((page) => [page.pageId, page])
);
const programmePageContentIndex = new Map(
  programmePageContent.pages.map((page) => [page.pageId, page])
);
const formSurfaceIndex = new Map(
  formSurfaces.surfaces.map((surface) => [surface.id, surface])
);

export function getAllPages() {
  return allPages;
}

export function getPageById(pageId: string) {
  return pageIndex.get(pageId);
}

export function getNoticeById(noticeId: string) {
  return noticeIndex.get(noticeId);
}

export function getCtaById(ctaId: string) {
  return ctaIndex.get(ctaId);
}

export function getFaqGroupById(groupId: string) {
  return faqGroupIndex.get(groupId);
}

export function getTrustSignalById(signalId: string) {
  return trustSignalIndex.get(signalId);
}

export function getInvolvementRouteById(routeId: string) {
  return involvementRouteIndex.get(routeId);
}

export function getLegalPageById(pageId: string) {
  return legalPageIndex.get(pageId);
}

export function getPrivacyNoticeContent() {
  return privacyNotice;
}

export function getAccessibilityStatementContent() {
  return accessibilityStatement;
}

export function getSitePolicyContent() {
  return sitePolicy;
}

export function getStorageAccessContent() {
  return storageAccess;
}

export function getConsentAwareMicrocopyContent() {
  return consentAwareMicrocopy;
}

export function listProgrammes() {
  return programmes;
}

export function getProgrammeBySlug(slug: string) {
  return programmeIndex.get(slug);
}

export function listSessions() {
  return sessions;
}

export function getSessionBySlug(slug: string) {
  return sessionIndex.get(slug);
}

export function getHomePageContent() {
  return homePage;
}

export function getUpdatesFeedContent() {
  return updatesFeed;
}

export function listUpdates() {
  return updatesFeed.items;
}

export function getNavigationContent() {
  return navigation;
}

export function getContactInfo() {
  return contactInfo;
}

export function getSiteSettings() {
  return {
    ...siteSettings,
    siteUrl: resolvePublicSiteUrl()
  };
}

export function getSafeguardingInfo() {
  return safeguardingInfo;
}

export function getSeoContent() {
  return seo;
}

export function getDiscoveryContent() {
  return discovery;
}

export function getResilienceStateContent() {
  return resilienceStates;
}

export function getRoutePageContentById(pageId: string) {
  return routePageIndex.get(pageId);
}

export function getSessionPageContentById(pageId: string) {
  return sessionPageContentIndex.get(pageId);
}

export function getProgrammePageContentById(pageId: string) {
  return programmePageContentIndex.get(pageId);
}

export function getProgrammePageDefaults() {
  return programmePageContent.defaults;
}

export function getFormSurfaceById(surfaceId: string) {
  return formSurfaceIndex.get(surfaceId);
}

export function getEditorialSystem() {
  return editorialSystem;
}

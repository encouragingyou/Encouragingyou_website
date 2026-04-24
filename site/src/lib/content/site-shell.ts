import contactInfo from "../../content/contactInfo/default.json" with { type: "json" };
import navigation from "../../content/navigation/default.json" with { type: "json" };
import notices from "../../content/notices/default.json" with { type: "json" };
import pageDefinitions from "../../content/pageDefinitions/launch.json" with { type: "json" };
import shellConfig from "../../content/shellConfig/default.json" with { type: "json" };
import { getSiteSettings } from "./content-source-adapter.ts";
import { buildNoticeDisclosure } from "./media-disclosure.ts";
import type {
  ActionLink,
  FooterGroup,
  GlobalShellModel,
  RelatedLinkGroup,
  ShellLink,
  ShellNotice,
  ShellNoticeTone
} from "../types/site-ui";

type LinkRecord = {
  label: string;
  routeId?: string;
  href?: string;
  external?: boolean;
};

const allPages = [
  ...pageDefinitions.launchPages,
  ...pageDefinitions.placeholderPages,
  ...pageDefinitions.phaseTwoPages
];

const pageIndex = new Map(allPages.map((page) => [page.id, page]));
const noticeIndex = new Map(notices.notices.map((notice) => [notice.id, notice]));
const headerCtaIndex = new Map(shellConfig.headerCtas.map((cta) => [cta.id, cta]));
const breadcrumbParentIndex = new Map(
  shellConfig.breadcrumbParents.map((entry) => [entry.pageId, entry.parentPageId])
);
const relatedRouteGroupIndex = new Map(
  shellConfig.relatedRouteGroups.flatMap((group) =>
    group.pageIds.map((pageId) => [pageId, group] as const)
  )
);

function getPageById(pageId: string) {
  return pageIndex.get(pageId);
}

function getPageRoute(pageId: string) {
  const page = getPageById(pageId);

  if (!page) {
    throw new Error(`Unknown page id: ${pageId}`);
  }

  return page.route;
}

function resolveLink(link: LinkRecord): ShellLink {
  return {
    label: link.label,
    href: link.href ?? getPageRoute(link.routeId as string),
    external: link.external ?? false
  };
}

function createAction(link: LinkRecord, variant: ActionLink["variant"]): ActionLink {
  return {
    ...resolveLink(link),
    variant
  };
}

function getHeaderCta(pageId: string): ShellLink {
  const ctaRule =
    shellConfig.pageHeaderCtas.find((rule) => rule.pageIds.includes(pageId)) ?? null;
  const ctaId = ctaRule?.ctaId ?? "join-session";
  const cta = headerCtaIndex.get(ctaId);

  if (!cta) {
    throw new Error(`Unknown header CTA id: ${ctaId}`);
  }

  return resolveLink(cta);
}

function getBreadcrumbs(pageId: string) {
  if (shellConfig.breadcrumbHiddenPageIds.includes(pageId)) {
    return [];
  }

  const page = getPageById(pageId);

  if (!page) {
    return [];
  }

  const breadcrumbTrail = [{ label: "Home", href: "/" }];
  const parentTrail = [];
  const visited = new Set([pageId]);
  let parentId = breadcrumbParentIndex.get(pageId) ?? null;

  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);

    const parentPage = getPageById(parentId);

    if (!parentPage) {
      break;
    }

    parentTrail.unshift({
      label: parentPage.title,
      href: parentPage.route
    });

    parentId = breadcrumbParentIndex.get(parentId) ?? null;
  }

  breadcrumbTrail.push(...parentTrail);
  breadcrumbTrail.push({
    label: page.title,
    href: page.route
  });

  return breadcrumbTrail;
}

function getBackLink(pageId: string): ShellLink | null {
  const parentId = breadcrumbParentIndex.get(pageId);

  if (!parentId) {
    return null;
  }

  const parentPage = getPageById(parentId);

  if (!parentPage) {
    return null;
  }

  return {
    label: `Back to ${parentPage.title}`,
    href: parentPage.route
  };
}

function getShellNotices(pageId: string): ShellNotice[] {
  return shellConfig.noticePlacements
    .filter((placement) => placement.placement === "before-content")
    .filter((placement) => placement.pageIds.includes(pageId))
    .map((placement) => {
      const notice = noticeIndex.get(placement.noticeId);

      if (!notice) {
        throw new Error(`Unknown notice id: ${placement.noticeId}`);
      }

      return {
        id: notice.id,
        title: notice.title,
        body: notice.text,
        tone: notice.severity as ShellNoticeTone,
        action: placement.action ? resolveLink(placement.action) : undefined
      };
    });
}

function getRelatedLinkGroup(pageId: string): RelatedLinkGroup | null {
  const group = relatedRouteGroupIndex.get(pageId);

  if (!group) {
    return null;
  }

  return {
    title: group.title,
    links: group.links.map(resolveLink)
  };
}

export function getGlobalShellModel(pageId: string): GlobalShellModel {
  const siteSettings = getSiteSettings();
  const footerSupport = shellConfig.footerSupport;

  return {
    brand: {
      name: siteSettings.siteName,
      tag: `Youth-led support in ${siteSettings.serviceAreaLabel}`,
      summary: siteSettings.missionSummary
    },
    skipLinks: shellConfig.skipLinks.map((link) => ({
      label: link.label,
      href: link.href
    })),
    utilityItems: shellConfig.utilityItems.map(resolveLink),
    primaryItems: navigation.primaryItems.map((item) => ({
      label: item.label,
      href: getPageRoute(item.routeId)
    })),
    headerCta: getHeaderCta(pageId),
    footerGroups: navigation.footerGroups.map<FooterGroup>((group) => ({
      title: group.title,
      items: group.items.map(resolveLink)
    })),
    footerSupport: {
      eyebrow: footerSupport.eyebrow,
      title: footerSupport.title,
      summary: footerSupport.summary,
      primaryAction: createAction(footerSupport.primaryAction, "primary"),
      secondaryAction: footerSupport.secondaryAction
        ? createAction(footerSupport.secondaryAction, "surface")
        : undefined
    },
    publicEmail: contactInfo.publicEmail,
    serviceAreaLabel: siteSettings.serviceAreaLabel,
    aiDisclosure: buildNoticeDisclosure("ai-illustration", "sitewide", "sitewide"),
    breadcrumbs: getBreadcrumbs(pageId),
    backLink: getBackLink(pageId),
    notices: getShellNotices(pageId),
    relatedLinkGroup: getRelatedLinkGroup(pageId)
  };
}

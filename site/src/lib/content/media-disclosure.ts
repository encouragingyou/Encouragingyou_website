import { getNoticeById } from "./content-source-adapter.ts";
import type {
  MediaAsset,
  MediaDisclosure,
  MediaDisclosureContext,
  MediaDisclosureVariant
} from "../types/site-ui";

function getNoticeVariantText(
  noticeId: string,
  variant: MediaDisclosureVariant
): { title?: string; text: string } | null {
  const notice = getNoticeById(noticeId);

  if (!notice) {
    return null;
  }

  const text =
    variant === "sitewide"
      ? (notice.variants?.sitewide ?? notice.text)
      : variant === "compact"
        ? (notice.variants?.compact ?? notice.text)
        : (notice.variants?.prominent ?? notice.text);

  return {
    title: notice.title,
    text
  };
}

function getDisclosureVariant(
  asset: MediaAsset,
  context: Exclude<MediaDisclosureContext, "sitewide">
) {
  if (asset.disclosure.compactContexts.includes(context)) {
    return "compact";
  }

  if (asset.disclosure.prominentContexts.includes(context)) {
    return "prominent";
  }

  return asset.disclosure.defaultVariant === "sitewide"
    ? "prominent"
    : asset.disclosure.defaultVariant;
}

export function buildMediaDisclosure(
  asset: MediaAsset | null | undefined,
  context: Exclude<MediaDisclosureContext, "sitewide">
): MediaDisclosure | null {
  if (!asset?.requiresDisclosure || !asset.noticeId || asset.disclosure.mode === "none") {
    return null;
  }

  const variant = getDisclosureVariant(asset, context);
  const notice = getNoticeVariantText(asset.noticeId, variant);

  if (!notice) {
    return null;
  }

  return {
    noticeId: asset.noticeId,
    title: notice.title,
    text: notice.text,
    variant,
    context
  };
}

export function buildNoticeDisclosure(
  noticeId: string,
  variant: MediaDisclosureVariant,
  context: MediaDisclosureContext
): MediaDisclosure | null {
  const notice = getNoticeVariantText(noticeId, variant);

  if (!notice) {
    return null;
  }

  return {
    noticeId,
    title: notice.title,
    text: notice.text,
    variant,
    context
  };
}

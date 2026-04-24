function sortRendersByWidth(renders) {
  return [...renders].sort((left, right) => {
    const leftWidth = left.width ?? left.height ?? 0;
    const rightWidth = right.width ?? right.height ?? 0;

    return leftWidth - rightWidth;
  });
}

function getFormatPreferenceOrder(asset) {
  return asset.astroDelivery.formats.length > 0
    ? asset.astroDelivery.formats
    : [...new Set(asset.compatibilityRenders.map((render) => render.format))];
}

function getFormatRenders(asset, format) {
  return sortRendersByWidth(
    asset.compatibilityRenders.filter((render) => render.format === format)
  );
}

function getPreferredFormat(asset) {
  const formatOrder = getFormatPreferenceOrder(asset);

  return formatOrder.includes("webp") ? "webp" : (formatOrder[0] ?? null);
}

function getTargetWidth(asset) {
  return asset.astroDelivery.defaultWidth ?? asset.astroDelivery.fixedWidth ?? null;
}

export function getMediaMimeType(format) {
  return format === "svg" ? "image/svg+xml" : `image/${format}`;
}

export function getMediaFallbackRender(asset) {
  const preferredFormat = getPreferredFormat(asset);
  const preferredRenders = preferredFormat
    ? getFormatRenders(asset, preferredFormat)
    : [];
  const targetWidth = getTargetWidth(asset);

  if (preferredRenders.length === 0) {
    return null;
  }

  if (targetWidth !== null) {
    const exactMatch = preferredRenders.find((render) => render.width === targetWidth);

    if (exactMatch) {
      return exactMatch;
    }

    const largerMatch = preferredRenders.find(
      (render) => typeof render.width === "number" && render.width >= targetWidth
    );

    if (largerMatch) {
      return largerMatch;
    }
  }

  return preferredRenders[preferredRenders.length - 1];
}

export function getMediaDimensions(asset) {
  const fallbackRender = getMediaFallbackRender(asset);

  return {
    width:
      asset.astroDelivery.fixedWidth ??
      fallbackRender?.width ??
      asset.masterDimensions.width,
    height:
      asset.astroDelivery.fixedHeight ??
      fallbackRender?.height ??
      asset.masterDimensions.height
  };
}

export function getMediaPictureSources(asset) {
  const formatOrder = getFormatPreferenceOrder(asset);

  return formatOrder
    .map((format) => {
      const renders = getFormatRenders(asset, format);

      if (renders.length === 0) {
        return null;
      }

      return {
        format,
        mimeType: getMediaMimeType(format),
        srcset: renders
          .map((render) =>
            typeof render.width === "number"
              ? `${render.publicPath} ${render.width}w`
              : render.publicPath
          )
          .join(", ")
      };
    })
    .filter(Boolean);
}

export function getMediaPublicUrl(asset, siteUrl) {
  const fallbackRender = getMediaFallbackRender(asset);

  return fallbackRender ? new URL(fallbackRender.publicPath, siteUrl).toString() : null;
}

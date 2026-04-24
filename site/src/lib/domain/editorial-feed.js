const TYPE_LABELS = {
  event: "Event",
  update: "Update",
  opportunity: "Opportunity"
};

const EVENT_LIFECYCLE_LABELS = {
  "date-to-be-confirmed": "Dates to be confirmed",
  scheduled: "Upcoming event",
  postponed: "Postponed event",
  cancelled: "Cancelled event"
};

const UPDATE_LIFECYCLE_LABELS = {
  current: "Current",
  superseded: "Superseded",
  closed: "Closed"
};

export function buildEditorialDetailHref(input) {
  const slug = typeof input === "string" ? input : input.slug;

  return `/events-updates/${slug}/`;
}

function getReferenceDate(value = new Date()) {
  if (typeof value === "string") {
    return value;
  }

  return value.toISOString().slice(0, 10);
}

function formatIsoDate(value) {
  const [year, month, day] = value.split("-").map(Number);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function compareDesc(left, right) {
  if (left === right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return left > right ? -1 : 1;
}

function getLifecycleLabel(item, temporalState) {
  if (item.updateType === "event") {
    if (temporalState === "past-event") {
      return "Past event";
    }

    return (
      EVENT_LIFECYCLE_LABELS[item.eventLifecycle] ??
      item.statusLabel ??
      TYPE_LABELS[item.updateType]
    );
  }

  if (temporalState === "archived") {
    return "Archived";
  }

  return (
    UPDATE_LIFECYCLE_LABELS[item.updateLifecycle] ??
    item.statusLabel ??
    TYPE_LABELS[item.updateType]
  );
}

export function deriveEditorialItemState(item, options = {}) {
  const referenceDate = getReferenceDate(options.referenceDate);
  const archiveBehavior = item.archiveBehavior ?? "demote-to-feed";
  const isPublished = item.publicationStatus === "published";
  const isArchived = item.publicationStatus === "archived";
  const isDraft = item.publicationStatus === "draft";
  const comparisonEndDate = item.endDate ?? item.eventDate;
  const isPastEvent =
    item.updateType === "event" &&
    Boolean(comparisonEndDate) &&
    comparisonEndDate < referenceDate;
  const hasClosedDate =
    item.updateType !== "event" && Boolean(item.endDate) && item.endDate < referenceDate;
  const eventLifecycle =
    item.updateType === "event"
      ? (item.eventLifecycle ?? (item.eventDate ? "scheduled" : "date-to-be-confirmed"))
      : undefined;
  const updateLifecycle =
    item.updateType !== "event"
      ? (item.updateLifecycle ?? (hasClosedDate ? "closed" : "current"))
      : undefined;
  const temporalState =
    item.updateType === "event"
      ? eventLifecycle === "cancelled"
        ? "cancelled"
        : eventLifecycle === "postponed"
          ? "postponed"
          : isPastEvent
            ? "past-event"
            : eventLifecycle === "scheduled"
              ? "upcoming"
              : "date-to-be-confirmed"
      : isArchived
        ? "archived"
        : updateLifecycle;
  const detailTemplate = item.updateType === "event" ? "event-detail" : "update-detail";
  const detailVisible = !isDraft;
  const hiddenFromIndex =
    isDraft ||
    isArchived ||
    (item.updateType === "event" && isPastEvent && archiveBehavior === "remove") ||
    (item.updateType !== "event" && hasClosedDate && archiveBehavior === "remove");
  const indexVisible = isPublished && !hiddenFromIndex;
  const featuredEligible =
    isPublished &&
    !isArchived &&
    (item.updateType === "event"
      ? temporalState !== "past-event" && temporalState !== "cancelled"
      : temporalState !== "closed" && temporalState !== "superseded");
  const homeVisible =
    indexVisible &&
    item.showOnHome !== false &&
    (item.updateType === "event"
      ? temporalState !== "past-event" && temporalState !== "cancelled"
      : temporalState !== "closed" && temporalState !== "superseded");
  const metaRows = [];

  if (item.eventDate) {
    metaRows.push({
      kind: "date",
      label: formatIsoDate(item.eventDate)
    });
  } else if (item.dateLabel) {
    metaRows.push({
      kind: "date",
      label: item.dateLabel
    });
  } else if (item.publishDate) {
    metaRows.push({
      kind: "date",
      label: formatIsoDate(item.publishDate)
    });
  }

  if (item.timeLabel) {
    metaRows.push({
      kind: "time",
      label: item.timeLabel
    });
  }

  if (item.locationLabel) {
    metaRows.push({
      kind: "location",
      label: item.locationLabel
    });
  }

  if (item.statusLabel) {
    metaRows.push({
      kind: "status",
      label: item.statusLabel
    });
  }

  const lifecycleLabel = getLifecycleLabel(
    {
      ...item,
      eventLifecycle,
      updateLifecycle
    },
    temporalState
  );
  const metaLabel = [TYPE_LABELS[item.updateType], metaRows[0]?.label ?? lifecycleLabel]
    .filter(Boolean)
    .join(" · ");

  return {
    ...item,
    archiveBehavior,
    detailHref: buildEditorialDetailHref(item),
    detailTemplate,
    detailVisible,
    eventLifecycle,
    featuredEligible,
    hasClosedDate,
    homeVisible,
    indexVisible,
    isArchived,
    isDraft,
    isPastEvent,
    lifecycleLabel,
    metaLabel,
    metaRows,
    temporalState,
    typeLabel: TYPE_LABELS[item.updateType],
    updateLifecycle
  };
}

function sortEditorialItems(left, right) {
  return (
    (left.sortOrder ?? 0) - (right.sortOrder ?? 0) ||
    compareDesc(left.eventDate, right.eventDate) ||
    compareDesc(left.publishDate, right.publishDate) ||
    left.title.localeCompare(right.title)
  );
}

export function filterEditorialItems(items, filterId = "all") {
  if (filterId === "all") {
    return items;
  }

  return items.filter((item) => item.updateType === filterId);
}

export function buildEditorialFeedModel(feed, options = {}) {
  const allItems = feed.items
    .map((item) => deriveEditorialItemState(item, options))
    .sort(sortEditorialItems);
  const publicItems = allItems.filter((item) => item.indexVisible);
  const detailItems = allItems.filter((item) => item.detailVisible);
  const featuredItem =
    publicItems.find((item) => item.featured && item.featuredEligible) ?? null;
  const feedItems = publicItems.filter((item) => item.id !== featuredItem?.id);
  const homeItems = allItems.filter((item) => item.homeVisible);
  const categories = feed.categories.map((category) => {
    const count = publicItems.filter((item) => item.updateType === category.id).length;

    return {
      ...category,
      count,
      hasItems: count > 0
    };
  });

  return {
    ...feed,
    allItems,
    categories,
    detailItems,
    featuredItem,
    feedItems,
    homeItems,
    publicItems
  };
}

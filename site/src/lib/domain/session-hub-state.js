export function deriveSessionHubState(items) {
  const totalCount = items.length;
  const liveCount = items.filter((item) => item.state === "scheduled").length;
  const calendarCount = items.filter((item) => item.calendarState === "available").length;

  return {
    totalCount,
    liveCount,
    calendarCount,
    availability:
      liveCount === 0 ? "unavailable" : liveCount === totalCount ? "available" : "mixed",
    calendarAvailability:
      calendarCount === 0
        ? "unavailable"
        : calendarCount === totalCount
          ? "available"
          : "partial"
  };
}

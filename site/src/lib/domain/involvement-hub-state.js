function formatCountLabel(count) {
  return `${count} live Saturday ${count === 1 ? "session" : "sessions"}`;
}

export function selectInvolvementOpportunitySpotlight(items) {
  return (
    items.find((item) => item.featured && item.featuredEligible) ??
    items.find((item) => item.featuredEligible) ??
    items[0] ??
    null
  );
}

export function deriveInvolvementPathwayState(route, options = {}) {
  const {
    sessionAvailability = "available",
    liveCount = 0,
    opportunityItem = null
  } = options;

  if (route.pathState === "live-route") {
    if (sessionAvailability === "unavailable") {
      return {
        id: "sessions-limited",
        tone: "accent",
        statusLabel: "Dates confirmed directly",
        supportingText:
          "The Sessions hub is still the right public route, but current dates are limited enough that contact stays visible as a backup."
      };
    }

    if (sessionAvailability === "mixed") {
      return {
        id: "sessions-mixed",
        tone: "accent",
        statusLabel: "Some live support is visible now",
        supportingText:
          "Use Sessions for the clearest public detail, then contact the team if the route you expected is not currently live."
      };
    }

    return {
      id: "sessions-live",
      tone: "success",
      statusLabel: formatCountLabel(liveCount),
      supportingText:
        "Sessions is the clearest immediate route when you want live timings, reassurance, and practical next-step detail before you contact the team."
    };
  }

  if (route.pathState === "opportunity-route") {
    if (opportunityItem) {
      return {
        id: "opportunity-live",
        tone: "accent",
        statusLabel: "A current public opportunity is live",
        supportingText:
          "Use the opportunity spotlight for the current public note, or contact the team if your practical offer does not fit that published route."
      };
    }

    return {
      id: "opportunity-quiet",
      tone: "soft",
      statusLabel: "No separate public opportunity is live",
      supportingText:
        "The hub should still work when the editorial feed is quiet, so contact remains the clean fallback for wider practical support."
    };
  }

  if (route.pathState === "contact-led") {
    return {
      id: "contact-led",
      tone: "soft",
      statusLabel: route.statusLabel,
      supportingText: route.nextStep
    };
  }

  return {
    id: "route-ready",
    tone: "success",
    statusLabel: route.statusLabel,
    supportingText: route.nextStep
  };
}

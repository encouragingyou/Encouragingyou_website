const sessions = {
  "cv-support": {
    title: "CV support session",
    shortTitle: "CV support",
    slug: "/sessions/cv-support/",
    calendar: "/calendar/cv-support.ics",
    dayIndex: 6,
    startHour: 16,
    startMinute: 45,
    durationMinutes: 120,
    description:
      "One-to-one help with CVs, job applications, and practical next steps in Rochdale.",
    image: "https://www.encouragingyou.co.uk/images/career-support-960.webp"
  },
  "youth-club": {
    title: "Youth club session",
    shortTitle: "Youth club",
    slug: "/sessions/youth-club/",
    calendar: "/calendar/youth-club.ics",
    dayIndex: 6,
    startHour: 18,
    startMinute: 45,
    durationMinutes: 120,
    description:
      "Games, activities, chill time, and friendship-building in a safe, welcoming youth space.",
    image:
      "https://www.encouragingyou.co.uk/images/community-friendship-960.webp"
  }
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long"
});

const shortDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short"
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "full",
  timeStyle: "short"
});

function getNextOccurrence(session) {
  const now = new Date();
  const start = new Date(now);
  const daysUntil = (session.dayIndex - start.getDay() + 7) % 7;
  start.setDate(start.getDate() + daysUntil);
  start.setHours(session.startHour, session.startMinute, 0, 0);

  if (start <= now) {
    start.setDate(start.getDate() + 7);
  }

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + session.durationMinutes);

  return { start, end };
}

function toIsoOffset(date) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, "0");
  const minutes = String(Math.abs(offsetMinutes) % 60).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    String(date.getMonth() + 1).padStart(2, "0"),
    "-",
    String(date.getDate()).padStart(2, "0"),
    "T",
    String(date.getHours()).padStart(2, "0"),
    ":",
    String(date.getMinutes()).padStart(2, "0"),
    ":00",
    sign,
    hours,
    ":",
    minutes
  ].join("");
}

function updateSessionContent() {
  document.querySelectorAll("[data-session-card]").forEach((card) => {
    const key = card.dataset.sessionCard;
    const session = sessions[key];

    if (!session) {
      return;
    }

    const { start } = getNextOccurrence(session);
    const nextDate = card.querySelector("[data-next-date]");
    const nextShort = card.querySelector("[data-next-short]");
    const nextLabel = card.querySelector("[data-next-label]");

    if (nextDate) {
      nextDate.textContent = dateFormatter.format(start);
    }

    if (nextShort) {
      nextShort.textContent = shortDateFormatter.format(start);
    }

    if (nextLabel) {
      nextLabel.textContent = `Next up: ${dateFormatter.format(start)}`;
    }
  });
}

function injectEventSchema() {
  const key = document.body.dataset.eventKey;
  const schemaNode = document.getElementById("event-schema");

  if (!key || !schemaNode || !sessions[key]) {
    return;
  }

  const session = sessions[key];
  const { start, end } = getNextOccurrence(session);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: session.title,
    description: session.description,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    startDate: toIsoOffset(start),
    endDate: toIsoOffset(end),
    image: [session.image],
    url: `https://www.encouragingyou.co.uk${session.slug}`,
    location: {
      "@type": "Place",
      name: "Rochdale",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Rochdale",
        addressCountry: "GB"
      }
    },
    organizer: {
      "@type": "Organization",
      name: "EncouragingYou CIC",
      url: "https://www.encouragingyou.co.uk/"
    }
  };

  schemaNode.textContent = JSON.stringify(schema, null, 2);

  document.querySelectorAll("[data-next-full]").forEach((node) => {
    node.textContent = dateTimeFormatter.format(start);
  });
}

function setupReveal() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll("[data-reveal]").forEach((node) => {
      node.classList.add("is-visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  document.querySelectorAll("[data-reveal]").forEach((node) => {
    observer.observe(node);
  });
}

function updateFooterYear() {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

updateSessionContent();
injectEventSchema();
setupReveal();
updateFooterYear();

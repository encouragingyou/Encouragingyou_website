import { defineCollection, z } from "astro:content";

const audienceSchema = z.enum([
  "young-people",
  "parents-carers",
  "referrers",
  "community-members",
  "older-people",
  "volunteers",
  "partners",
  "funders"
]);

const lifecycleSchema = z.enum(["launch", "placeholder", "phase-two"]);
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u);
const factStatusSchema = z.enum([
  "confirmed",
  "assumed",
  "placeholder",
  "needs-client-confirmation"
]);
const contentStatusSchema = z.enum([
  "seeded",
  "outline-only",
  "placeholder",
  "phase-two"
]);
const seoIndexingSchema = z.enum(["index", "noindex"]);
const actionVariantSchema = z.enum(["primary", "secondary", "surface", "text"]);
const resilienceStateSchema = z.enum([
  "idle",
  "loading",
  "success",
  "validation-error",
  "submission-error",
  "empty-valid",
  "partial-content",
  "unavailable-enhancement",
  "missing-route",
  "archived-content",
  "system-fallback"
]);
const resiliencePresentationSchema = z.enum(["panel", "notice", "status"]);
const badgeToneSchema = z.enum([
  "default",
  "soft",
  "accent",
  "inverse",
  "meta",
  "success"
]);
const mediaSourceTypeSchema = z.enum([
  "ai-generated-people-illustration",
  "ai-generated-symbolic-illustration",
  "ai-generated-icon",
  "consented-documentary-photo",
  "consented-team-photo",
  "consented-event-photo"
]);
const mediaParticipantRepresentationSchema = z.enum([
  "synthetic-people",
  "synthetic-symbolic",
  "synthetic-icon",
  "real-people",
  "none"
]);
const mediaTrustImpactSchema = z.enum([
  "atmospheric",
  "wayfinding",
  "narrative",
  "trust-sensitive",
  "evidence-bearing"
]);
const mediaEvidenceUseSchema = z.enum([
  "illustrative-only",
  "wayfinding-only",
  "documentary-evidence",
  "proof-supporting"
]);
const mediaConsentStatusSchema = z.enum([
  "not-applicable-synthetic",
  "required-before-use",
  "pending-approval",
  "approved-for-launch",
  "approved-time-limited"
]);
const mediaReviewCadenceSchema = z.enum(["change-driven", "time-limited-before-reuse"]);
const mediaSafeguardingSensitivitySchema = z.enum(["low", "elevated", "high"]);
const mediaReplacementSourceTypeSchema = z.enum([
  "consented-documentary-photo",
  "consented-team-photo",
  "consented-event-photo",
  "vector-icon"
]);
const mediaDisclosureVariantSchema = z.enum(["prominent", "compact", "sitewide"]);
const mediaDisclosureContextSchema = z.enum([
  "hero",
  "feature",
  "narrative",
  "detail",
  "card",
  "listing"
]);
const homeSectionKindSchema = z.enum([
  "quick-actions",
  "trust-strip",
  "live-sessions",
  "programme-teasers",
  "page-teaser",
  "feature-split",
  "updates-surface",
  "faq-cluster",
  "contact-panel"
]);
const homeSectionToneSchema = z.enum(["default", "band", "tint"]);
const homeSectionWidthSchema = z.enum(["default", "wide"]);
const homeEmptyBehaviorSchema = z.enum([
  "fail-build",
  "hide-section",
  "show-primary-action",
  "show-support-action",
  "teaser"
]);
const weekdayCodeSchema = z.enum(["SU", "MO", "TU", "WE", "TH", "FR", "SA"]);
const sessionScheduleStateSchema = z.enum([
  "active",
  "paused",
  "cancelled",
  "seasonal",
  "contact-only"
]);
const calendarFeedStatusSchema = z.enum(["available", "disabled"]);
const pageTemplateSchema = z.enum([
  "home",
  "about",
  "programme-index",
  "programme-detail",
  "session-index",
  "session-detail",
  "updates-index",
  "event-detail",
  "update-detail",
  "get-involved-hub",
  "volunteer-detail",
  "partner-detail",
  "contact",
  "safeguarding",
  "legal",
  "not-found"
]);
const involvementPathStateSchema = z.enum([
  "live-route",
  "route-ready",
  "contact-led",
  "opportunity-route"
]);
const verificationSchema = z.enum([
  "confirmed",
  "implemented-in-prototype",
  "stated-in-brief",
  "stated-in-blueprint",
  "needs-operational-confirmation"
]);
const cmsOwnershipClassSchema = z.enum([
  "client-editable",
  "operator-controlled",
  "developer-owned"
]);
const cmsMutationPrimitiveSchema = z.enum([
  "short-plain-text",
  "long-plain-text",
  "constrained-rich-text",
  "repeatable-list",
  "seo-snippet",
  "alt-text",
  "route-reference-picker",
  "external-link-allowlist",
  "publication-control",
  "developer-locked"
]);
const cmsLinkPolicySchema = z.enum([
  "none",
  "internal-route-only",
  "external-allowlist",
  "operator-managed"
]);
const cmsCapabilitySchema = z.enum([
  "create-draft",
  "edit-client-fields",
  "request-review",
  "view-diff",
  "view-audit-log",
  "edit-operator-fields",
  "approve-content",
  "publish-content",
  "revert-content",
  "archive-content",
  "manage-editor-access",
  "manage-schema-and-mappings",
  "manage-runtime-and-secrets"
]);
const cmsWorkflowStateSchema = z.enum([
  "draft",
  "under-review",
  "approved",
  "scheduled",
  "published",
  "superseded",
  "archived"
]);

const headingContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string(),
  summary: z.string().optional()
});

const linkSchema = z
  .object({
    label: z.string(),
    routeId: z.string().optional(),
    href: z.string().optional(),
    external: z.boolean().optional()
  })
  .refine((value) => Boolean(value.routeId || value.href), {
    message: "Link items require either a routeId or an href."
  });

const actionReferenceSchema = z
  .object({
    label: z.string(),
    variant: actionVariantSchema,
    routeId: z.string().optional(),
    href: z.string().optional()
  })
  .refine((value) => Boolean(value.routeId || value.href), {
    message: "Action items require either a routeId or an href."
  });

const noticeToneSchema = z.enum(["info", "important", "success", "error"]);
const cardToneSchema = z.enum(["default", "soft", "accent", "callout", "muted"]);
const privacySystemStatusSchema = z.enum([
  "active",
  "manual-review",
  "absent",
  "not-configured"
]);
const storageAccessCategorySchema = z.enum([
  "communication-delivery",
  "service-essential",
  "appearance-helper",
  "statistical",
  "non-essential"
]);
const storageAccessPartySchema = z.enum(["first-party", "third-party"]);
const storageAccessActivationSchema = z.enum(["always-on", "user-triggered"]);
const storageAccessPersistenceSchema = z.enum(["none", "session", "persistent"]);
const storageAccessConsentRequirementSchema = z.enum([
  "not-required",
  "required-before-use"
]);
const storageAccessConsentExperienceSchema = z.enum([
  "no-banner",
  "informational-notice",
  "banner"
]);
const storageAccessNonEssentialStatusSchema = z.enum(["absent", "present"]);
const storageAccessConsentRecordSchema = z.enum([
  "absent",
  "cookie",
  "local-storage",
  "server-side"
]);
const storageAccessPreferenceCenterSchema = z.enum(["not-required", "available"]);
const storageAccessReopenControlSchema = z.enum([
  "cookie-notice-route",
  "footer-control",
  "banner-control"
]);
const storageAccessJavascriptRequirementSchema = z.enum(["none", "enhancement-only"]);
const storageAccessFutureDefaultSchema = z.enum(["off-until-reviewed"]);
const storageAccessReviewCadenceSchema = z.enum(["change-driven"]);
const consentEntryPointSchema = z.enum([
  "cookie-notice-route",
  "footer-control",
  "banner-control"
]);
const surfaceControlledStateSchema = z.enum(["surface-controlled"]);
const reloadConfirmationModeSchema = z.enum(["reload-confirmation"]);
const noticeSchema = z.object({
  title: z.string().optional(),
  body: z.string(),
  tone: noticeToneSchema
});
const actionableNoticeSchema = noticeSchema.extend({
  action: actionReferenceSchema.optional()
});
const contactMethodIdSchema = z.enum(["email", "phone", "instagram", "safeguarding"]);
const contactMethodCardSchema = z.object({
  methodId: contactMethodIdSchema,
  title: z.string(),
  summary: z.string(),
  bullets: z.array(z.string()).optional(),
  tone: cardToneSchema.optional(),
  actionLabel: z.string().optional()
});
const contactLocationSectionSchema = headingContentSchema.extend({
  cards: z.array(
    z.object({
      title: z.string(),
      body: z.string(),
      tone: cardToneSchema.optional(),
      action: actionReferenceSchema.optional()
    })
  ),
  note: actionableNoticeSchema.optional()
});
const narrativeQuoteSchema = z.object({
  text: z.string(),
  attribution: z.string().optional()
});
const narrativeSectionSchema = headingContentSchema.extend({
  id: z.string(),
  paragraphs: z.array(z.string()).min(1),
  bullets: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
  quote: narrativeQuoteSchema.optional(),
  mediaId: z.string().optional(),
  note: actionableNoticeSchema.optional(),
  actionReferences: z.array(actionReferenceSchema).optional(),
  reversed: z.boolean().optional()
});
const purposeSectionSchema = headingContentSchema.extend({
  missionLabel: z.string(),
  visionLabel: z.string(),
  driveLabel: z.string(),
  driveSummary: z.string(),
  driveBullets: z.array(z.string()).optional()
});
const valuesSectionSchema = headingContentSchema.extend({
  items: z.array(
    z.object({
      title: z.string(),
      summary: z.string(),
      iconAssetId: z.string()
    })
  )
});
const audienceSectionSchema = headingContentSchema.extend({
  items: z.array(
    z.object({
      title: z.string(),
      summary: z.string(),
      action: actionReferenceSchema.optional()
    })
  )
});

const iconPanelSchema = z.object({
  title: z.string(),
  body: z.string(),
  tone: cardToneSchema.optional(),
  iconAssetId: z.string().optional()
});
const involvementRolePathwaysSectionSchema = headingContentSchema.extend({
  items: z.array(
    z.object({
      eyebrow: z.string().optional(),
      title: z.string(),
      summary: z.string(),
      bullets: z.array(z.string()).optional(),
      note: z.string().optional(),
      iconAssetId: z.string(),
      action: actionReferenceSchema.optional()
    })
  ),
  note: actionableNoticeSchema.optional()
});
const involvementInfoSectionSchema = headingContentSchema.extend({
  items: z.array(iconPanelSchema).min(1),
  note: actionableNoticeSchema.optional()
});

const programmeExperienceSectionSchema = headingContentSchema.extend({
  items: z.array(
    z.object({
      title: z.string(),
      summary: z.string(),
      iconAssetId: z.string()
    })
  )
});
const programmeAudienceRoutesSectionSchema = headingContentSchema.extend({
  items: z.array(
    z.object({
      title: z.string(),
      summary: z.string(),
      iconAssetId: z.string(),
      action: actionReferenceSchema,
      tone: cardToneSchema.optional()
    })
  )
});
const sessionAtAGlanceSectionSchema = headingContentSchema.extend({
  timingLabel: z.string(),
  locationLabel: z.string(),
  audienceLabel: z.string(),
  audienceSummary: z.string(),
  bringLabel: z.string(),
  bringSummary: z.string()
});
const sessionContentSectionSchema = headingContentSchema.extend({
  items: z.array(iconPanelSchema).min(1),
  checklistTitle: z.string().optional(),
  note: actionableNoticeSchema.optional()
});
const sessionRelatedProgrammeSectionSchema = headingContentSchema.extend({
  actionLabel: z.string().optional()
});
const proofBoundarySectionSchema = headingContentSchema.extend({
  publishNow: z.array(z.string()),
  awaitingConfirmation: z.array(z.string()),
  withheldUntilVerified: z.array(z.string())
});
const emptyStateContentSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  summary: z.string(),
  primaryAction: actionReferenceSchema,
  secondaryAction: actionReferenceSchema.optional()
});
const resilienceSurfaceSchema = z
  .object({
    id: z.string(),
    stateId: resilienceStateSchema,
    presentation: resiliencePresentationSchema,
    tone: noticeToneSchema.optional(),
    eyebrow: z.string().optional(),
    title: z.string(),
    summary: z.string().optional(),
    body: z.string().optional(),
    bullets: z.array(z.string()).optional(),
    primaryAction: actionReferenceSchema.optional(),
    secondaryAction: actionReferenceSchema.optional(),
    actions: z.array(actionReferenceSchema).optional()
  })
  .refine((value) => Boolean(value.summary || value.body), {
    message: "Resilience surfaces require at least a summary or a body."
  });
const ctaBandSchema = headingContentSchema.extend({
  badges: z.array(z.string()).optional(),
  actions: z.array(actionReferenceSchema).min(1),
  note: actionableNoticeSchema.optional()
});
const spotlightSupportPanelSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string(),
  body: z.string(),
  bullets: z.array(z.string()).optional(),
  action: actionReferenceSchema
});
const editorialDetailIntroSchema = headingContentSchema.extend({
  supportingText: z.string().optional(),
  badges: z.array(z.string()).optional()
});
const editorialDetailSchema = z.object({
  intro: editorialDetailIntroSchema,
  secondaryAction: actionReferenceSchema.optional(),
  sections: z.array(narrativeSectionSchema).min(1),
  proofNotice: actionableNoticeSchema.optional(),
  relatedSection: headingContentSchema.optional(),
  relatedItemIds: z.array(z.string()).optional(),
  ctaBand: ctaBandSchema
});

const resilienceStates = defineCollection({
  type: "data",
  schema: z.object({
    taxonomy: z.array(
      z.object({
        id: resilienceStateSchema,
        label: z.string(),
        description: z.string(),
        guidance: z.string()
      })
    ),
    surfaces: z.array(resilienceSurfaceSchema)
  })
});

const siteSettings = defineCollection({
  type: "data",
  schema: z.object({
    siteName: z.string(),
    legalName: z.string(),
    siteUrl: z.string().url(),
    serviceAreaLabel: z.string(),
    serviceAreaDescription: z.string(),
    missionSummary: z.string(),
    visionSummary: z.string(),
    launchMediaPolicy: z.string(),
    primaryEmail: z.string().email(),
    primaryPhone: z.string().nullable(),
    primaryPhoneStatus: factStatusSchema,
    socialLinks: z.array(
      z.object({
        label: z.string(),
        url: z.string().url()
      })
    ),
    operationalAssumptions: z.array(
      z.object({
        id: z.string(),
        summary: z.string(),
        requiredForLaunch: z.boolean()
      })
    )
  })
});

const launchGovernance = defineCollection({
  type: "data",
  schema: z.object({
    launchAudiencePriorities: z.array(audienceSchema),
    launchPageIds: z.array(z.string()),
    phaseTwoPageIds: z.array(z.string()),
    nonNegotiableTrustRequirements: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        requiredByLaunch: z.boolean(),
        pageIds: z.array(z.string()),
        blockerIfMissing: z.boolean()
      })
    ),
    launchBlockers: z.array(
      z.object({
        id: z.string(),
        summary: z.string(),
        currentStatus: factStatusSchema,
        ownerDomain: z.string()
      })
    ),
    phaseTwoBacklog: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        reasonDeferred: z.string()
      })
    )
  })
});

const pageDefinitions = defineCollection({
  type: "data",
  schema: z.object({
    launchPages: z.array(
      z.object({
        id: z.string(),
        route: z.string(),
        title: z.string(),
        template: pageTemplateSchema,
        primaryAudiences: z.array(audienceSchema),
        pageIntent: z.string(),
        trustCritical: z.boolean(),
        contentStatus: contentStatusSchema
      })
    ),
    placeholderPages: z.array(
      z.object({
        id: z.string(),
        route: z.string(),
        title: z.string(),
        template: pageTemplateSchema,
        primaryAudiences: z.array(audienceSchema),
        pageIntent: z.string(),
        trustCritical: z.boolean(),
        contentStatus: contentStatusSchema
      })
    ),
    phaseTwoPages: z.array(
      z.object({
        id: z.string(),
        route: z.string(),
        title: z.string(),
        template: pageTemplateSchema,
        primaryAudiences: z.array(audienceSchema),
        pageIntent: z.string(),
        trustCritical: z.boolean(),
        contentStatus: contentStatusSchema
      })
    )
  })
});

const navigation = defineCollection({
  type: "data",
  schema: z.object({
    homeLinkBehavior: z.enum(["logo-only", "logo-and-nav"]),
    primaryItems: z.array(
      z.object({
        label: z.string(),
        routeId: z.string()
      })
    ),
    headerCta: z.object({
      label: z.string(),
      routeId: z.string()
    }),
    footerGroups: z.array(
      z.object({
        title: z.string(),
        items: z.array(linkSchema)
      })
    )
  })
});

const shellConfig = defineCollection({
  type: "data",
  schema: z.object({
    skipLinks: z.array(
      z.object({
        label: z.string(),
        href: z.string()
      })
    ),
    utilityItems: z.array(linkSchema),
    headerCtas: z.array(
      z
        .object({
          id: z.string(),
          label: z.string(),
          routeId: z.string().optional(),
          href: z.string().optional()
        })
        .refine((value) => Boolean(value.routeId || value.href), {
          message: "Header CTAs require either a routeId or an href."
        })
    ),
    pageHeaderCtas: z.array(
      z.object({
        ctaId: z.string(),
        pageIds: z.array(z.string())
      })
    ),
    breadcrumbHiddenPageIds: z.array(z.string()),
    breadcrumbParents: z.array(
      z.object({
        pageId: z.string(),
        parentPageId: z.string()
      })
    ),
    noticePlacements: z.array(
      z.object({
        noticeId: z.string(),
        placement: z.enum(["before-content"]),
        pageIds: z.array(z.string()),
        action: linkSchema.optional()
      })
    ),
    relatedRouteGroups: z.array(
      z.object({
        title: z.string(),
        pageIds: z.array(z.string()),
        links: z.array(linkSchema)
      })
    ),
    footerSupport: z.object({
      eyebrow: z.string(),
      title: z.string(),
      summary: z.string(),
      primaryAction: linkSchema,
      secondaryAction: linkSchema.optional()
    })
  })
});

const seo = defineCollection({
  type: "data",
  schema: z.object({
    defaults: z.object({
      titleSeparator: z.string(),
      siteName: z.string(),
      locale: z.string(),
      defaultRobots: z.string(),
      noindexRobots: z.string(),
      defaultOgType: z.enum(["website", "article"]),
      defaultSocialMediaId: z.string()
    }),
    pageDirectives: z.array(
      z.object({
        pageId: z.string(),
        indexing: seoIndexingSchema,
        primaryTopic: z.string(),
        searchIntent: z.string(),
        titleOverride: z.string().optional()
      })
    )
  })
});

const discovery = defineCollection({
  type: "data",
  schema: z.object({
    robots: z.object({
      sitemapPath: z.string(),
      policies: z.array(
        z.object({
          userAgent: z.string(),
          allow: z.array(z.string()),
          disallow: z.array(z.string())
        })
      )
    }),
    sitemap: z.object({
      inclusionRule: z.string(),
      excludeRoutePrefixes: z.array(z.string()),
      includeEditorialWhen: z.string(),
      lastmodStrategy: z.enum(["omit-until-trustworthy"])
    }),
    socialPreview: z.object({
      outputDirectory: z.string(),
      canvas: z.object({
        width: z.number().int().positive(),
        height: z.number().int().positive()
      }),
      brand: z.object({
        siteName: z.string(),
        strapline: z.string(),
        launchTruthNote: z.string()
      }),
      families: z.array(
        z.object({
          id: z.string(),
          routeFamilies: z.array(z.string()),
          eyebrow: z.string(),
          headline: z.string(),
          supportingText: z.string(),
          accentStart: z.string(),
          accentEnd: z.string()
        })
      )
    })
  })
});

const homePage = defineCollection({
  type: "data",
  schema: z.object({
    metaTitle: z.string(),
    metaDescription: z.string(),
    routePurpose: z.string(),
    audiencePriority: z.array(audienceSchema),
    actions: z.array(
      z
        .object({
          id: z.string(),
          ctaId: z.string().optional(),
          label: z.string().optional(),
          summary: z.string(),
          variant: actionVariantSchema.optional(),
          routeId: z.string().optional(),
          href: z.string().optional(),
          iconAssetId: z.string().optional(),
          audiences: z.array(audienceSchema),
          placements: z.array(z.string())
        })
        .refine((value) => Boolean(value.ctaId || value.routeId || value.href), {
          message: "Home actions require a ctaId, routeId, or href."
        })
        .refine(
          (value) => Boolean(value.ctaId) || Boolean(value.label && value.variant),
          {
            message: "Direct home actions require a label and a variant."
          }
        )
    ),
    conversionStack: z.object({
      primaryActionId: z.string(),
      secondaryActionId: z.string(),
      supportingActionIds: z.array(z.string()),
      audienceJourneys: z.array(
        z.object({
          audience: audienceSchema,
          summary: z.string(),
          primaryActionId: z.string(),
          secondaryActionId: z.string().optional(),
          supportingActionIds: z.array(z.string())
        })
      )
    }),
    hero: z.object({
      eyebrow: z.string(),
      headline: z.string(),
      summary: z.string(),
      badgeItems: z.array(z.string()),
      primaryActionId: z.string(),
      secondaryActionId: z.string(),
      mediaId: z.string()
    }),
    sections: z.array(
      z.object({
        id: z.string(),
        kind: homeSectionKindSchema,
        eyebrow: z.string(),
        title: z.string(),
        summary: z.string().optional(),
        tone: homeSectionToneSchema.optional(),
        width: homeSectionWidthSchema.optional(),
        actionIds: z.array(z.string()).optional(),
        primaryActionId: z.string().optional(),
        secondaryActionId: z.string().optional(),
        trustItems: z
          .array(
            z.object({
              signalId: z.string(),
              actionId: z.string()
            })
          )
          .optional(),
        programmeSlugs: z.array(z.string()).optional(),
        pageId: z.string().optional(),
        faqGroupId: z.string().optional(),
        formSurfaceId: z.string().optional(),
        mediaId: z.string().optional(),
        bullets: z.array(z.string()).optional(),
        badges: z.array(z.string()).optional(),
        maxItems: z.number().int().positive().optional(),
        emptyBehavior: homeEmptyBehaviorSchema.optional(),
        emptyState: z
          .object({
            title: z.string(),
            summary: z.string()
          })
          .optional(),
        pausedState: z
          .object({
            title: z.string(),
            summary: z.string()
          })
          .optional(),
        reversed: z.boolean().optional()
      })
    ),
    stateRules: z.object({
      liveSessions: z.object({
        sectionId: z.string(),
        supportActionId: z.string()
      }),
      updates: z.object({
        sectionId: z.string(),
        collectionId: z.string(),
        emptyBehavior: homeEmptyBehaviorSchema,
        primaryActionId: z.string()
      }),
      contact: z.object({
        sectionId: z.string(),
        confirmedFields: z.array(z.string()),
        pendingFields: z.array(z.string())
      }),
      aiDisclosures: z.object({
        requiredSectionIds: z.array(z.string()),
        optionalSectionIds: z.array(z.string())
      }),
      shellNotices: z.object({
        pageId: z.string()
      })
    }),
    launchBoundaries: z.object({
      staysOnHomepageNow: z.array(z.string()),
      deferredToLaterRoutes: z.array(z.string()),
      intentionallyExcludedFromLaunch: z.array(z.string())
    })
  })
});

const updatesFeed = defineCollection({
  type: "data",
  schema: z.object({
    index: z.object({
      filterLabel: z.string(),
      allLabel: z.string(),
      featuredSection: headingContentSchema,
      feedSection: headingContentSchema,
      emptyState: z.object({
        title: z.string(),
        summary: z.string(),
        primaryAction: actionReferenceSchema,
        secondaryAction: actionReferenceSchema.optional()
      }),
      filterEmptyState: z.object({
        title: z.string(),
        summary: z.string()
      }),
      archiveNotice: noticeSchema.optional()
    }),
    categories: z.array(
      z.object({
        id: z.enum(["event", "update", "opportunity"]),
        label: z.string(),
        description: z.string()
      })
    ),
    items: z.array(
      z
        .object({
          id: z.string(),
          slug: z.string(),
          title: z.string(),
          summary: z.string(),
          publishDate: isoDateSchema.optional(),
          eventDate: isoDateSchema.optional(),
          endDate: isoDateSchema.optional(),
          dateLabel: z.string().optional(),
          timeLabel: z.string().optional(),
          locationLabel: z.string().optional(),
          statusLabel: z.string().optional(),
          routeId: z.string().optional(),
          href: z.string().optional(),
          actionLabel: z.string().optional(),
          cardActionLabel: z.string().optional(),
          audience: z.array(audienceSchema),
          updateType: z.enum(["event", "update", "opportunity"]),
          publicationStatus: z.enum(["published", "draft", "archived"]),
          featured: z.boolean().optional(),
          showOnHome: z.boolean().optional(),
          sortOrder: z.number().int().nonnegative(),
          eventLifecycle: z
            .enum(["date-to-be-confirmed", "scheduled", "postponed", "cancelled"])
            .optional(),
          updateLifecycle: z.enum(["current", "superseded", "closed"]).optional(),
          archiveBehavior: z
            .enum(["remove", "demote-to-feed", "keep-visible"])
            .optional(),
          mediaId: z.string().nullable().optional(),
          detail: editorialDetailSchema
        })
        .refine((value) => Boolean(value.routeId || value.href), {
          message: "Updates require either a routeId or an href."
        })
        .refine(
          (value) =>
            value.updateType === "event" ? Boolean(value.eventLifecycle) : true,
          {
            message: "Event items require eventLifecycle.",
            path: ["eventLifecycle"]
          }
        )
        .refine(
          (value) =>
            value.updateType !== "event" ? Boolean(value.updateLifecycle) : true,
          {
            message: "Update and opportunity items require updateLifecycle.",
            path: ["updateLifecycle"]
          }
        )
        .refine(
          (value) => (value.updateType === "event" ? !value.updateLifecycle : true),
          {
            message: "Event items cannot define updateLifecycle.",
            path: ["updateLifecycle"]
          }
        )
        .refine(
          (value) => (value.updateType !== "event" ? !value.eventLifecycle : true),
          {
            message: "Update and opportunity items cannot define eventLifecycle.",
            path: ["eventLifecycle"]
          }
        )
    )
  })
});

const formSurfaces = defineCollection({
  type: "data",
  schema: z.object({
    surfaces: z.array(
      z.object({
        id: z.string(),
        eyebrow: z.string().optional(),
        heading: z.string(),
        intro: z.string(),
        privacyNote: z.string().optional(),
        privacyHighlights: z.array(z.string()).optional(),
        messageHelper: z.string().optional(),
        emailFallbackPrefix: z.string().optional(),
        submitLabel: z.string().optional(),
        successMessage: z.string(),
        defaultReasonId: z.string().optional(),
        allowedReasonIds: z.array(z.string()).optional(),
        reasonFieldLabel: z.string().optional(),
        reasonSelectPlaceholder: z.string().nullable().optional(),
        reasonFieldMode: z.enum(["select", "hidden"]).optional(),
        showUpdatesOptIn: z.boolean().optional()
      })
    )
  })
});

const contactInfo = defineCollection({
  type: "data",
  schema: z.object({
    publicEmail: z.string().email(),
    publicPhone: z.string().nullable(),
    publicPhoneStatus: factStatusSchema,
    instagramUrl: z.string().url(),
    serviceAreaLabel: z.string(),
    venueName: z.string().nullable(),
    venueAddress: z.string().nullable(),
    venueDisclosurePolicy: z.enum(["shared-on-enquiry", "public-address"]),
    mapEmbedAllowedAtLaunch: z.boolean(),
    locationGuidance: z.object({
      generalLocalityLabel: z.string(),
      serviceAreaSummary: z.string(),
      venueDisclosureSummary: z.string(),
      mapAccessSummary: z.string(),
      publicDirectionsLabel: z.string().nullable(),
      publicDirectionsUrl: z.string().url().nullable()
    }),
    urgentGuidance: z.object({
      emergencyText: z.string(),
      safeguardingRouteId: z.string()
    }),
    reasonOptions: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        routingKey: z.string(),
        targetAudience: z.array(audienceSchema)
      })
    ),
    formPrivacyNote: z.string()
  })
});

const mediaLibrary = defineCollection({
  type: "data",
  schema: z.object({
    version: z.number().int().min(1),
    assets: z.array(
      z.object({
        id: z.string(),
        kind: z.enum(["illustration", "icon"]),
        family: z.string(),
        label: z.string(),
        canonicalSourcePath: z.string(),
        masterAssetPath: z.string(),
        provenance: z.enum([
          "supplied-ai-illustration-master",
          "supplied-ai-icon-master"
        ]),
        masterDimensions: z.object({
          width: z.number().int().positive(),
          height: z.number().int().positive()
        }),
        focalIntent: z.string(),
        altStrategy: z.enum(["descriptive", "decorative"]),
        alt: z.string(),
        decorative: z.boolean(),
        caption: z.string().nullable(),
        aiGenerated: z.boolean(),
        sourceType: mediaSourceTypeSchema,
        participantRepresentation: mediaParticipantRepresentationSchema,
        trustImpact: mediaTrustImpactSchema,
        evidenceUse: mediaEvidenceUseSchema,
        consentStatus: mediaConsentStatusSchema,
        reviewCadence: mediaReviewCadenceSchema,
        reviewExpiry: isoDateSchema.nullable(),
        safeguardingSensitivity: mediaSafeguardingSensitivitySchema,
        requiresDisclosure: z.boolean(),
        noticeId: z.string().nullable(),
        replacementPriority: z.enum([
          "keep-for-launch",
          "replace-trust-critical-first",
          "vectorize-after-launch"
        ]),
        replacementSourceType: mediaReplacementSourceTypeSchema,
        replacementNotes: z.string(),
        disclosure: z.object({
          mode: z.enum(["none", "contextual"]),
          defaultVariant: mediaDisclosureVariantSchema,
          prominentContexts: z.array(mediaDisclosureContextSchema),
          compactContexts: z.array(mediaDisclosureContextSchema)
        }),
        restrictedRouteFamilies: z.array(z.string()),
        launchApproved: z.boolean(),
        preferredContexts: z.array(z.string()),
        astroDelivery: z.object({
          formats: z.array(z.enum(["avif", "webp", "png", "svg"])),
          responsiveWidths: z.array(z.number().int().positive()).nullable(),
          defaultWidth: z.number().int().positive().nullable(),
          fixedWidth: z.number().int().positive().nullable(),
          fixedHeight: z.number().int().positive().nullable()
        }),
        compatibilityRenders: z.array(
          z.object({
            publicPath: z.string(),
            format: z.enum(["avif", "webp", "png", "svg"]),
            width: z.number().int().positive().nullable(),
            height: z.number().int().positive().nullable()
          })
        )
      })
    )
  })
});

const programmes = defineCollection({
  type: "data",
  schema: z.object({
    slug: z.string(),
    route: z.string(),
    title: z.string(),
    shortTitle: z.string(),
    launchStatus: lifecycleSchema,
    summary: z.string(),
    promise: z.string(),
    audiences: z.array(audienceSchema),
    audienceSummary: z.string(),
    audienceHighlights: z.array(z.string()),
    existingDeliveryMode: z.enum([
      "active-session-linked",
      "launch-overview-only",
      "growth-planned"
    ]),
    relatedSessionIds: z.array(z.string()),
    featuredMediaId: z.string(),
    featuredIconId: z.string(),
    deliverySummary: z.string(),
    trustSignalIds: z.array(z.string()),
    trustNotes: z.array(z.string()),
    outcomeBullets: z.array(z.string()),
    bodySections: z.array(
      z.object({
        id: z.string(),
        heading: z.string(),
        body: z.array(z.string()),
        bullets: z.array(z.string())
      })
    ),
    primaryCtaId: z.string(),
    seoDescription: z.string()
  })
});

const sessions = defineCollection({
  type: "data",
  schema: z.object({
    slug: z.string(),
    route: z.string(),
    title: z.string(),
    shortTitle: z.string(),
    launchStatus: lifecycleSchema,
    programmeIds: z.array(z.string()),
    summary: z.string(),
    eventDescription: z.string(),
    audiences: z.array(audienceSchema),
    schedule: z.object({
      type: z.literal("weekly-recurring"),
      label: z.string(),
      byDay: z.array(weekdayCodeSchema).min(1),
      intervalWeeks: z.number().int().positive(),
      startLocalDate: isoDateSchema,
      startTime: z.string(),
      durationMinutes: z.number().positive(),
      timezone: z.string(),
      status: z.object({
        state: sessionScheduleStateSchema,
        note: z.string().nullable(),
        resumeDate: isoDateSchema.nullable(),
        seasonStartDate: isoDateSchema.nullable(),
        seasonEndDate: isoDateSchema.nullable()
      })
    }),
    calendar: z.object({
      publicPath: z.string(),
      uid: z.string(),
      status: calendarFeedStatusSchema
    }),
    location: z.object({
      locality: z.string(),
      venueName: z.string().nullable(),
      venueAddress: z.string().nullable(),
      disclosurePolicy: z.enum(["shared-on-enquiry", "public-address"])
    }),
    access: z.object({
      priceLabel: z.string().nullable(),
      priceStatus: factStatusSchema,
      referralRequired: z.boolean().nullable(),
      referralStatus: factStatusSchema
    }),
    contact: z.object({
      email: z.string().email(),
      emailSubject: z.string(),
      reasonId: z.string()
    }),
    trustNotes: z.array(z.string()),
    featureBullets: z.array(z.string()),
    faqGroupIds: z.array(z.string()),
    featuredMediaId: z.string(),
    featuredIconId: z.string(),
    primaryCtaId: z.string(),
    seoDescription: z.string()
  })
});

const faqs = defineCollection({
  type: "data",
  schema: z.object({
    groups: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        pageContexts: z.array(z.string()),
        items: z.array(
          z.object({
            question: z.string(),
            answer: z.string(),
            audienceTags: z.array(audienceSchema)
          })
        )
      })
    )
  })
});

const involvementRoutes = defineCollection({
  type: "data",
  schema: z.object({
    routes: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        routeId: z.string(),
        launchPresence: z.enum(["primary-route", "hub-route", "future-route"]),
        pathState: involvementPathStateSchema,
        statusLabel: z.string(),
        summary: z.string(),
        audiences: z.array(audienceSchema),
        nextStep: z.string(),
        trustNote: z.string(),
        requiresSafeguardingContext: z.boolean(),
        supportPoints: z.array(z.string()).optional(),
        iconAssetId: z.string(),
        primaryAction: actionReferenceSchema,
        secondaryAction: actionReferenceSchema.optional()
      })
    )
  })
});

const trustSignals = defineCollection({
  type: "data",
  schema: z.object({
    signals: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        iconAssetId: z.string(),
        summary: z.string(),
        verificationStatus: verificationSchema,
        nonNegotiableForLaunch: z.boolean(),
        displayContexts: z.array(z.string())
      })
    )
  })
});

const safeguardingInfo = defineCollection({
  type: "data",
  schema: z.object({
    immediateDanger: z.object({
      title: z.string(),
      message: z.string(),
      summary: z.string()
    }),
    publicConcernRoute: z.object({
      email: z.string().email(),
      emailSubject: z.string(),
      sharedInboxLabel: z.string(),
      summary: z.string(),
      responseBoundary: z.string(),
      handoffNote: z.string(),
      namedLead: z.string().nullable(),
      namedLeadRoleLabel: z.string(),
      namedLeadStatus: factStatusSchema
    }),
    secureConcernForm: z.object({
      status: z.enum(["available", "deferred"]),
      surfaceId: z.string().nullable(),
      routeId: z.string().nullable(),
      summary: z.string(),
      boundaryNote: z.string()
    }),
    policyDocument: z.object({
      title: z.string(),
      url: z.string().url().nullable(),
      status: factStatusSchema,
      summaryWhenAvailable: z.string(),
      summaryWhenUnavailable: z.string()
    }),
    vettingAndTraining: z.object({
      summary: z.string(),
      verification: verificationSchema,
      bullets: z.array(z.string())
    }),
    preparationChecklist: z.array(z.string()),
    generalContactBoundary: z.object({
      title: z.string(),
      body: z.string()
    }),
    proofBoundary: z.object({
      title: z.string(),
      summary: z.string().optional(),
      publishNow: z.array(z.string()),
      awaitingConfirmation: z.array(z.string()),
      withheldUntilVerified: z.array(z.string())
    }),
    routes: z.array(
      z.object({
        id: z.enum(["child", "adult"]),
        pageId: z.string(),
        audienceLabel: z.string(),
        title: z.string(),
        summary: z.string(),
        appliesTo: z.array(z.string()),
        signals: z.array(z.string()),
        alternatePageId: z.string()
      })
    ),
    branches: z.object({
      child: z.object({
        title: z.string(),
        summary: z.string(),
        appliesToTitle: z.string(),
        appliesTo: z.array(z.string()),
        escalationTitle: z.string(),
        escalationSummary: z.string().optional(),
        steps: z.array(
          z.object({
            title: z.string(),
            body: z.string()
          })
        ),
        preparationTitle: z.string(),
        preparationItems: z.array(z.string()),
        limitationsTitle: z.string(),
        limitations: z.array(z.string()),
        concernNoteTitle: z.string(),
        concernNoteBody: z.string()
      }),
      adult: z.object({
        title: z.string(),
        summary: z.string(),
        appliesToTitle: z.string(),
        appliesTo: z.array(z.string()),
        escalationTitle: z.string(),
        escalationSummary: z.string().optional(),
        steps: z.array(
          z.object({
            title: z.string(),
            body: z.string()
          })
        ),
        preparationTitle: z.string(),
        preparationItems: z.array(z.string()),
        limitationsTitle: z.string(),
        limitations: z.array(z.string()),
        concernNoteTitle: z.string(),
        concernNoteBody: z.string()
      })
    })
  })
});

const legalPages = defineCollection({
  type: "data",
  schema: z.object({
    pages: z.array(
      z.object({
        id: z.string(),
        route: z.string(),
        title: z.string(),
        launchStatus: lifecycleSchema,
        summary: z.string(),
        contentState: contentStatusSchema,
        blockingFacts: z.array(z.string())
      })
    )
  })
});

const accessibilityStatement = defineCollection({
  type: "data",
  schema: z.object({
    settings: z.object({
      standardTarget: z.string(),
      assessmentApproach: z.string(),
      formalAuditStatus: z.enum([
        "no-independent-audit",
        "self-evaluation",
        "independent-audit"
      ]),
      lastReviewed: isoDateSchema,
      responseExpectation: z.string(),
      feedbackSurfaceId: z.string()
    }),
    page: z.object({
      eyebrow: z.string(),
      title: z.string(),
      summary: z.string(),
      statusNote: actionableNoticeSchema,
      primaryAction: actionReferenceSchema,
      secondaryAction: actionReferenceSchema.optional(),
      summaryCards: z.array(
        z.object({
          title: z.string(),
          body: z.string(),
          bullets: z.array(z.string()).optional()
        })
      ),
      contents: z.array(
        z.object({
          id: z.string(),
          label: z.string()
        })
      ),
      measuresSection: headingContentSchema.extend({
        items: z.array(iconPanelSchema)
      }),
      assessmentSection: headingContentSchema.extend({
        items: z.array(iconPanelSchema)
      }),
      limitationSection: headingContentSchema,
      limitations: z.array(
        z.object({
          title: z.string(),
          body: z.string(),
          impact: z.string(),
          workaround: z.string()
        })
      ),
      externalSurfacesSection: headingContentSchema.extend({
        items: z.array(
          z.object({
            title: z.string(),
            body: z.string()
          })
        )
      }),
      feedbackSection: headingContentSchema.extend({
        bullets: z.array(z.string()).optional(),
        note: actionableNoticeSchema.optional()
      }),
      reviewSection: headingContentSchema,
      reviewTriggers: z.array(z.string())
    })
  })
});

const privacyNotice = defineCollection({
  type: "data",
  schema: z.object({
    page: z.object({
      eyebrow: z.string(),
      title: z.string(),
      summary: z.string(),
      statusNote: actionableNoticeSchema,
      primaryAction: actionReferenceSchema,
      secondaryAction: actionReferenceSchema.optional(),
      summaryCards: z.array(
        z.object({
          title: z.string(),
          body: z.string(),
          bullets: z.array(z.string()).optional()
        })
      ),
      contents: z.array(
        z.object({
          id: z.string(),
          label: z.string()
        })
      ),
      collectionPointSection: headingContentSchema,
      collectionPoints: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          surfaceId: z.string(),
          routeIds: z.array(z.string()),
          dataTypes: z.array(z.string()),
          purpose: z.string(),
          workingBasis: z.string(),
          sharing: z.string(),
          retention: z.string(),
          note: z.string().optional()
        })
      ),
      sections: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          summary: z.string().optional(),
          paragraphs: z.array(z.string()).optional(),
          bullets: z.array(z.string()).optional(),
          note: actionableNoticeSchema.optional()
        })
      ),
      systemsSection: headingContentSchema,
      systems: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          status: privacySystemStatusSchema,
          detail: z.string()
        })
      ),
      rightsSection: headingContentSchema,
      rightsCards: z.array(
        z.object({
          title: z.string(),
          body: z.string()
        })
      ),
      reviewSection: headingContentSchema,
      reviewTriggers: z.array(z.string())
    }),
    settings: z.object({
      privacyEmail: z.string().email(),
      complaintUrl: z.string().url(),
      enquiryStorageMode: z.enum(["server-side-files"]),
      analyticsStatus: z.enum(["absent", "configured"]),
      nonEssentialCookiesStatus: z.enum(["absent", "configured"]),
      mapEmbedStatus: z.enum(["absent", "configured"]),
      socialEmbedStatus: z.enum(["absent", "configured"]),
      newsletterProcessorStatus: z.enum(["not-configured", "configured"]),
      crmProcessorStatus: z.enum(["not-configured", "configured"]),
      retentionMode: z.enum(["manual-review", "scheduled"]),
      safeguardingWorkflow: z.enum(["separate-intake"]),
      reviewTriggers: z.array(z.string())
    })
  })
});

const sitePolicy = defineCollection({
  type: "data",
  schema: z.object({
    page: z.object({
      eyebrow: z.string(),
      title: z.string(),
      summary: z.string(),
      statusNote: actionableNoticeSchema,
      primaryAction: actionReferenceSchema,
      secondaryAction: actionReferenceSchema.optional(),
      summaryCards: z.array(
        z.object({
          title: z.string(),
          body: z.string(),
          bullets: z.array(z.string()).optional()
        })
      ),
      contents: z.array(
        z.object({
          id: z.string(),
          label: z.string()
        })
      ),
      sections: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          summary: z.string().optional(),
          paragraphs: z.array(z.string()).optional(),
          bullets: z.array(z.string()).optional(),
          cards: z
            .array(
              z.object({
                title: z.string(),
                body: z.string(),
                tone: cardToneSchema.optional()
              })
            )
            .optional(),
          note: actionableNoticeSchema.optional()
        })
      )
    })
  })
});

const storageAccess = defineCollection({
  type: "data",
  schema: z.object({
    page: z.object({
      eyebrow: z.string(),
      title: z.string(),
      summary: z.string(),
      statusNote: actionableNoticeSchema,
      primaryAction: actionReferenceSchema,
      secondaryAction: actionReferenceSchema.optional(),
      summaryCards: z.array(
        z.object({
          title: z.string(),
          body: z.string(),
          bullets: z.array(z.string()).optional()
        })
      ),
      contents: z.array(
        z.object({
          id: z.string(),
          label: z.string()
        })
      ),
      activeSection: headingContentSchema,
      absentSection: headingContentSchema,
      sections: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          summary: z.string().optional(),
          paragraphs: z.array(z.string()).optional(),
          bullets: z.array(z.string()).optional(),
          note: actionableNoticeSchema.optional()
        })
      ),
      analyticsControlSection: z.object({
        eyebrow: z.string(),
        title: z.string(),
        summary: z.string(),
        note: z.string(),
        objectLabel: z.string(),
        resumeLabel: z.string(),
        stateMessages: z.object({
          active: z.object({
            title: z.string(),
            body: z.string()
          }),
          objected: z.object({
            title: z.string(),
            body: z.string()
          }),
          browserSignal: z.object({
            title: z.string(),
            body: z.string()
          }),
          disabled: z.object({
            title: z.string(),
            body: z.string()
          })
        })
      }),
      changeControlSection: headingContentSchema,
      changeTriggers: z.array(z.string())
    }),
    settings: z.object({
      consentExperience: storageAccessConsentExperienceSchema,
      nonEssentialTechnologiesStatus: storageAccessNonEssentialStatusSchema,
      consentRecordStorage: storageAccessConsentRecordSchema,
      consentSchemaVersion: z.string(),
      preferenceCenterState: storageAccessPreferenceCenterSchema,
      reopenControl: storageAccessReopenControlSchema,
      javascriptRequirement: storageAccessJavascriptRequirementSchema,
      futureDefault: storageAccessFutureDefaultSchema,
      reviewCadence: storageAccessReviewCadenceSchema
    }),
    registry: z.object({
      active: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          category: storageAccessCategorySchema,
          party: storageAccessPartySchema,
          activation: storageAccessActivationSchema,
          persistence: storageAccessPersistenceSchema,
          consentRequirement: storageAccessConsentRequirementSchema,
          provider: z.string(),
          purpose: z.string(),
          implementation: z.string(),
          duration: z.string(),
          userControl: z.string().optional(),
          note: z.string().optional()
        })
      ),
      absent: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          category: storageAccessCategorySchema,
          party: storageAccessPartySchema,
          detail: z.string(),
          reason: z.string()
        })
      ),
      futureGuardrails: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          body: z.string()
        })
      )
    })
  })
});

const consentAwareMicrocopy = defineCollection({
  type: "data",
  schema: z.object({
    settings: z.object({
      cookiePreferenceEntryPoint: consentEntryPointSchema,
      accessibilityFeedbackSurfaceId: z.string(),
      updatesOptInStrategy: surfaceControlledStateSchema,
      javascriptFormConfirmationMode: reloadConfirmationModeSchema,
      generalExternalLinkWarningMode: z.enum(["omit-by-default"]),
      socialLinkWarningMode: z.enum(["show-contextually"]),
      mapLinkWarningMode: z.enum(["show-when-enabled"]),
      calendarDownloadNoticeMode: z.enum(["show-on-session-detail"])
    }),
    labels: z.object({
      privacyNoticeActionLabel: z.string(),
      cookieNoticeActionLabel: z.string(),
      accessibilityStatementActionLabel: z.string(),
      sitePolicyActionLabel: z.string()
    }),
    forms: z.object({
      privacyNoticeTitle: z.string(),
      messageHelper: z.string(),
      updatesOptInLabel: z.string(),
      emailFallbackPrefix: z.string(),
      noscriptNote: z.string(),
      submittingStatusMessage: z.string(),
      invalidStatusMessage: z.string()
    }),
    notices: z.object({
      cookieEntryPoint: z.object({
        title: z.string(),
        whenNoBanner: z.string(),
        whenBannerPresent: z.string()
      }),
      accessibilityFeedback: z.object({
        title: z.string(),
        body: z.string(),
        actionLabel: z.string()
      }),
      calendarDownload: z.object({
        title: z.string(),
        availableBody: z.string(),
        unavailableBody: z.string()
      }),
      socialExternalLink: z.object({
        title: z.string(),
        body: z.string()
      }),
      mapExternalLink: z.object({
        title: z.string(),
        body: z.string()
      })
    })
  })
});

const ctaBlocks = defineCollection({
  type: "data",
  schema: z.object({
    blocks: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        routeId: z.string().nullable(),
        href: z.string().nullable(),
        style: z.enum(["primary", "secondary", "surface", "text"]),
        audience: z.array(audienceSchema),
        summary: z.string()
      })
    )
  })
});

const notices = defineCollection({
  type: "data",
  schema: z.object({
    notices: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        text: z.string(),
        variants: z
          .object({
            prominent: z.string(),
            compact: z.string(),
            sitewide: z.string()
          })
          .optional(),
        appliesTo: z.array(z.string()),
        severity: z.enum(["info", "important"])
      })
    )
  })
});

const routePages = defineCollection({
  type: "data",
  schema: z.object({
    pages: z.array(
      z.object({
        pageId: z.string(),
        template: pageTemplateSchema,
        metaDescription: z.string(),
        intro: z
          .object({
            eyebrow: z.string(),
            title: z.string(),
            summary: z.string(),
            badges: z.array(z.string()).optional(),
            supportingText: z.string().optional(),
            mediaId: z.string().optional(),
            actionReferences: z.array(actionReferenceSchema).optional()
          })
          .optional(),
        storySections: z.array(narrativeSectionSchema).optional(),
        purposeSection: purposeSectionSchema.optional(),
        valuesSection: valuesSectionSchema.optional(),
        audienceSection: audienceSectionSchema.optional(),
        trustSection: z
          .object({
            eyebrow: z.string(),
            title: z.string(),
            summary: z.string().optional(),
            trustSignalIds: z.array(z.string())
          })
          .optional(),
        proofBoundary: proofBoundarySectionSchema.optional(),
        ctaBand: ctaBandSchema.optional(),
        statsSection: z
          .object({
            items: z.array(
              z.object({
                value: z.string(),
                title: z.string(),
                summary: z.string()
              })
            )
          })
          .optional(),
        overviewPanels: z
          .array(
            z.object({
              title: z.string(),
              body: z.string().optional(),
              bullets: z.array(z.string()).optional()
            })
          )
          .optional(),
        questionPanel: z
          .object({
            title: z.string(),
            body: z.string(),
            actionLabel: z.string(),
            subject: z.string()
          })
          .optional(),
        launchNotice: noticeSchema.optional(),
        scheduleSection: headingContentSchema.optional(),
        guidanceSection: headingContentSchema.optional(),
        guidancePanels: z
          .array(
            z.object({
              title: z.string(),
              body: z.string()
            })
          )
          .optional(),
        contactMethodsSection: headingContentSchema
          .extend({
            cards: z.array(contactMethodCardSchema)
          })
          .optional(),
        locationSection: contactLocationSectionSchema.optional(),
        faqSection: headingContentSchema
          .extend({ groupId: z.string().optional() })
          .optional(),
        sidebarNotice: noticeSchema.optional(),
        formSurfaceId: z.string().optional(),
        urgentNoticeTitle: z.string().optional(),
        routesSection: headingContentSchema.optional(),
        pathwaysSection: involvementRolePathwaysSectionSchema.optional(),
        supportSection: involvementInfoSectionSchema.optional(),
        screeningSection: involvementInfoSectionSchema.optional(),
        timeCommitmentSection: involvementInfoSectionSchema.optional(),
        routeCards: z
          .array(
            z.object({
              routeId: z.string(),
              titleOverride: z.string().optional(),
              actionLabel: z.string().optional()
            })
          )
          .optional(),
        processSection: z
          .object({
            eyebrow: z.string().optional(),
            title: z.string(),
            summary: z.string().optional(),
            steps: z.array(
              z.object({
                title: z.string(),
                body: z.string()
              })
            )
          })
          .optional(),
        spotlightSection: headingContentSchema
          .extend({
            emptyTitle: z.string(),
            emptySummary: z.string(),
            fallbackAction: actionReferenceSchema,
            supportPanel: spotlightSupportPanelSchema.optional()
          })
          .optional(),
        callout: z
          .object({
            prefix: z.string(),
            suffix: z.string()
          })
          .optional(),
        actions: z
          .object({
            primaryLabel: z.string().optional(),
            secondaryLabel: z.string().optional(),
            concernLabel: z.string().optional(),
            contactLabel: z.string().optional()
          })
          .optional(),
        trainingPanelTitle: z.string().optional(),
        launchNoteTitle: z.string().optional(),
        emptyState: z
          .object({
            eyebrow: z.string(),
            title: z.string(),
            summary: z.string(),
            primaryAction: actionReferenceSchema,
            secondaryAction: actionReferenceSchema.optional()
          })
          .optional(),
        notice: noticeSchema.optional()
      })
    )
  })
});

const editorialSystem = defineCollection({
  type: "data",
  schema: z.object({
    voicePrinciples: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        rule: z.string(),
        keep: z.string(),
        refine: z.string(),
        retire: z.string()
      })
    ),
    audienceModes: z.array(
      z.object({
        audience: audienceSchema,
        promise: z.string(),
        stance: z.string(),
        reassuranceMove: z.string(),
        ctaStyle: z.string(),
        avoid: z.array(z.string())
      })
    ),
    contentPatterns: z.array(
      z.object({
        id: z.string(),
        context: z.string(),
        intent: z.string(),
        structure: z.array(z.string()),
        approvedMoves: z.array(z.string()),
        avoid: z.array(z.string())
      })
    ),
    microcopyPatterns: z.object({
      sessionStatus: z.object({
        scheduleUpdateTitle: z.string(),
        calendarUnavailableTitle: z.string()
      }),
      placeholderStatus: z.object({
        title: z.string(),
        publishNowLabel: z.string(),
        awaitingLabel: z.string(),
        hiddenLabel: z.string()
      })
    }),
    placeholderPolicies: z.array(
      z.object({
        id: z.string(),
        contentStatus: contentStatusSchema,
        trustCritical: z.boolean(),
        summary: z.string(),
        publishNow: z.array(z.string()),
        awaitingConfirmation: z.array(z.string()),
        hideUntilVerified: z.array(z.string())
      })
    ),
    templateContracts: z.array(
      z.object({
        template: pageTemplateSchema,
        editorialGoal: z.string(),
        requiredSlots: z.array(z.string()),
        reassuranceNeeds: z.array(z.string()),
        placeholderRule: z.string()
      })
    ),
    futurePromptChecklist: z.array(z.string()),
    bannedPublicPhrases: z.array(z.string())
  })
});

const sessionPageContent = defineCollection({
  type: "data",
  schema: z.object({
    pages: z.array(
      z.object({
        pageId: z.string(),
        sessionSlug: z.string(),
        intro: z.object({
          eyebrow: z.string(),
          title: z.string(),
          locationNotePrefix: z.string(),
          locationNoteSuffix: z.string(),
          supportingNote: z.string().optional()
        }),
        actions: z.object({
          joinLabel: z.string(),
          calendarLabel: z.string()
        }),
        atAGlanceSection: sessionAtAGlanceSectionSchema,
        expectationSection: sessionContentSectionSchema,
        supportSection: sessionContentSectionSchema,
        relatedProgrammeSection: sessionRelatedProgrammeSectionSchema.optional(),
        faqSection: headingContentSchema,
        urgentNoticeTitle: z.string(),
        fallbackNotice: actionableNoticeSchema,
        ctaBand: ctaBandSchema
      })
    )
  })
});

const programmePageContent = defineCollection({
  type: "data",
  schema: z.object({
    defaults: z.object({
      heroEyebrow: z.string(),
      overviewCardPrimaryLabel: z.string(),
      overviewCardSecondaryLabelWithSession: z.string(),
      overviewCardSecondaryLabelWithoutSession: z.string(),
      primaryActionLabelWithSession: z.string(),
      primaryActionLabelWithoutSession: z.string(),
      secondaryActionLabel: z.string(),
      deliveryModeLabels: z.object({
        liveSession: z.object({
          label: z.string(),
          summary: z.string(),
          tone: badgeToneSchema
        }),
        sessionLimited: z.object({
          label: z.string(),
          summary: z.string(),
          tone: badgeToneSchema
        }),
        overviewOnly: z.object({
          label: z.string(),
          summary: z.string(),
          tone: badgeToneSchema
        }),
        enquiryOnly: z.object({
          label: z.string(),
          summary: z.string(),
          tone: badgeToneSchema
        })
      }),
      atAGlanceSection: headingContentSchema.extend({
        audienceLabel: z.string(),
        stateLabel: z.string(),
        deliveryLabel: z.string(),
        trustLabel: z.string()
      }),
      contentSection: headingContentSchema,
      relatedSessionsSection: headingContentSchema,
      trustSection: headingContentSchema,
      ctaBand: headingContentSchema.extend({
        badges: z.array(z.string()),
        primaryActionLabelWithSession: z.string(),
        primaryActionLabelWithoutSession: z.string(),
        browseSessionsActionLabel: z.string(),
        supportActionLabel: z.string(),
        secondaryActionLabel: z.string()
      }),
      migrationNotice: noticeSchema
    }),
    pages: z.array(
      z.object({
        pageId: z.string(),
        programmeSlug: z.string(),
        hero: z
          .object({
            title: z.string().optional(),
            summary: z.string().optional(),
            badges: z.array(z.string()).optional(),
            supportingNote: z.string().optional(),
            primaryAction: actionReferenceSchema.optional(),
            secondaryAction: actionReferenceSchema.optional()
          })
          .optional(),
        experienceSection: programmeExperienceSectionSchema.optional(),
        audienceRoutesSection: programmeAudienceRoutesSectionSchema.optional(),
        relatedSessionsSection: headingContentSchema
          .extend({
            panels: z.array(iconPanelSchema).optional(),
            activeNotice: actionableNoticeSchema.optional(),
            fallbackNotice: actionableNoticeSchema.optional(),
            overviewNotice: actionableNoticeSchema.optional(),
            enquiryNotice: actionableNoticeSchema.optional(),
            emptyState: emptyStateContentSchema.optional()
          })
          .optional(),
        faqSection: headingContentSchema
          .extend({
            groupId: z.string()
          })
          .optional(),
        ctaBand: ctaBandSchema.optional(),
        evidenceNotice: noticeSchema.optional()
      })
    )
  })
});

const cmsScope = defineCollection({
  type: "data",
  schema: z.object({
    version: z.string(),
    baselinePrompt: z.number().int().positive(),
    principles: z.array(z.string()).min(1),
    ownershipClasses: z.array(
      z.object({
        id: cmsOwnershipClassSchema,
        title: z.string(),
        description: z.string()
      })
    ),
    mutationPrimitives: z.array(
      z.object({
        id: cmsMutationPrimitiveSchema,
        label: z.string(),
        description: z.string(),
        allowedFormatting: z.array(z.string()),
        maxLength: z.number().int().nonnegative()
      })
    ),
    linkPolicies: z.array(
      z.object({
        id: cmsLinkPolicySchema,
        label: z.string(),
        description: z.string()
      })
    ),
    forbiddenCapabilities: z.array(z.string()).min(1),
    adminBoundary: z.object({
      writeOrigin: z.string(),
      publicOriginWriteCapability: z.string(),
      publicReadModel: z.string(),
      draftIsolation: z.string(),
      approvalIsolation: z.string(),
      sessionBoundary: z.string(),
      deploymentBoundary: z.string(),
      rollbackBoundary: z.string(),
      unverifiedOperationalRequirements: z.array(z.string())
    }),
    capabilities: z.array(cmsCapabilitySchema).min(1),
    roles: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        can: z.array(cmsCapabilitySchema),
        cannot: z.array(cmsCapabilitySchema)
      })
    ),
    seedSources: z.array(
      z.object({
        id: z.string(),
        contentCollection: z.string(),
        sourcePath: z.string(),
        seedStrategy: z.string(),
        notes: z.string()
      })
    ),
    routeFieldRegistry: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        routePattern: z.string(),
        pageIds: z.array(z.string()),
        sourceCollections: z.array(z.string()).min(1),
        surfaces: z.array(
          z.object({
            id: z.string(),
            label: z.string(),
            ownershipClass: cmsOwnershipClassSchema,
            mutationPrimitiveId: cmsMutationPrimitiveSchema,
            sourceRef: z.string(),
            fields: z.array(z.string()),
            linkPolicyId: cmsLinkPolicySchema,
            description: z.string()
          })
        )
      })
    )
  })
});

const cmsWorkflow = defineCollection({
  type: "data",
  schema: z.object({
    version: z.string(),
    states: z.array(
      z.object({
        id: cmsWorkflowStateSchema,
        label: z.string(),
        publicVisible: z.boolean(),
        terminal: z.boolean(),
        description: z.string()
      })
    ),
    transitions: z.array(
      z.object({
        id: z.string(),
        from: cmsWorkflowStateSchema,
        to: cmsWorkflowStateSchema,
        roles: z.array(z.string()).min(1),
        requires: z.array(z.string()).min(1)
      })
    ),
    revisionModel: z.object({
      documentIdFormat: z.string(),
      revisionIdFormat: z.string(),
      versionField: z.string(),
      contentHashField: z.string(),
      diffStrategy: z.string(),
      rollbackStrategy: z.string(),
      scheduledPublishField: z.string(),
      publishedAtField: z.string(),
      supersededByField: z.string(),
      rollbackFromField: z.string(),
      authorFields: z.array(z.string()).min(1),
      noteFields: z.array(z.string()).min(1)
    }),
    publicationRules: z.object({
      publicReadModelState: cmsWorkflowStateSchema,
      allowDraftInPublicReadModel: z.boolean(),
      allowReviewStateInPublicReadModel: z.boolean(),
      allowScheduledInPublicReadModel: z.boolean(),
      previewMode: z.string(),
      publishStrategy: z.string(),
      regenerationTrigger: z.string(),
      rollbackMode: z.string()
    }),
    auditLogRequirements: z.array(z.string()).min(1)
  })
});

export const collections = {
  siteSettings,
  launchGovernance,
  pageDefinitions,
  navigation,
  resilienceStates,
  shellConfig,
  seo,
  discovery,
  homePage,
  updatesFeed,
  contactInfo,
  mediaLibrary,
  programmes,
  sessions,
  faqs,
  involvementRoutes,
  trustSignals,
  safeguardingInfo,
  legalPages,
  accessibilityStatement,
  privacyNotice,
  sitePolicy,
  storageAccess,
  consentAwareMicrocopy,
  ctaBlocks,
  notices,
  formSurfaces,
  routePages,
  editorialSystem,
  sessionPageContent,
  programmePageContent,
  cmsScope,
  cmsWorkflow
};

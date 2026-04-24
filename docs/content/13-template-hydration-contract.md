# Prompt 13 - Template Hydration Contract

Each route family now hydrates from explicit content models rather than from embedded strings.

## Route families

- Home
  - Sources: `homePage`, `navigation`, `sessions`, `programmes`, `trustSignals`, `formSurfaces`, `contactInfo`
  - Loader: `getHomePageModel()`

- About
  - Sources: `routePages.about`, `trustSignals`
  - Loader: `getAboutPageModel()`

- Privacy
  - Sources: `routePages.privacy`, `contactInfo`
  - Loader: `getPrivacyPageModel()`

- Programmes index
  - Sources: `routePages.programmes`, `programmes`
  - Loader: `getProgrammesIndexModel()`

- Programme detail
  - Sources: `programmePageContent.defaults`, `programmePageContent.pages`, `programmes`, `sessions`
  - Loader: `getProgrammeDetailModel(slug)`

- Sessions index
  - Sources: `routePages.sessions`, `sessions`, `faqs`, `contactInfo`
  - Loader: `getSessionsIndexModel()`

- Session detail
  - Sources: `sessionPageContent.pages`, `sessions`, `programmes`, `contactInfo`
  - Loader: `getSessionDetailModel(slug)`

- Contact
  - Sources: `routePages.contact`, `formSurfaces`, `faqs`, `contactInfo`
  - Loader: `getContactPageModel()`

- Get involved
  - Sources: `routePages.get-involved`, `formSurfaces`, `faqs`, `involvementRoutes`
  - Loader: `getGetInvolvedPageModel()`

- Safeguarding
  - Sources: `routePages.safeguarding`, `safeguardingInfo`
  - Loader: `getSafeguardingPageModel()`

- Volunteer
  - Sources: `routePages.volunteer`, `formSurfaces`, `faqs`
  - Loader: `getVolunteerPageModel()`

- Partner
  - Sources: `routePages.partner`, `formSurfaces`, `faqs`, `involvementRoutes`
  - Loader: `getPartnerPageModel()`

- Placeholder routes and 404
  - Sources: `routePages.*.emptyState`
  - Loaders: `getEventsUpdatesPlaceholderModel()`, `getLegalPlaceholderModel(pageId)`, `getNotFoundModel()`

## Contract rules

- Routes receive presentation-ready models.
- Templates may omit optional blocks, but required blocks are enforced before render.
- All route actions resolve through route ids or explicit hrefs.
- Media always resolves through the shared media catalog.

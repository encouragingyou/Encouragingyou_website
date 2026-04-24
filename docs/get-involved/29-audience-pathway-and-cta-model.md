# Prompt 29 - Audience Pathway and CTA Model

The hub now distinguishes five public intents.

## Pathway map

- `Join a session`
  - state: `live-route`
  - immediate route: `/sessions/`
  - launch rule: reflect live vs limited session availability honestly
- `Volunteer with us`
  - state: `route-ready`
  - immediate route: `/volunteer/`
  - launch rule: pathway can be public before deeper role detail exists
- `Partner with us`
  - state: `route-ready`
  - immediate route: `/partner/`
  - secondary route: `/contact/`
  - launch rule: keep the route enquiry-led without implying formal partnership machinery
- `Refer someone`
  - state: `contact-led`
  - immediate route: `/contact/`
  - launch rule: referral visitors must not be forced through volunteer language
- `Support in another practical way`
  - state: `opportunity-route`
  - immediate route: `/contact/`
  - supporting route: editorial opportunity spotlight when present

## CTA hierarchy

- Hero CTAs stay narrow: `Join a session` first, `Contact the team` second.
- The featured card gives the live sessions route the highest on-page intensity because it is the clearest public next step today.
- Secondary pathway cards keep their own immediate action and optional fallback action.
- The spotlight surface can point to a current editorial opportunity without replacing pathway routing.
- The closing CTA band repeats only the strongest operational exits: Sessions, Volunteer, Contact.

## Result

Users can now tell:

- which routes are immediately usable
- which routes are still enquiry-led
- where wider support belongs when it does not fit a named pathway

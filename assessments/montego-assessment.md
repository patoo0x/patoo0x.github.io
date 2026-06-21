# Montego Assessment

Date: 2026-06-21
Status: Assessed

## Verdict

Montego is not dead, but the original broad framing is too exposed after looking at Satlantis. Satlantis already occupies much of the Bitcoin-native real-world discovery surface: events, calendars, communities, destinations/places, Nostr identity, built-in Lightning wallets, ticketing, host tools, audience building, and global Bitcoin payments.

The remaining Montego wedge is narrower and more local: verified Caribbean lodging and hospitality for Bitcoin communities, starting with Jamaica and Island Bitcoin. The winning product would look less like "Airbnb on Nostr" and more like a trusted local hospitality layer around Bitcoin meetups, retreats, conferences, and founder/operator travel.

## Satlantis Competitor Read

Satlantis is a direct adjacent competitor, even if it is not currently a lodging marketplace.

What Satlantis already claims:

- Social discovery for events and experiences
- Event creation/import, ticketing, calendars, collections, and community/audience building
- Built-in Bitcoin/Lightning wallets for users, events, calendars, and eventually communities
- Bitcoin and fiat payments, with Stripe support for fiat
- Nostr integration for identity, following, and portable social graph
- Venue/location surface, including Bitcoin tipping and location wallets
- Real traction in Bitcoin conferences, meetups, workshops, retreats, and local communities

This overlaps with Montego's beachhead because Bitcoin travel demand often starts around events. If Satlantis expands from "events and places" into "stays around events," Montego's broad marketplace position gets squeezed.

## Positioning Risk

The original idea says properties list as Nostr events and guests book with Lightning. Satlantis is already training Bitcoin communities to treat events, calendars, communities, and venues as Bitcoin-native objects with wallets attached. That means Montego cannot rely on "Bitcoin-native travel discovery" as the moat.

Key risks:

- Satlantis can bundle lodging recommendations or partner stays around conferences and retreats.
- Event organizers already have the audience relationship on Satlantis.
- Satlantis can monetize hosts before Montego gets property liquidity.
- "Nostr + Lightning" is not enough differentiation if Satlantis owns the event graph.

## Remaining Wedge

Montego still has a credible wedge if it avoids broad marketplace sprawl:

- Caribbean-first verified stays for Bitcoin travelers
- Property verification and host trust, not just listings
- Local concierge layer for airport pickup, SIM/eSIM, coworking, food, safety, and meetup routing
- Lightning escrow for stays, deposits, and disputes
- Guesthouse/operator onboarding where Airbnb/Booking are costly or weak
- Island Bitcoin as a real community distribution channel

This wedge is operationally harder than software-only Satlantis, but that is also the defensibility. Verification, host relationships, and local trust are harder to copy than a Nostr event schema.

## Product Recommendation

Do not build a general travel marketplace first.

Run a concierge MVP:

- 5-10 verified Jamaica properties
- Manual booking flow with Lightning invoice/payment support
- Island Bitcoin attendee/referral beachhead
- Simple public page, not a protocol-first app
- Optional Nostr identity/sign-in and host badge later
- Track demand by booking requests, nights booked, average booking value, repeat hosts, and dispute rate

If the manual wedge works, then formalize the protocol/listing layer. If it does not, the protocol does not matter.

## Revenue

The 1-2% escrow fee is probably too thin at low volume. Better early model:

- 5-8% concierge/booking fee for verified local stays
- Optional host verification/setup fee
- Premium retreat/conference lodging coordination
- Later: lower-fee self-serve booking once inventory and demand exist

## Decision

Keep Montego as assessed, not killed. Rename the strategy from "Nostr-native hospitality marketplace" to "verified Bitcoin Caribbean stays." Treat Satlantis as the main adjacent competitor and avoid competing head-on in events, calendars, and generic place discovery.

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase, not greenfield:

- **Frontend** (`app/`): Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, Axios.
- **Backend** (`api/`): NestJS, Prisma ORM (PostgreSQL), BullMQ (background jobs), Elasticsearch, Google Cloud Storage, Stripe, OpenAI SDK.

Both apps were bootstrapped from a shared internal starter template. `api/src/modules` currently only has scaffold modules (`auth`, `google-maps`, `health`, `internal`, `stripe`) inherited from that template — the actual voice-agent domain (agents, CRM integrations, calls, knowledge, campaigns) has not been built yet. `app/DESIGN.md` is also inherited from the template (a fintech tipping product called "Delitip") and does not describe this product — see Brand Commitments.

## Users

Employees at businesses who want to automate outbound/inbound phone calls without hiring engineers or learning AI-calling infrastructure. Sold and used directly by these businesses (not white-labeled through agencies or resellers). Within a company account, team members hold one of four roles — Owner, Admin, Member, Viewer — collaborating on shared agents, CRM connections, knowledge, and call history.

First real-world use case: real-estate teams following up with property leads. The product itself must not be built around that one industry.

## Product Purpose

Let a business create, configure, and run its own AI phone-calling agents — agents that call or receive calls, follow structured goals, use the business's CRM and knowledge, and report back clear, structured results — without the business ever needing to understand or manage the AI/voice infrastructure underneath.

Success: a business can go from signing up to a live, CRM-connected agent handling real calls — with accurate outcomes, reliable CRM updates, and full visibility into transcripts/costs — with zero engineering effort on their side.

## Positioning

A generic, CRM-agnostic voice-agent platform, not a vertical tool for one CRM or one industry. The underlying AI calling technology is fully abstracted behind the platform's own concepts ("agents," "calls," "outcomes") — the business never sees or configures a named third-party AI vendor, and we can swap or add voice-technology providers later without disrupting customers.

[Inferred, not directly confirmed by the user: the meaningful difference from a business using a raw voice-AI vendor's dashboard directly is (a) this vendor-agnostic abstraction, (b) fine-grained, per-CRM tool permissions so an agent only ever gets the specific CRM actions it needs, and (c) structured goals/outcomes instead of a single free-text prompt. Confirm this framing before it drives marketing claims.]

## Operating Context

Core workflow: register → create an agent (plain-language instructions + structured goals, questions, outcomes) → connect a CRM (or a custom API-based CRM) → map CRM fields → grant the agent only the specific CRM actions it needs → add knowledge sources → assign a phone number → test → activate.

Once live: calls run within configured calling hours, retried on no-answer/busy/failed/voicemail per configurable rules; each call is personalized upfront using data pulled from the CRM; a call may detect voicemail or transfer to a human team member when needed; every call writes back a structured outcome, a CRM update, a cost breakdown, and a transcript for review. All data, agents, and settings are scoped per company (multi-tenant, strictly isolated between companies).

The full, detailed feature spec (client-facing, non-technical) lives at `docs/Product_Specification.md` — 46 sections covering every screen and workflow. Treat it as the source of truth for feature detail; this file holds the durable product truth behind it.

## Capabilities and Constraints

Confirmed capabilities:

- Multiple agents per company, each with its own voice, language, phone number, CRM connection, knowledge sources, instructions, structured goals/questions, and defined outcomes.
- CRM connections to HubSpot, Salesforce, Pipedrive, Zoho, and any custom REST API; per-CRM field mapping; per-agent, per-tool CRM action permissions (an agent only gets the specific actions it's explicitly granted).
- Knowledge base from typed text or uploaded files (`.txt`, `.md`, `.doc`, `.docx`), versioned, searchable live during calls.
- Automatic call personalization from CRM data, voicemail detection, and live transfer to a human team member.
- Full call detail: transcript, AI summary, extracted structured data, CRM actions taken, cost breakdown, technical event log.
- Automatic, retried CRM updates after each call; failures surfaced, never silent.
- Company-level and agent-level usage/cost analytics; audit log of every important account action.
- Role-based access (Owner/Admin/Member/Viewer), full company data isolation.

Explicitly undecided / deferred:

- **Campaigns** (bulk lead lists, filters, scheduled batch calling) — Version 2, explicitly out of scope for the first release. v1 uses only per-agent scheduling and retry rules.
- Text-based agent simulator (no live call) — planned, not in v1.
- External knowledge connections (Google Docs, Notion, Drive, Dropbox, SharePoint) and the broader integrations layer (Calendar, Gmail, Slack, etc.) — future, architecture must allow adding these without a redesign.

Hard constraints:

- The underlying AI voice-calling vendor must never be named, exposed, or configurable to end users.
- The AI can only ever *request* a CRM/tool action; the backend must authorize and execute it — never direct access.
- No CRM/provider secret may ever reach the frontend.
- Historical call costs must never change retroactively even when provider pricing changes.

## Brand Commitments

No product name has been chosen yet — every document so far refers to it generically as "the platform." No logo, voice, or visual identity has been established for this product.

`app/DESIGN.md` in this repo is inherited from the shared starter template and describes an unrelated fintech tipping product ("Delitip"); it is not this product's identity and must not be treated as one.

## Evidence on Hand

None yet — no real customer data, testimonials, case studies, or press. Future work must not fabricate customer names, pricing, or benchmark claims. The real-estate lead-follow-up scenario used throughout the spec is an illustrative first use case, not a confirmed customer.

## Product Principles

1. **Multi-tenant, per-company data isolation from day one** — every query scoped by company, never trusted from the client.
2. **Never lock into one CRM or one underlying voice-AI vendor** — both sit behind the platform's own abstraction so either can change without disrupting customers.
3. **Structured goals and outcomes drive agent behavior**, not a single free-text prompt — predictability over cleverness.
4. **The AI can request actions; only the backend authorizes and executes them** — it never touches a business's CRM or systems directly.
5. **Full observability, nothing fails silently** — every call, action, provider event, and cost is visible and auditable to the business.

## Accessibility & Inclusion

Target: WCAG 2.1 AA compliance across the web app.

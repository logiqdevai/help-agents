# AI Voice Agent Platform — Product Specification

## 1. Overview

We want a platform (accessible online, usable by multiple companies) where businesses can create their own AI "voice agents" — AI assistants that can make and receive phone calls on their behalf.

Through the platform, a business should be able to:

- Create multiple AI voice agents for different purposes.
- Connect the CRM (customer database) systems they already use.
- Tell each agent what its job is (e.g. following up with leads, confirming appointments).
- Give agents the information they need to answer questions correctly.
- Have agents make and receive phone calls.
- Automatically update the CRM after every call with the outcome.
- Review call transcripts, results, and costs.
- Set rules for automatic follow-up calls.
- In the future, connect other tools such as Google Docs and Notion so agents can pull information from them.

The platform uses a third-party AI phone-calling technology behind the scenes to actually place and receive calls. This is an internal detail — customers using the platform should never need to see, understand, or configure that underlying technology. From their point of view, they are simply using "the platform."

---

## 2. Accounts & Login

Businesses sign up and log in like any standard web application.

### Signing up

Required information:

- Name
- Email
- Password
- Company name

Optional information:

- Phone number
- Company website

### Logging in

Supported login methods:

- Email and password

### Account features

- Email verification
- "Forgot password" and password reset
- Logout
- Ability to be logged in on multiple devices
- Profile settings (name, timezone, language, company details)

---

## 3. Companies & Teams

Each customer using the platform is its own separate company account, completely isolated from every other company's data. A company can invite multiple team members to work together inside their account, each with a different level of access.

A company account contains its own:

- Team members
- Voice agents
- CRM connections
- Knowledge (information given to agents)
- Call history
- Usage and billing
- Settings

This means a company can have several employees sharing the same agents, CRM connections, and reporting — with usage and billing tracked at the company level.

### Team roles

**Owner** — Full access to everything.

**Admin** — Can manage agents, integrations, knowledge, team members, and settings.

**Member** — Can use and view the agents and calls they've been given access to.

**Viewer** — Read-only access; can look but not change anything.

Over time, permissions should become more fine-grained rather than being limited to these four fixed roles.

---

## 4. Dashboard

When a user logs in, they see a summary of recent voice-agent activity.

Example of what this might look like:

```
Calls today               128
Successful calls           94
Interested leads           41
Appointments booked         9
Average call length     2m 41s
AI cost today            €18.42
```

Additional information shown on the dashboard:

- Calls over time (a chart)
- Successful vs. unsuccessful calls
- Breakdown of call outcomes
- Which agents have been most active
- Estimated costs
- Recent calls
- Failed calls that need attention
- Follow-ups that are still pending

---

## 5. Voice Agents

Voice agents are the core of the product. A company can create as many agents as they need, each configured for a different purpose.

Each agent has:

- A name and description
- A stated purpose (what it's for)
- A status (active/inactive)
- A chosen voice and language
- A phone number
- A CRM connection
- Knowledge it can draw on
- Instructions for how to conduct the call
- Goals it's trying to achieve
- Questions it should try to get answered
- Definitions of what counts as a "successful" vs. "unsuccessful" call

**Example agent:**

```
Agent: Lead Follow-up Agent

Description:
Follows up with new leads and finds out whether they
are still interested.

Goal:
Determine lead interest and next steps.

Questions:
1. Are you still interested?
2. Do you have any questions?
3. Would you like someone from our team to contact you?

Success:
Customer confirms they are still interested.

Possible outcomes:
Interested / Not Interested / Call Back Later / Unknown
```

---

## 6. Agent Instructions

Each agent has a large text box where the business describes, in plain language, how the agent should behave.

**Example:**

```
You are a customer follow-up assistant.

Your goal is to find out whether the customer is still
interested in our product or service.

Be polite and concise.

Ask the following questions naturally, in conversation —
not like a script.

Never make up information you don't have.

If the customer asks something you can't answer, explain
that a member of the team will get back to them.

End the call once you've achieved the goal.
```

The platform takes this plain-language description and turns it into whatever configuration is needed to run the actual call — the business never has to deal with that technical layer.

---

## 7. Agent Goals

Instructions written in plain language aren't always reliable enough on their own, so each agent also has a structured goal — a checklist of information it needs to come away with.

**Example:**

```
Goal: Determine customer interest

Must find out:
☐ Are they interested?
☐ If not, why not?
☐ Do they want a callback?
☐ Do they want an appointment?

Nice to know:
☐ Preferred date
☐ Preferred time
☐ Any questions they had
☐ Any objections raised
```

This structured goal makes the agent's behaviour and results far more predictable and consistent than relying purely on free-text instructions.

---

## 8. Agent Questions

Businesses can build a list of questions for an agent to work through during a call.

**Example:**

```
Questions

1. Are you still interested?
   Must be answered: Yes

2. Do you have any questions?
   Must be answered: No

3. Would you like us to contact you?
   Must be answered: Yes

[+ Add question]
```

Importantly, the agent doesn't have to ask these in a rigid script or exact order — it should have a natural conversation and work these questions into it, the way a human would.

---

## 9. Call Outcomes

Every agent should have a defined list of possible outcomes for its calls.

**Example outcomes:**

```
Interested
Not Interested
Call Back Later
Appointment Requested
Voicemail
Wrong Number
No Answer
Unknown
```

Each outcome can automatically trigger follow-on actions. For example:

```
Interested
   → Update the CRM to show "Interested"

Appointment Requested
   → Update the CRM
   → Create a calendar event

Not Interested
   → Update the CRM
   → Close the follow-up
```

The platform should also automatically recognize when a call has reached an answering machine/voicemail rather than a person, so it's logged accurately as its own outcome (instead of being mistaken for "Interested" or "Unknown"). Where a business wants this, the agent can leave a short, pre-approved message before hanging up.

---

## 10. Talking to a Human When Needed

Sometimes a caller wants to speak to a real person, or asks something the agent genuinely isn't able to handle. Rather than getting stuck or ending the call, the agent should be able to hand the live call off to a member of the business's team.

Businesses can set up, per agent, when this should happen:

```
Transfer this call to a real person when:
  ☐ The customer explicitly asks for a human
  ☐ The agent can't resolve the conversation
  ☐ A specific outcome is reached (e.g. "Complaint")

Transfer to:
  A specific phone number or team extension
```

If no one is available to take the transferred call, the agent should fall back gracefully — for example, by taking a message, letting the customer know someone will call them back, and logging it as a follow-up rather than leaving the customer stuck.

---

## 11. CRM Connections

The platform needs to work with whatever CRM (customer relationship management) system a business already uses — it shouldn't be built around any one specific CRM or industry.

It should be able to connect to systems that handle things like:

- Logging in / authenticating
- Contacts
- Leads
- Companies
- Deals/opportunities
- Activity history
- Notes
- Custom fields specific to that business

**CRMs we'd like to support:**

- HubSpot
- Salesforce
- Pipedrive
- Zoho
- Any custom/in-house CRM
- Any system with a general-purpose API

New CRM connections should be something we can add over time without reworking the whole platform.

Each CRM we support comes with its own list of available tools/actions (for example, HubSpot and Salesforce don't organize contacts, leads, or notes in exactly the same way). When a business connects a CRM, the platform should show them the specific list of tools that CRM offers, not a generic one-size-fits-all list. See [What the AI Can Do in Your CRM](#14-what-the-ai-can-do-in-your-crm) for how this works when setting up an agent.

---

## 12. Connecting a Custom CRM

If a business uses an in-house or less common CRM, they should be able to connect it themselves by entering:

```
CRM name
Web address (base URL)
API key
How it authenticates
Link to its API documentation
```

Supported ways of authenticating:

```
API key
Bearer token
Basic username/password auth
OAuth2 (the same "log in with..." style flow used by Google, etc.)
Custom headers
```

For security, API keys and tokens must always be stored encrypted, and once saved, the full key/token should never be shown again in the interface — only a masked version, if anything.

---

## 13. Matching Fields Between Systems

Every CRM names its fields slightly differently, so businesses need a simple way to tell the platform which of their CRM's fields correspond to which of ours.

**Example:**

```
Our field                Their CRM's field

Customer name       →    Contact Name
Phone                →    Phone Number
Call outcome         →    Lead Status
Call summary          →    Activity Note
Interest level        →    Custom Field: Interest
Next follow-up date    →    Next Follow-up
```

This mapping is saved per CRM connection (or per agent), so it only needs to be set up once.

---

## 14. What the AI Can Do in Your CRM

Agents should only be able to take actions in a company's CRM that the company has explicitly allowed — nothing more.

Every CRM offers a different set of possible actions, so the platform should show the business the specific list of tools available for the CRM they've actually connected, rather than one generic list for every CRM. When setting up an agent, the business picks — tool by tool — exactly which of those actions this particular agent is allowed to use.

**Example: tools available for a HubSpot connection**

```
☐ Look up a contact
☐ Look up a deal
☐ Update a contact
☐ Update a deal stage
☐ Add a note to a contact
☐ Log an activity
☐ Update a custom property
☐ Create a task
```

**Example: tools available for a Salesforce connection**

```
☐ Look up a lead
☐ Look up an opportunity
☐ Update a lead
☐ Update an opportunity stage
☐ Add a note
☐ Log a call
☐ Update a custom field
☐ Create a follow-up task
```

**Example: choosing tools for a specific agent (HubSpot connection)**

```
Lead Follow-up Agent — CRM tools

This agent is allowed to:
✓ Look up a contact
✓ Update a contact
✓ Add a note to a contact

This agent is NOT allowed to (left unchecked):
☐ Look up a deal
☐ Update a deal stage
☐ Log an activity
☐ Update a custom property
☐ Create a task
```

This way, a simple lead follow-up agent only ever gets access to the handful of actions it actually needs, while a more advanced agent for a different purpose could be given a wider set of tools — and businesses can see and adjust exactly what each agent is allowed to touch in their CRM at any time.

---

## 15. Personalizing Calls Automatically

Before an agent makes a call, the platform should automatically pull the relevant details about that person from the connected CRM — their name, history, and anything relevant to the reason for the call — and hand it to the agent ahead of time.

This means the agent doesn't start a call "blind." For example, before dialing, it might already know:

```
Customer name:      Maria Papadopoulou
Last contact:        14 days ago
Interested in:        2-bedroom apartment, Athens center
Previous notes:       Asked about pricing, budget ~€180,000
```

The agent can then open the conversation naturally ("Hi Maria, following up about the apartment you enquired about...") instead of asking the customer to repeat information the business already has.

Exactly which details get passed to the agent should be configurable per agent, based on the field mapping described in [Matching Fields Between Systems](#13-matching-fields-between-systems).

---

## 16. Knowledge Base

Agents often need business-specific information to answer questions correctly — pricing, policies, FAQs, product details, and so on. The platform should provide a central place to manage this information.

### Ways to add knowledge

**Type it directly**, for things like:

- Company information
- Policies
- FAQs
- Instructions
- Product details
- Scripts

**Upload a file**, supporting:

- Plain text (`.txt`)
- Markdown (`.md`)
- Word documents (`.doc`, `.docx`)

When a document is uploaded, the platform automatically processes it behind the scenes (extracting and organizing the text) so the information becomes something the AI agents can actually search and use, live, while talking to customers.

---

## 17. Knowledge Sources

Each piece of knowledge should show:

```
Name
Type (typed text or uploaded file)
Status (still processing / ready to use)
Who added it
When it was added
When it was last updated
When it was last refreshed for the AI
Which agents are using it
```

**Example:**

```
Property FAQ.md
Status: Ready ✓

Used by:
Lead Follow-up Agent
Sales Agent
```

---

## 18. Keeping a History of Changes

When a business updates a piece of knowledge, the platform shouldn't just overwrite the old version — it should keep a history.

```
Property FAQ
Version 1
Version 2
Version 3
```

Businesses should be able to:

- View an older version
- Restore an older version
- Refresh how the AI uses the current version
- Turn a source off without deleting it

This matters because it lets a business look back and see exactly what information an agent had access to at the time of a specific past call.

---

## 19. Future Knowledge Connections

Eventually, instead of only uploading files, businesses should be able to connect other tools directly so agents can pull knowledge straight from them, such as:

```
Google Docs
Notion
Google Drive
Dropbox
SharePoint
```

alongside the typed text and uploaded files already supported. This should be built so that adding a new source like this later doesn't require redesigning the whole knowledge system.

---

## 20. Other App Connections

Beyond CRMs and knowledge sources, the platform should have a general "Integrations" area for connecting other business tools over time, such as:

- Google Docs
- Notion
- Google Calendar
- Google Drive
- Gmail
- Slack
- HubSpot
- Salesforce
- Other business apps

---

## 21. Calls

A dedicated section listing every call made or received through the platform.

**Columns shown:**

```
Date
Agent
Contact
Phone number
Direction (inbound/outbound)
Duration
Status
Outcome
Cost
```

**Filters available:**

- Agent
- Date range
- Outcome
- Status
- Direction
- Contact
- CRM

---

## 22. Call Details

Clicking on a call opens a detailed view.

**Example:**

```
Call #18372

Agent:      Lead Follow-up
Contact:    John Smith
Phone:      +30...
Started:    14:31
Duration:   02:43
Status:     Completed
Outcome:    Interested
Cost:       €0.38
```

If a call was handed off to a team member, its status should show as **Transferred** rather than **Completed**, so it's easy to tell apart from calls the agent finished on its own.

This detail view includes:

**Transcript** — the full written conversation.

**Summary** — an AI-generated summary of the call.

**Information gathered**, for example:

```
Interested: Yes
Wants callback: Yes
Question asked: Pricing
Preferred time: Afternoon
```

**CRM actions taken**, for example:

```
✓ Lead updated
✓ Note created
✓ Follow-up created
```

**Behind-the-scenes activity log** — a technical trail of what happened during the call (agent started, CRM contact looked up, call started, an action was taken, call ended, CRM updated), useful mainly for troubleshooting.

---

## 23. Call Costs

Every call's cost should be tracked individually and broken down clearly.

**Example:**

```
AI cost            €0.27
Phone/telephony    €0.09
--------------------------
Total              €0.36
```

Costs should never be hard-coded — pricing can change over time depending on our providers, so the platform needs to track pricing changes while still ensuring that a call made in the past always keeps showing the cost that was actually calculated for it at the time, even if prices have changed since.

---

## 24. Usage Reports

**Company-wide totals:**

```
Total calls
Total minutes
Completed calls
Failed calls
Average call duration
Total cost
Average cost per call
Cost per successful outcome
```

**Per-agent breakdown:**

```
Calls made
Success rate
Average duration
Average cost
Outcomes
```

**Time periods available:**

```
Today
Last 7 days
Last 30 days
Custom date range
```

---

## 25. Call Recordings

Where supported and legally allowed, calls can be recorded and stored for playback.

**On the call detail page:**

```
▶ Recording (03:14)
[Download]
```

Businesses should be able to set how long recordings are kept, at the company level.

---

## 26. Scheduling Calls

Agents need a way to know who to call and when, rather than calling people one at a time by hand.

```
A scheduling/follow-up rule identifies a contact
   → checks if they're eligible to be called right now
   → places the call
```

In the first version, this works through the simple scheduling and retry rules below, applied per agent. The full [Campaigns](#37-campaigns-version-2--not-part-of-the-first-release) feature — for defining bulk lead lists, filters, and schedules — is planned for Version 2.

**Scheduling options:**

```
Call immediately
Call after a set number of minutes
Call tomorrow
Call on a specific date
Retry automatically if there's no answer
```

---

## 27. Calling Hours

Each company can set the hours during which their agents are allowed to make calls.

```
Monday     09:00–18:00
Tuesday    09:00–18:00
...
Sunday     No calling
```

The system must never place automated calls outside a company's allowed hours, and the company's timezone should be configurable.

---

## 28. Retry Rules

Businesses can configure how the system should retry a call that didn't go through.

```
Maximum number of attempts
Delay between attempts
Allowed calling hours
Retry when the call was: not answered / busy / failed / reached voicemail
```

**Example:**

```
Attempt 1 → no answer
   wait 2 hours
Attempt 2 → no answer
   wait 24 hours
Attempt 3 → still no answer
   stop trying
```

---

## 29. Automated Follow-ups

Eventually, the platform should support simple "when this happens, do that" automation rules.

**Example:**

```
WHEN a call's outcome is "Interested"
THEN:
  - Update the CRM
  - Add a note
  - Schedule a follow-up call in 2 days
```

**Another example:**

```
WHEN a call's outcome is "Appointment Requested"
THEN:
  - Create a calendar event
  - Update the CRM
  - Send a confirmation
```

These rules should be flexible building blocks that businesses (or we) can combine in different ways, rather than fixed, one-off behaviors.

---

## 30. Phone Numbers

Businesses can assign phone numbers to their agents. There are two ways a business can get a number for an agent:

**Provisioned for them** — the platform obtains a new phone number on the business's behalf, ready to use right away.

**Bring their own number** — a business connects a phone number it already owns, so customers keep calling (and being called from) a number they already recognize.

**Example:**

```
Phone Numbers

+30 21 XXXXXXX
Source: Provisioned by platform
Assigned to: Lead Follow-up Agent
Status: Active

+30 21 YYYYYYY
Source: Business's own number
Assigned to: Sales Agent
Status: Active
```

The system should be built so that, in the future, phone numbers could be sourced from a different telephony provider without disrupting how this feature works for customers.

---

## 31. Keeping the Technology Behind the Scenes

The platform is built on top of a third-party AI voice-calling technology, but this should be treated purely as internal infrastructure — never shown to the customer as a product name, setting, or dependency they need to think about.

Customers should never see or need to configure:

```
The underlying provider's internal agent ID
The underlying provider's API key
The underlying provider's webhook or notification settings
Any other provider-specific configuration
```

This also means that if we ever need to switch to a different underlying voice-calling technology, or add another one, it should be possible to do so behind the scenes without disrupting how customers use the platform.

Wherever the underlying technology already offers a capability out of the box — such as detecting voicemail, transferring a call to a human, or personalizing a call with details ahead of time — the platform should build on top of that rather than recreating it from scratch. This keeps the product reliable and lets us ship these capabilities sooner.

---

## 32. Activity Log

Every important action taken in an account should be logged, so a business can always see a clear history of what happened and who did it.

**Example:**

```
22 Sep, 14:31 — Petros created Agent "Lead Follow-up"
22 Sep, 14:35 — Agent updated
22 Sep, 14:42 — Call started
22 Sep, 14:45 — CRM lead updated
22 Sep, 14:46 — Knowledge source uploaded
```

Each entry should record who did it, what company account it happened in, what the action was, what it affected, and when.

---

## 33. Handling Errors

Businesses need to be told clearly when something has gone wrong, rather than things silently failing.

**Examples of things that should be surfaced:**

```
CRM connection failed
AI service temporarily unavailable
Phone call failed to connect
Knowledge upload failed to process
CRM update failed
Invalid phone number
No available phone number to make the call
```

**Example of how this should appear:**

```
Call completed
⚠ CRM update failed
[Retry CRM update]
```

Importantly, if something downstream (like the CRM update) fails, the call itself and its results should still be saved and visible — nothing should be lost.

---

## 34. Fixing Failed CRM Updates

If updating a company's CRM after a call fails for some reason, the platform shouldn't just give up.

```
Call completed → CRM update attempted → fails
```

Instead, it should automatically retry a few times, spacing the attempts out:

```
Retry 1 → after 1 minute
Retry 2 → after 5 minutes
Retry 3 → after 30 minutes
Retry 4 → after 2 hours
```

If it still hasn't succeeded after that, it should be flagged clearly as "needs attention" so someone can look into it.

---

## 35. Testing an Agent Before Going Live

Before turning an agent on for real, businesses should be able to test it.

**Test a real call:**

The user enters a name and phone number (optionally linked to an existing CRM contact) and places a live test call to try the conversation out.

**Text-based simulator (planned for later):**

A simple back-and-forth chat where the user can type as if they were the customer and see how the agent responds, without needing to make an actual phone call.

```
Agent: Hello, how can I help?
Customer: I'm interested but I have a question.
Agent: ...
```

---

## 36. Agent Overview Page

Each agent has its own page summarizing everything about it at a glance.

**Example:**

```
Lead Follow-up Agent
Status: Active

Goal:
Determine customer interest.

Knowledge:
3 sources

CRM:
HubSpot

Phone:
+30...

Voice:
Greek / Female

Calls made:
342

Success rate:
68%

[ Test Agent ]   [ Edit ]   [ Start Campaign ]*
```

*The "Start Campaign" button becomes available once [Campaigns](#37-campaigns-version-2--not-part-of-the-first-release) ships in Version 2.

---

## 37. Campaigns *(Version 2 — not part of the first release)*

This is a planned feature for a later version of the platform, once the core product is up and running. In the first version, agents are triggered directly (manual test calls, and the simple scheduling/retry rules described earlier) rather than through a full campaign system.

It's useful to separate the idea of an **agent** (how it behaves) from a **campaign** (who it should call, and when).

- **Agent** = how the AI behaves during a call.
- **Campaign** = which contacts it should call, and on what schedule.

**Example:**

```
Campaign: September Lead Follow-up
Agent: Lead Follow-up Agent
Source: CRM leads
Filter: Status = New, created more than 24 hours ago
Calling hours: 09:00–18:00
Maximum attempts per contact: 3
```

Separating these two concepts makes it much easier to reuse the same agent across different calling campaigns, rather than having to rebuild the calling logic every time.

The underlying calling technology already has built-in support for placing many outbound calls from a list in one batch, so Campaigns in Version 2 should build directly on top of that capability rather than us needing to build bulk-calling from scratch.

---

## 38. Contacts / Call Targets

The platform doesn't need to become a full CRM in its own right — a business's real customer data should stay in their actual CRM. The platform just needs a lightweight record of who to call and how that person links back to the CRM:

```
Reference ID in the CRM
Name
Phone
Email
Which CRM connection they belong to
What kind of CRM record they are (contact, lead, etc.)
A link back to their record in the CRM
Any other relevant details
```

---

## 39. Security & Privacy

The platform handles potentially sensitive business and customer information, so the following must be guaranteed:

**Credentials** — Any CRM or third-party API keys/tokens must always be stored encrypted, never in plain text.

**Company data isolation** — One company must never be able to see or access another company's data, under any circumstances.

**Secrets stay on the server** — CRM keys, the underlying voice-technology API key, and any other provider credentials must never be exposed to the browser/frontend, where they could be seen or extracted.

**Verified notifications** — Any automated notifications coming in from outside providers must be verified as genuinely coming from that provider before being trusted.

**Access control** — Every action a user takes should be checked against their company membership and their role/permissions.

**Data deletion** — A company should be able to request full deletion of their account and data.

---

## 40. What's in the Menu

Suggested navigation for the platform:

```
Dashboard

Agents
  - All Agents
  - Create Agent
  - Agent Details

Calls
  - All Calls
  - Call Details

Campaigns (Version 2)

Knowledge
  - Sources
  - Add Knowledge

Integrations
  - CRM
  - Google
  - Notion
  - Other Apps

Phone Numbers

Analytics

Settings
  - Organization
  - Team
  - Security
  - Account
```

---

## 41. Creating an Agent, Step by Step

Rather than one long form, creating an agent should walk the user through a short guided process:

**Step 1 — Basics**
Name, description, purpose.

**Step 2 — Behavior**
Instructions, goals, questions, possible outcomes, and whether/when to transfer to a human.

**Step 3 — Knowledge**
Pick which knowledge sources this agent can use.

**Step 4 — CRM**
Pick a CRM connection, then choose only the specific tools/actions (from that CRM's own list of available actions) this agent needs, and map the fields.

**Step 5 — Phone**
Assign a phone number — either one provisioned by the platform, or one the business already owns.

**Step 6 — Test**
Try the agent out before going live.

**Step 7 — Activate**
Turn the agent on.

---

## 42. Works for Any Industry

The platform must not be built around any one specific industry or business type — it should work for anyone, with the specifics defined by how each business configures its own agents.

We should avoid baking in industry-specific concepts like "property," "real estate," "listing," or "viewing" into the platform itself. Instead, it should use general concepts like:

```
Contact
Record
Opportunity
Company
Customer
Product
Service
Appointment
Outcome
```

**Example uses across different industries:**

- **Sales** — Qualify new leads.
- **Customer service** — Follow up with customers after a support request.
- **Recruitment** — Call candidates and collect their availability.
- **Appointments** — Confirm upcoming appointments.
- **Insurance** — Follow up with prospective customers.
- **Real estate** — Follow up with property leads.
- **Restaurants** — Confirm reservations.

While our first real-world use case is real-estate lead follow-up, the platform itself should work as a general-purpose AI voice agent tool for any business.

---

## 43. Future: Agents Using More Tools

Eventually, agents should be able to make use of more tools during a conversation, such as:

```
CRM
Calendar
Email
Knowledge base
Web search
Company database
Google Docs
Notion
Slack
```

**Example:**

```
Customer: "Can we schedule this for Friday?"
   → Agent checks the calendar
   → Confirms availability
   → Books the appointment
   → Updates the customer's CRM record
```

The AI should only ever be able to *request* an action — the platform itself decides whether to actually carry it out.

---

## 44. Keeping AI Actions Safe

This is an important principle for how the whole platform should work: the AI should never be able to directly take action on a business's systems. It can only *request* an action, which the platform then checks and carries out on its behalf.

```
The AI decides it wants to do something
        ↓
It requests that action through the platform
        ↓
The platform checks:
  - Is this agent allowed to do this?
  - Is this company allowed to do this?
  - Is the CRM connection valid?
  - Is this a valid, sensible action to take?
        ↓
Only then is the action actually carried out
```

**Example:**

The agent decides a lead should be marked "Interested." Before that actually happens, the platform checks that this specific agent is allowed to update lead status, that the company's CRM connection is valid, and that "Interested" is a valid status — and only then updates the CRM.

This keeps businesses' systems safe from mistakes or misuse, even as the AI becomes more capable over time.

---

## 45. First Version Scope

The first version of the platform should focus on getting this core journey working end-to-end, with everything else built around it over time:

```
Register an account
   → Create an agent
   → Connect a CRM
   → Add knowledge
   → Configure the agent (goals, questions, outcomes)
   → Assign a phone number
   → Make a call
   → The AI handles the conversation (personalized with CRM details, with the
     option to detect voicemail or transfer to a human)
   → The result comes back automatically
   → The result is analyzed
   → The CRM is updated
   → The business can see the call, its transcript, the outcome, and the cost
```

[Campaigns](#37-campaigns-version-2--not-part-of-the-first-release) (bulk calling lists, filters, and schedules) are explicitly out of scope for this first version and planned for Version 2.

---

## 46. Guiding Principles for This Project

The most important decisions guiding how this platform should be built:

1. **Every company's data is kept separate from day one.**
2. **Works with any CRM, not just one specific system.**
3. **Not locked into one voice-calling technology provider** — it should be possible to change or add providers later without disrupting customers.
4. **Not locked into one way of sourcing knowledge** — new knowledge sources can be added over time.
5. **A general framework for connecting other apps**, so new integrations can be added without a redesign.
6. **Agents are given structured goals and outcomes, not just free-text instructions** — this makes their behaviour more predictable.
7. **Call results are processed reliably**, and CRM updates are retried automatically if they fail.
8. **Full visibility into every call, action, provider event, and cost** — nothing should be a black box.
9. **The AI can never take action on a business's systems without the platform's approval first.**
10. **The underlying technology providers are never exposed to end users** — customers only ever interact with "the platform."
11. **We build on the underlying calling technology's own capabilities** (personalization, voicemail detection, live transfer, bulk calling) rather than reinventing them, so the product stays reliable and ships faster.

This approach lets us start with our first real use case — real-estate lead follow-up — while building a platform that can genuinely serve any business that wants an AI voice agent.

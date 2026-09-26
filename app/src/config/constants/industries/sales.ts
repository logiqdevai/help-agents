import {
  BookOpenIcon,
  CalendarDaysIcon,
  ContactIcon,
  DatabaseIcon,
  InboxIcon,
  MailIcon,
  MicIcon,
  PhoneIcon,
  RepeatIcon,
} from "lucide-react";
import { Routes } from "@/routes/routes";
import { IndustryChannels, IndustrySlugs, type IndustryContent } from "./industry.types";

export const SalesIndustry: IndustryContent = {
  slug: IndustrySlugs.sales,
  name: "Sales",
  href: Routes.marketing.industries.sales,
  orbs: ["sky", "lavender"],
  seo: {
    title: "AI Sales Automation | AI Sales Agent",
    description:
      "AI sales automation that contacts new leads, qualifies prospects, follows up opportunities and books sales meetings, with your CRM updated after every call.",
  },
  hero: {
    title: "AI sales automation that follows up every lead",
    lead: "An AI sales agent that contacts new leads, qualifies prospects, chases open opportunities and books meetings, so your reps spend their time on conversations that can close.",
    support: "Built for sales and lead generation teams whose pipeline is bigger than the hours in their day.",
    stack: ["AI voice", "Email", "CRM"],
  },
  ledger: {
    title: "Example run: inbound demo request",
    doneLabel: "Done in 6 minutes",
    description: "Example: an inbound demo request handled by an AI sales agent",
    rows: [
      {
        icon: InboxIcon,
        title: "New lead",
        detail: "Demo request from a 40-person company",
        time: "14:20",
      },
      {
        icon: DatabaseIcon,
        title: "Read the CRM record",
        detail: "New contact with no open deal",
        time: "14:20",
      },
      {
        icon: MicIcon,
        title: "Called the lead",
        detail: "4 min 10 s. Clear need, decision-maker, budget this quarter",
        time: "14:21",
        waveform: true,
      },
      {
        icon: MailIcon,
        title: "Sent a summary email",
        detail: "Recap of the call and a relevant case study",
        time: "14:26",
      },
      {
        icon: CalendarDaysIcon,
        title: "Booked a demo: Tuesday, 10:00",
        detail: "Added to the rep’s calendar",
        time: "14:26",
      },
      {
        icon: ContactIcon,
        title: "Updated the CRM",
        detail: "Lead qualified, next step set, call notes attached",
        time: "14:26",
      },
    ],
  },
  pains: {
    title: "Where sales time disappears",
    intro:
      "Selling is mostly conversations, but the work around them is what fills the day: chasing, qualifying, scheduling and updating records.",
    items: [
      {
        title: "New leads wait for a free rep",
        body: "Interest is highest right after someone fills in a form. If nobody calls for hours, the lead has moved on or spoken to a competitor.",
      },
      {
        title: "Follow-ups get forgotten",
        body: "A good process needs several touches. When reps are busy the second and third follow-up quietly do not happen, and opportunities go cold.",
      },
      {
        title: "Qualification eats the day",
        body: "Discovery calls with prospects who have no budget, no authority or no timeline take the same effort as calls with real buyers.",
      },
      {
        title: "Meetings take too many messages to book",
        body: "Finding a slot that suits both sides can take several emails, and some of those threads never end in a meeting.",
      },
      {
        title: "Pipeline data is stale",
        body: "Statuses and notes are updated when someone has time. Forecasts and hand-offs then rest on records nobody trusts.",
      },
    ],
  },
  capabilities: {
    title: "What an AI sales agent does",
    intro:
      "Each agent takes one job in your sales process, follows your rules and writes its results back to your CRM.",
    items: [
      {
        icon: PhoneIcon,
        channel: IndustryChannels.voice,
        title: "Call new leads within minutes",
        body: "The AI voice agent contacts each new lead while interest is fresh, referring to what they asked for, and retries by your rules if they do not answer.",
      },
      {
        icon: MicIcon,
        channel: IndustryChannels.voice,
        title: "Qualify against your criteria",
        body: "Budget, need, timeline, decision-maker or whichever framework you use. The agent asks the questions and saves the answers to the record.",
      },
      {
        icon: RepeatIcon,
        channel: IndustryChannels.voice,
        title: "Follow up open opportunities",
        body: "Quotes, proposals and stalled deals get a scheduled follow-up call, with the history from the CRM in hand.",
      },
      {
        icon: CalendarDaysIcon,
        channel: IndustryChannels.voice,
        title: "Book sales meetings",
        body: "Once a prospect qualifies, the agent books a meeting into the right rep’s calendar and confirms it.",
      },
      {
        icon: MailIcon,
        channel: IndustryChannels.email,
        title: "Handle replies",
        body: "The AI email agent reads replies, works out whether the prospect is interested, not now or the wrong contact, and triggers the next step.",
      },
      {
        icon: ContactIcon,
        channel: IndustryChannels.crm,
        title: "Log every touch",
        body: "Outcome, notes and next action go into the CRM after every call, so the pipeline reflects what happened.",
      },
    ],
  },
  workflow: {
    title: "How it works for a sales team",
    intro: "Start with one workflow, such as new-lead follow-up, and add more as it proves itself.",
    steps: [
      {
        title: "Connect your CRM and calendar",
        body: "Link the CRM that holds your leads and opportunities, and the calendars demos and meetings are booked into.",
      },
      {
        title: "Give it your pitch and rules",
        body: "Add your product and pricing information, common objections and your qualification questions.",
      },
      {
        title: "Define outcomes and what follows",
        body: "For example: interested leads get a meeting booked, call back later schedules a new call, not interested closes the follow-up.",
      },
      {
        title: "Test it, then go live",
        body: "Try the agent with test calls first. Then set calling hours and retry rules and turn it on for real leads.",
      },
      {
        title: "Review calls and refine",
        body: "Read transcripts and outcomes, see how many calls end in meetings and adjust the agent’s script and rules.",
      },
    ],
  },
  systems: {
    title: "Connects to the tools your sales team already uses",
    intro: "Leads, deals and calendars stay where they are. The agent works with them.",
    items: [
      {
        icon: ContactIcon,
        title: "CRM",
        body: "Read lead and deal history, update stages and add notes.",
      },
      {
        icon: CalendarDaysIcon,
        title: "Calendar",
        body: "Book demos and meetings against real availability.",
      },
      {
        icon: MailIcon,
        title: "Email",
        body: "Send recaps and read replies from prospects.",
      },
      {
        icon: PhoneIcon,
        title: "Phone numbers",
        body: "Call from a number provisioned for you, or bring your own.",
      },
      {
        icon: BookOpenIcon,
        title: "Sales knowledge",
        body: "Product details, pricing, case studies and objection handling.",
      },
      {
        icon: DatabaseIcon,
        title: "Custom systems",
        body: "Connect your own APIs and internal tools.",
      },
    ],
  },
  control: {
    title: "Your reps take over when it matters",
    intro: "The AI does the first contact and the chasing. Your team closes.",
    items: [
      "Transfer a live call to a rep when the prospect asks for a person",
      "Decide which outcomes book a meeting and which close the follow-up",
      "Choose the hours the AI is allowed to call",
      "Limit each agent to the CRM actions it needs",
      "Keep the AI to the pricing and claims you have approved",
      "Read every transcript and CRM change afterwards",
    ],
    closing: "Nothing the AI does is hidden: every action is checked against its permissions and recorded.",
  },
  faqs: [
    {
      question: "What is AI sales automation?",
      answer:
        "AI sales automation uses AI agents to handle repetitive sales work: contacting new leads, qualifying prospects, following up opportunities, booking meetings and updating the CRM. Reps then spend their time on conversations with qualified buyers.",
    },
    {
      question: "Can an AI sales agent call leads?",
      answer:
        "Yes. The AI voice agent can call new leads within minutes of an enquiry, hold a natural conversation, ask your qualification questions and record the result. It only calls within the hours you set and retries by your rules when there is no answer.",
    },
    {
      question: "How does an AI sales agent qualify prospects?",
      answer:
        "You define the questions and what counts as qualified, for example budget, need, timeline and decision-maker. The agent asks them during the call, saves the answers to the CRM and applies the outcome you defined, such as booking a meeting.",
    },
    {
      question: "Will sales AI automation work with our CRM?",
      answer:
        "AI agents connect to CRM systems and to custom CRMs through their APIs. They can read lead and deal information before a call and update records afterwards, using only the actions you have allowed.",
    },
    {
      question: "Can it follow up on old opportunities?",
      answer:
        "Yes. You can schedule follow-up calls for quotes, proposals and stalled deals. The agent uses the history in your CRM to open the conversation and records what the prospect says.",
    },
    {
      question: "Does an AI sales agent replace salespeople?",
      answer:
        "No. It handles first contact, chasing and scheduling. Your reps run the discovery, demos and negotiation, and the AI can hand a live call to a person whenever a prospect wants one.",
    },
  ],
  cta: {
    title: "What could your sales team hand off?",
    body: "Tell us how your leads are handled today and we will show you where AI agents can take over the follow-up.",
  },
};

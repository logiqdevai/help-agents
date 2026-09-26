import {
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
    lead: "An AI sales agent for sales and lead generation teams. It contacts new leads, qualifies prospects, chases open opportunities and books meetings, so your reps spend their time on conversations that can close.",
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
    intro: "Selling is mostly conversations, but chasing, qualifying and scheduling are what fill the day.",
    items: [
      {
        title: "New leads wait for a free rep",
        body: "Interest is highest right after someone fills in a form. If nobody calls for hours, the lead has moved on or spoken to a competitor.",
      },
      {
        title: "Follow-ups get forgotten",
        body: "A good process needs several touches. When reps are busy, the second and third follow-up quietly don’t happen and opportunities go cold.",
      },
      {
        title: "Qualification eats the day",
        body: "Discovery calls with prospects who have no budget, no authority or no timeline take the same effort as calls with real buyers.",
      },
    ],
  },
  capabilities: {
    title: "What an AI sales agent does",
    intro: "Each agent takes one job in your sales process, follows your rules and writes its results back to your CRM.",
    items: [
      {
        icon: PhoneIcon,
        channel: IndustryChannels.voice,
        title: "Call and qualify new leads",
        body: "The voice agent calls each new lead while interest is fresh and refers to what they asked for. It asks your qualification questions (budget, need, timeline, decision-maker, or whichever framework you use) and saves the answers to the record.",
      },
      {
        icon: RepeatIcon,
        channel: IndustryChannels.voice,
        title: "Follow up and book meetings",
        body: "Quotes, proposals and stalled deals get a scheduled follow-up call, with the CRM history in hand. Once a prospect qualifies, it books a meeting in the right rep’s calendar and confirms it.",
      },
      {
        icon: MailIcon,
        channel: IndustryChannels.email,
        title: "Handle replies",
        body: "The email agent reads replies, works out whether the prospect is interested, not now or the wrong contact, and triggers the next step.",
      },
      {
        icon: ContactIcon,
        channel: IndustryChannels.crm,
        title: "Log every touch",
        body: "Outcome, notes and next action go into the CRM after every call, so the pipeline reflects what actually happened.",
      },
    ],
  },
  workflow: {
    title: "How it works for a sales team",
    intro: "Start with one workflow, such as new-lead follow-up, and add more as it proves itself.",
    steps: [
      {
        title: "Connect your tools",
        body: "Link the CRM that holds your leads and opportunities, the calendars demos go into and the mailbox for recaps and replies. Call from a number provisioned for you, or bring your own.",
      },
      {
        title: "Give it your pitch and rules",
        body: "Add your product and pricing information, common objections and qualification questions. Then define what follows each outcome: interested leads get a meeting, call back later schedules another call, not interested closes the follow-up.",
      },
      {
        title: "Test it, then go live",
        body: "Try test calls first, then set calling hours and retry rules and turn it on for real leads. Read transcripts and outcomes to see how many calls end in meetings, and adjust from there.",
      },
    ],
  },
  control: {
    title: "Your reps take over when it matters",
    intro: "The AI does the first contact and the chasing. Your team closes.",
    items: [
      "Transfer a live call to a rep when the prospect asks for a person",
      "Set the calling hours, and decide which outcomes book a meeting and which close the follow-up",
      "Keep the AI to the pricing and claims you’ve approved, and limit each agent to the CRM actions it needs",
      "Read every transcript and CRM change afterwards. Every action is checked against permissions and logged",
    ],
  },
  faqs: [
    {
      question: "What is AI sales automation?",
      answer:
        "It uses AI agents to handle repetitive sales work: contacting new leads, qualifying prospects, following up opportunities, booking meetings and updating the CRM. Your reps then spend their time on conversations with qualified buyers.",
    },
    {
      question: "Can an AI sales agent call leads?",
      answer:
        "Yes. The voice agent can call new leads within minutes of an enquiry and hold a natural conversation. It only calls within the hours you set and retries by your rules when there’s no answer.",
    },
    {
      question: "How does an AI sales agent qualify prospects?",
      answer:
        "You define the questions and what counts as qualified. The agent asks them during the call, saves the answers to the CRM and applies the outcome you defined, such as booking a meeting.",
    },
    {
      question: "Will sales AI automation work with our CRM?",
      answer:
        "Yes. AI agents connect to CRM systems and to custom CRMs through their APIs. They read lead and deal information before a call and update records afterwards, using only the actions you’ve allowed.",
    },
    {
      question: "Does an AI sales agent replace salespeople?",
      answer:
        "No. It handles first contact, chasing and scheduling. Your reps run discovery, demos and negotiation, and the AI can hand a live call to a person whenever a prospect wants one.",
    },
  ],
  cta: {
    title: "Which leads are going cold?",
    body: "Tell us how leads are handled today, and we’ll show you where an agent could take over the follow-up. Start with one workflow and add more once it’s working.",
  },
};

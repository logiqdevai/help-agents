import {
  Building2Icon,
  CalendarDaysIcon,
  ContactIcon,
  DatabaseIcon,
  InboxIcon,
  MailIcon,
  MessageSquareIcon,
  MicIcon,
  PhoneIcon,
  BookOpenIcon,
} from "lucide-react";
import { Routes } from "@/routes/routes";
import { IndustryChannels, IndustrySlugs, type IndustryContent } from "./industry.types";

export const RealEstateIndustry: IndustryContent = {
  slug: IndustrySlugs.realEstate,
  name: "Real estate",
  href: Routes.marketing.industries.realEstate,
  orbs: ["mint", "peach"],
  seo: {
    title: "AI for Real Estate | Real Estate AI Automation",
    description:
      "AI agents for real estate that call new enquiries, qualify buyers and renters, recommend properties and book viewings, then update your CRM automatically.",
  },
  hero: {
    title: "AI agents for real estate teams",
    lead: "Real estate automation that follows up every enquiry, qualifies buyers and renters, recommends properties and books viewings, then keeps your CRM up to date.",
    support: "Built for agencies, brokerages and property developers that want every lead answered while agents are out showing properties.",
    stack: ["AI voice agent", "CRM", "Viber"],
  },
  ledger: {
    title: "Example run: new property enquiry",
    doneLabel: "Done in 5 minutes",
    description: "Example: a new property enquiry handled by an AI agent for real estate",
    rows: [
      {
        icon: InboxIcon,
        title: "New enquiry",
        detail: "Property portal: 2-bedroom apartment, city centre",
        time: "10:14",
      },
      {
        icon: DatabaseIcon,
        title: "Read the CRM record",
        detail: "New contact, with the enquiry source and property reference",
        time: "10:14",
      },
      {
        icon: MicIcon,
        title: "Called the lead",
        detail: "3 min 02 s. Buying, budget confirmed, can view this week",
        time: "10:15",
        waveform: true,
      },
      {
        icon: Building2Icon,
        title: "Recommended 3 properties",
        detail: "Matched to budget, area and bedrooms, details sent on Viber",
        time: "10:19",
      },
      {
        icon: CalendarDaysIcon,
        title: "Booked a viewing: Friday, 16:30",
        detail: "Added to the agent’s calendar and confirmed with the lead",
        time: "10:19",
      },
      {
        icon: ContactIcon,
        title: "Updated the CRM",
        detail: "Budget, area, viewing date and call notes",
        time: "10:19",
      },
    ],
  },
  pains: {
    title: "Where the time goes in a real estate business",
    intro:
      "Most of the work in property sales happens before anyone sees a property. It is repetitive, time-sensitive and easy to drop when the team is out on viewings.",
    items: [
      {
        title: "Enquiries arrive at the worst moments",
        body: "Portals, your website, social media and the phone all bring leads while your agents are in a viewing or off for the evening. The agency that responds first often gets the conversation.",
      },
      {
        title: "Every buyer asks the same first questions",
        body: "Price, availability, size, location, fees and viewing times. Your team answers them dozens of times a week, and each answer is a call that could have been spent on a serious buyer.",
      },
      {
        title: "Qualification takes calls that go nowhere",
        body: "Agents spend time with people who are only browsing, have a different budget in mind or are not ready to move for months. You only find out after the call.",
      },
      {
        title: "Viewings are a scheduling puzzle",
        body: "Matching a buyer’s availability to an agent’s diary and the property’s access, then handling reschedules and no-shows, takes a lot of back and forth.",
      },
      {
        title: "The CRM is always behind",
        body: "Notes and statuses are written from memory at the end of the day, or not written at all. The next person to open the record does not know what was said.",
      },
    ],
  },
  capabilities: {
    title: "What AI agents do for real estate",
    intro:
      "Each agent takes a defined job in your process, works inside the rules you set and records what it did in your CRM.",
    items: [
      {
        icon: PhoneIcon,
        channel: IndustryChannels.voice,
        title: "Call new enquiries straight away",
        body: "The AI voice agent phones each new lead within minutes and opens with the property they asked about. It follows your calling hours and retry rules if they do not pick up.",
      },
      {
        icon: MicIcon,
        channel: IndustryChannels.voice,
        title: "Qualify buyers and renters",
        body: "It asks what your team would ask: buy or rent, budget, area, bedrooms, timeline and financing. Every answer is saved against the contact.",
      },
      {
        icon: MessageSquareIcon,
        channel: IndustryChannels.messaging,
        title: "Recommend matching properties",
        body: "Using the property information you provide, it suggests listings that fit what the lead said and sends the details over messaging such as Viber.",
      },
      {
        icon: CalendarDaysIcon,
        channel: IndustryChannels.voice,
        title: "Book viewings",
        body: "It agrees a time with the lead, creates the calendar event for the right agent and confirms the appointment.",
      },
      {
        icon: MailIcon,
        channel: IndustryChannels.email,
        title: "Process property emails",
        body: "The AI email agent reads incoming messages, picks out viewing requests, document requests and questions, and starts the matching workflow.",
      },
      {
        icon: ContactIcon,
        channel: IndustryChannels.crm,
        title: "Keep the CRM current",
        body: "After every conversation it updates the contact with the outcome, budget, preferences and notes, so agents open the CRM and see what really happened.",
      },
    ],
  },
  workflow: {
    title: "How it works for a real estate agency",
    intro:
      "You do not need to change how you sell. The agents follow your process, on your systems, with your rules.",
    steps: [
      {
        title: "Connect your CRM and calendar",
        body: "Link the CRM your agents already use, and the calendars viewings should be booked into.",
      },
      {
        title: "Add your property knowledge",
        body: "Give the agent your listings, pricing rules, area information, fees and viewing policy, so its answers come from your information.",
      },
      {
        title: "Define the agent’s job",
        body: "Set what it asks, which outcomes are possible (for example interested, viewing requested, call back later, not interested), and which CRM actions it may take.",
      },
      {
        title: "Test it, then go live",
        body: "Run test calls before anything reaches a real lead. Then set calling hours and retry rules and switch the agent on.",
      },
      {
        title: "Review every conversation",
        body: "Transcripts, outcomes and CRM changes stay visible to your team, so you can see what was said and refine the agent over time.",
      },
    ],
  },
  systems: {
    title: "Connects to the tools your agency already uses",
    intro:
      "The agents work with the systems that hold your leads, listings and diaries, instead of asking you to move to something new.",
    items: [
      {
        icon: ContactIcon,
        title: "CRM",
        body: "Look up contacts, read notes and history, and update records after every call.",
      },
      {
        icon: CalendarDaysIcon,
        title: "Calendar",
        body: "Book viewings against real availability and confirm them.",
      },
      {
        icon: BookOpenIcon,
        title: "Property knowledge",
        body: "Listings, pricing, areas and FAQs that the agent answers from.",
      },
      {
        icon: MessageSquareIcon,
        title: "Messaging",
        body: "Send property details and confirmations on channels such as Viber.",
      },
      {
        icon: MailIcon,
        title: "Email",
        body: "Read enquiries and send follow-ups with the details a lead asked for.",
      },
      {
        icon: DatabaseIcon,
        title: "Custom systems",
        body: "Connect your own APIs and internal tools, such as a listings database.",
      },
    ],
  },
  control: {
    title: "Your agents stay in charge of the relationship",
    intro: "The AI handles the repetitive first contact. People handle the viewings, the negotiation and the client.",
    items: [
      "Hand a live call to an agent when the lead asks to speak to a person",
      "Choose the hours the AI is allowed to call",
      "Pick exactly which CRM actions each AI agent may use",
      "Decide which topics the AI answers and which it passes on",
      "Read every transcript and CRM change afterwards",
      "Take a message and log a follow-up when nobody is free to take a transfer",
    ],
    closing: "Every action goes through a check for what this agent is allowed to do, and every result is recorded.",
  },
  faqs: [
    {
      question: "How can AI be used in real estate?",
      answer:
        "AI agents can follow up new enquiries by phone, qualify buyers and renters, answer common property questions, recommend matching listings, book viewings and update the CRM. That removes the repetitive first contact so agents spend their time on viewings and clients.",
    },
    {
      question: "Can an AI voice agent follow up with property leads?",
      answer:
        "Yes. The AI voice agent can call new leads within minutes, refer to the property they enquired about, ask your qualification questions and record the outcome. It respects the calling hours you set and retries according to your rules if a lead does not answer.",
    },
    {
      question: "Does the AI work with our real estate CRM?",
      answer:
        "AI agents connect to CRM systems, including custom CRMs through their APIs. Before a call the agent can read the contact’s details and history, and afterwards it updates the record with the outcome and notes. You choose which actions each agent is allowed to take.",
    },
    {
      question: "Can the AI book property viewings?",
      answer:
        "Yes. Connected to your calendar, the agent can agree a time with the lead, create the viewing for the right agent and confirm the appointment by message or email.",
    },
    {
      question: "Will AI replace our real estate agents?",
      answer:
        "No. The AI takes on repetitive work such as first contact, qualification and scheduling. Agents take over for viewings, advice and negotiation, and the AI can transfer a live call to a person whenever a lead asks for one.",
    },
    {
      question: "What is real estate automation software?",
      answer:
        "Real estate automation software takes over repetitive tasks in the sales and rental process, such as lead follow-up, qualification, scheduling and CRM updates. An AI agent platform goes further by holding real conversations with leads and acting on connected systems.",
    },
  ],
  cta: {
    title: "Ready to follow up every enquiry?",
    body: "Tell us how your agency handles leads today and we will show you where AI agents can take over the repetitive work.",
  },
};

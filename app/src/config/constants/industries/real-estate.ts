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
      "AI agents for real estate that call new enquiries, qualify buyers and renters, recommend properties and book viewings, then update your CRM.",
  },
  hero: {
    title: "AI agents for real estate teams",
    lead: "Real estate automation for agencies and brokerages. Every enquiry gets a call, buyers and renters get qualified, viewings get booked and your CRM stays up to date, even while your agents are out showing properties.",
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
    intro: "Most of the work happens before anyone sees a property, and it’s easy to drop when the team is out on viewings.",
    items: [
      {
        title: "Enquiries arrive at the worst moments",
        body: "Portals, your website and the phone bring leads while your agents are in a viewing or off for the evening. The agency that replies first often wins the conversation.",
      },
      {
        title: "Qualification takes calls that go nowhere",
        body: "Agents answer the same first questions all week, then find out mid-call that the buyer is only browsing or has a different budget in mind.",
      },
      {
        title: "The CRM is always behind",
        body: "Notes get written from memory at the end of the day, or not at all, so the next person to open the record doesn’t know what was said.",
      },
    ],
  },
  capabilities: {
    title: "What AI agents do for real estate",
    intro: "Each agent takes one job in your process and writes what it did to your CRM.",
    items: [
      {
        icon: PhoneIcon,
        channel: IndustryChannels.voice,
        title: "Call, qualify and book viewings",
        body: "The voice agent phones each new lead within minutes and opens with the property they asked about. It asks what your team would ask (buy or rent, budget, area, timeline), then agrees a viewing time and adds it to the right agent’s calendar. If nobody picks up, it retries by your rules.",
      },
      {
        icon: MessageSquareIcon,
        channel: IndustryChannels.messaging,
        title: "Recommend matching properties",
        body: "Using the listings you provide, it suggests properties that fit what the lead said and sends the details over messaging, such as Viber.",
      },
      {
        icon: MailIcon,
        channel: IndustryChannels.email,
        title: "Read property emails",
        body: "The email agent picks out viewing requests, document requests and questions from incoming mail, then starts the matching workflow.",
      },
      {
        icon: ContactIcon,
        channel: IndustryChannels.crm,
        title: "Keep the CRM current",
        body: "After every conversation it saves the outcome, budget, preferences and notes, so agents open the CRM and see what really happened.",
      },
    ],
  },
  workflow: {
    title: "How it works for a real estate agency",
    intro: "You don’t need to change how you sell. The agents follow your process, on your systems.",
    steps: [
      {
        title: "Connect your tools",
        body: "Link your CRM and the calendars viewings go into. Add email and messaging such as Viber, or your own listings database through its API.",
      },
      {
        title: "Give it your property knowledge and rules",
        body: "Add your listings, pricing rules, fees and viewing policy. Then set what the agent asks, which outcomes are possible (interested, viewing requested, call back later, not interested) and which CRM actions it may take.",
      },
      {
        title: "Test it, then let it work",
        body: "Make test calls before anything reaches a real lead, set calling hours and retry rules, and switch it on. Transcripts, outcomes and CRM changes stay visible, so you can refine it over time.",
      },
    ],
  },
  control: {
    title: "Your agents stay in charge of the relationship",
    intro: "The AI handles the repetitive first contact. People handle viewings, negotiation and the client.",
    items: [
      "Hand a live call to an agent when the lead asks for a person, or take a message if nobody is free",
      "Choose the hours the AI may call, and which topics it answers or passes on",
      "Pick exactly which CRM actions each agent may use. Every action is checked against those permissions and logged",
      "Read every transcript and CRM change afterwards",
    ],
  },
  faqs: [
    {
      question: "How can AI be used in real estate?",
      answer:
        "AI agents can follow up new enquiries by phone, qualify buyers and renters, recommend matching listings, book viewings and update the CRM. That takes the repetitive first contact off your agents, so they spend their time on viewings and clients.",
    },
    {
      question: "What is real estate automation software?",
      answer:
        "It’s software that takes over repetitive tasks in the sales and rental process, such as lead follow-up, scheduling and CRM updates. An AI agent platform goes a step further: it holds real conversations with leads and acts on your connected systems.",
    },
    {
      question: "Does the AI work with our real estate CRM?",
      answer:
        "Yes. AI agents connect to CRM systems, including custom CRMs through their APIs. Before a call the agent can read the contact’s details and history, and afterwards it updates the record with the outcome and notes.",
    },
    {
      question: "Can the AI book property viewings?",
      answer:
        "Yes, once it’s connected to your calendar. It checks the agent’s real availability, creates the viewing and confirms it with the lead by message or email.",
    },
    {
      question: "Will AI replace our real estate agents?",
      answer:
        "No. The AI takes on first contact, qualification and scheduling. Your agents take over for viewings, advice and negotiation, and the AI can transfer a live call to a person whenever a lead asks for one.",
    },
  ],
  cta: {
    title: "Which enquiries slip through today?",
    body: "Tell us how your agency handles leads now, and we’ll show you what an agent could take over. You can start with one workflow and add more once it’s working.",
  },
};

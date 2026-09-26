import {
  BookOpenIcon,
  CalendarDaysIcon,
  ContactIcon,
  DatabaseIcon,
  FileTextIcon,
  InboxIcon,
  MailIcon,
  MessageSquareIcon,
  MicIcon,
  PhoneIcon,
} from "lucide-react";
import { Routes } from "@/routes/routes";
import { IndustryChannels, IndustrySlugs, type IndustryContent } from "./industry.types";

export const ProfessionalServicesIndustry: IndustryContent = {
  slug: IndustrySlugs.professionalServices,
  name: "Professional services",
  href: Routes.marketing.industries.professionalServices,
  orbs: ["sky", "mint"],
  seo: {
    title: "AI Automation for Professional Services",
    description:
      "AI agents for professional services firms that handle client communication, scheduling, information requests and admin across voice, email and calendars.",
  },
  hero: {
    title: "AI automation for professional services firms",
    lead: "AI agents that handle client communication, scheduling, information requests and admin work, so your professionals spend their time on client work.",
    support: "Built for accountants, law firms, consultancies and advisory practices where every hour of admin is an hour not billed.",
    stack: ["AI voice", "Email", "Calendar"],
  },
  ledger: {
    title: "Example run: new client enquiry",
    doneLabel: "Done in 7 minutes",
    description: "Example: a new client enquiry handled by an AI agent for a professional services firm",
    rows: [
      {
        icon: InboxIcon,
        title: "New enquiry",
        detail: "Email from a company asking about an initial consultation",
        time: "08:45",
      },
      {
        icon: MailIcon,
        title: "Read the request",
        detail: "Consultation wanted, documents mentioned, urgent",
        time: "08:45",
      },
      {
        icon: DatabaseIcon,
        title: "Checked the client record",
        detail: "No existing client, new contact created",
        time: "08:46",
      },
      {
        icon: MicIcon,
        title: "Called to confirm details",
        detail: "3 min 40 s. Topic, urgency and preferred times",
        time: "08:47",
        waveform: true,
      },
      {
        icon: CalendarDaysIcon,
        title: "Booked a consultation: Thursday, 09:30",
        detail: "Added to the partner’s calendar with a confirmation",
        time: "08:52",
      },
      {
        icon: ContactIcon,
        title: "Updated the client record",
        detail: "Enquiry notes, documents to request and next steps",
        time: "08:52",
      },
    ],
  },
  pains: {
    title: "Where the hours go",
    intro:
      "Professional work is billed by the hour or the project, yet a large part of every week goes on communication and coordination that is not billable.",
    items: [
      {
        title: "New enquiries wait for someone free",
        body: "A prospective client emails or calls while the team is with other clients. The reply comes a day later, if at all.",
      },
      {
        title: "Scheduling and rescheduling",
        body: "Finding a slot, confirming it, sending reminders and moving it when plans change is a job in itself.",
      },
      {
        title: "Chasing clients for information",
        body: "Work stalls waiting for a document or an answer, and someone has to remind the client, and remind them again.",
      },
      {
        title: "Routine questions interrupt real work",
        body: "Where is my document, when is my appointment, what do I need to bring. Small questions, asked constantly.",
      },
      {
        title: "Admin after every contact",
        body: "File notes, update records, create tasks. It is easy to postpone and painful when it piles up.",
      },
    ],
  },
  capabilities: {
    title: "What AI agents do for professional services",
    intro:
      "They take on the communication that surrounds your work, using only the information and actions you allow.",
    items: [
      {
        icon: MailIcon,
        channel: IndustryChannels.email,
        title: "Handle new enquiries",
        body: "The AI email agent reads each enquiry, works out what the client needs, and starts the right workflow. The voice agent can call to confirm the details.",
      },
      {
        icon: CalendarDaysIcon,
        channel: IndustryChannels.voice,
        title: "Schedule and confirm appointments",
        body: "It books into the right professional’s calendar, sends confirmations and reminders, and handles reschedules.",
      },
      {
        icon: FileTextIcon,
        channel: IndustryChannels.email,
        title: "Collect information and documents",
        body: "It asks clients for what you are missing and follows up until it arrives, then lets your team know.",
      },
      {
        icon: MessageSquareIcon,
        channel: IndustryChannels.messaging,
        title: "Answer routine client questions",
        body: "Using the information you approve, it answers questions about appointments, process and what to prepare.",
      },
      {
        icon: PhoneIcon,
        channel: IndustryChannels.voice,
        title: "Take and return calls",
        body: "The AI voice agent answers routine calls, collects the details and passes anything that needs a professional to the right person.",
      },
      {
        icon: ContactIcon,
        channel: IndustryChannels.crm,
        title: "Keep client records current",
        body: "Notes, requests and next steps are saved to your client system after every contact.",
      },
    ],
  },
  workflow: {
    title: "How it works for a professional services firm",
    intro: "Pick the communication that costs your team the most time, automate that first and build from there.",
    steps: [
      {
        title: "Connect your calendar, email and client system",
        body: "Link the calendars appointments go into, the mailbox enquiries arrive in and the system that holds client records.",
      },
      {
        title: "Give it your approved information",
        body: "Add the information the agent may share: services, process, opening hours, what clients should prepare.",
      },
      {
        title: "Define what it can do",
        body: "Choose which requests it handles, which actions it can take, and which matters always go to a professional.",
      },
      {
        title: "Test it, then go live",
        body: "Try the agent first with test conversations. Then set calling hours and switch it on for real clients.",
      },
      {
        title: "Review every interaction",
        body: "Transcripts, outcomes and record changes stay visible, so your team can check the work and refine it.",
      },
    ],
  },
  systems: {
    title: "Connects to the tools your firm already uses",
    intro: "Your calendars, mailboxes and client records stay where they are. The agent works with them.",
    items: [
      {
        icon: CalendarDaysIcon,
        title: "Calendar",
        body: "Book, confirm and move appointments against real availability.",
      },
      {
        icon: MailIcon,
        title: "Email",
        body: "Read enquiries and client replies, and send confirmations and requests.",
      },
      {
        icon: ContactIcon,
        title: "CRM or client system",
        body: "Look up clients and update records after every contact.",
      },
      {
        icon: BookOpenIcon,
        title: "Firm knowledge",
        body: "The information you approve the agent to share.",
      },
      {
        icon: PhoneIcon,
        title: "Phone numbers",
        body: "Take and make calls on a provisioned number or your own.",
      },
      {
        icon: DatabaseIcon,
        title: "Custom systems",
        body: "Connect your practice management tools through their APIs.",
      },
    ],
  },
  control: {
    title: "Your professionals decide what needs their attention",
    intro: "The AI handles routine communication. Advice and judgement stay with your people.",
    items: [
      "Choose which information the AI can access and share",
      "Keep sensitive or complex matters with a professional",
      "Transfer a live call to a person whenever a client asks",
      "Choose the hours the AI is allowed to call",
      "Limit each agent to the actions it needs",
      "Read every transcript and record change afterwards",
    ],
    closing: "Every action is checked against what the agent is allowed to do, and every result is recorded.",
  },
  faqs: [
    {
      question: "How can professional services firms use AI automation?",
      answer:
        "Firms use AI agents to handle new enquiries, schedule and confirm appointments, collect documents and information from clients, answer routine questions and keep client records up to date. That reduces admin so professionals can spend more time on client work.",
    },
    {
      question: "Can an AI assistant schedule client appointments?",
      answer:
        "Yes. Connected to your calendars, the agent can find a suitable time, book it with the right professional, send confirmations and reminders and handle reschedules.",
    },
    {
      question: "Can AI chase clients for documents and information?",
      answer:
        "Yes. The agent can ask clients for what is missing by email, phone or message, follow up on a schedule you define and notify your team when it arrives.",
    },
    {
      question: "Who controls what the AI can say and do?",
      answer:
        "You do. You decide which information the AI can access, which topics it answers, which actions it can take and when it hands over to a person. Every action is recorded so you can review it afterwards.",
    },
    {
      question: "Does this work with our practice management or CRM system?",
      answer:
        "AI agents connect to CRM systems and to your own tools through their APIs. They can read a client record before a conversation and update it afterwards, using only the actions you have allowed.",
    },
  ],
  cta: {
    title: "What could your firm hand off?",
    body: "Tell us which admin takes the most time and we will show you where AI agents can take it over.",
  },
};

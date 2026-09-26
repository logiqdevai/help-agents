import {
  CalendarDaysIcon,
  ContactIcon,
  DatabaseIcon,
  InboxIcon,
  MailIcon,
  MessageSquareIcon,
  MicIcon,
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
      "AI agents for accountants, law firms and consultancies that handle client enquiries, scheduling, document requests and admin by email, phone and calendar.",
  },
  hero: {
    title: "AI automation for professional services firms",
    lead: "AI agents for accountants, law firms, consultancies and advisory practices. They handle client enquiries, scheduling, information requests and admin, so your professionals can spend their time on client work.",
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
    intro: "A big part of every week goes on communication and coordination you can’t bill for.",
    items: [
      {
        title: "New enquiries wait for someone free",
        body: "A prospective client emails or calls while the team is with other clients, and the reply comes a day later, if at all.",
      },
      {
        title: "Scheduling and rescheduling",
        body: "Finding a slot, confirming it, sending reminders and moving it when plans change is a job in itself.",
      },
      {
        title: "Chasing clients for information",
        body: "Work stalls waiting for a document or an answer, so someone has to remind the client, then remind them again.",
      },
    ],
  },
  capabilities: {
    title: "What AI agents do for professional services",
    intro: "They take on the communication around your work, using only the information and actions you allow.",
    items: [
      {
        icon: MailIcon,
        channel: IndustryChannels.email,
        title: "Handle new enquiries",
        body: "The email agent reads each enquiry, works out what the client needs and starts the right workflow. The voice agent can call to confirm the details.",
      },
      {
        icon: CalendarDaysIcon,
        channel: IndustryChannels.voice,
        title: "Schedule and confirm appointments",
        body: "It books into the right professional’s calendar, sends confirmations and reminders, and handles reschedules.",
      },
      {
        icon: MessageSquareIcon,
        channel: IndustryChannels.messaging,
        title: "Answer questions and chase documents",
        body: "It answers routine questions about appointments and process from information you approve. It also asks clients for what’s missing, follows up until it arrives and then tells your team.",
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
        title: "Connect your tools",
        body: "Link your calendars, the mailbox enquiries arrive in and the system that holds your client records. Using practice management software? Connect it through its API.",
      },
      {
        title: "Give it approved information",
        body: "Add what the agent may share, such as your services, process, opening hours and what clients should prepare. Then choose which requests it handles, what it can do and which matters always go to a professional.",
      },
      {
        title: "Test it, then go live",
        body: "Try it with test conversations first, then set calling hours and switch it on for real clients. Transcripts and record changes stay visible, so your team can check the work and refine it.",
      },
    ],
  },
  control: {
    title: "Your professionals decide what needs their attention",
    intro: "The AI handles routine communication. Advice and judgement stay with your people.",
    items: [
      "Choose which information the AI can access and share",
      "Keep sensitive or complex matters with a professional, and transfer a live call whenever a client asks for a person",
      "Set the hours it can call, and limit each agent to the actions it needs",
      "Every action is checked against those permissions and logged, so you can read any transcript or record change afterwards",
    ],
  },
  faqs: [
    {
      question: "How can professional services firms use AI automation?",
      answer:
        "Firms use AI agents to handle new enquiries, book and confirm appointments, collect documents from clients, answer routine questions and keep client records up to date. That cuts the admin so professionals can spend more time on client work.",
    },
    {
      question: "Can an AI assistant schedule client appointments?",
      answer:
        "Yes. Connected to your calendars, the agent finds a suitable time, books it with the right professional, sends confirmations and reminders and handles reschedules.",
    },
    {
      question: "Can AI chase clients for documents and information?",
      answer:
        "Yes. It asks clients for what’s missing by email, phone or Viber, follows up on a schedule you set and notifies your team when it arrives.",
    },
    {
      question: "Who controls what the AI can say and do?",
      answer:
        "You do. You decide which information it can access, which topics it answers, which actions it can take and when it hands over to a person.",
    },
    {
      question: "Does this work with our practice management or CRM system?",
      answer:
        "Yes. Agents connect to CRM systems and to your own tools through their APIs. They read a client record before a conversation and update it afterwards, using only the actions you allow.",
    },
  ],
  cta: {
    title: "What could your firm hand off?",
    body: "Tell us which admin takes the most time, and we’ll show you where an agent could take it over.",
  },
};

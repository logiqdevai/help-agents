import {
  BookOpenIcon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
  ContactIcon,
  DatabaseIcon,
  FileTextIcon,
  InboxIcon,
  MicIcon,
  PhoneCallIcon,
  PhoneIncomingIcon,
  PhoneOutgoingIcon,
} from "lucide-react";
import { IndustrySlugs } from "@/config/constants/industries";
import { Routes } from "@/routes/routes";
import { ProductSlugs, type ProductContent } from "./product.types";

export const VoiceAgentProduct: ProductContent = {
  slug: ProductSlugs.voice,
  name: "AI voice agent",
  tagline: "Makes and receives phone calls, follows your rules and updates your systems.",
  href: Routes.marketing.voiceAgent,
  icon: MicIcon,
  orbs: ["mint", "sky"],
  seo: {
    title: "AI Voice Agent | AI Phone Agent for Business",
    description:
      "AI voice agent that makes and receives phone calls for your business: follows up leads, answers questions, books appointments and updates your CRM.",
  },
  hero: {
    title: "AI voice agent for your business calls",
    lead: "An AI phone agent that makes and receives calls for you. It follows up leads, answers questions, collects information and books appointments, then updates your CRM after every call.",
    support:
      "You set its job, give it your information and choose what it may do. It calls only in your calling hours and keeps a full record of every conversation.",
  },
  definition: {
    title: "What is an AI voice agent?",
    paragraphs: [
      "An AI voice agent is software that holds phone conversations on your behalf. It listens, understands what the person says, answers in natural speech and takes the actions you allow, such as booking an appointment or updating a record.",
      "You may also hear it called an AI phone agent or an AI calling agent. It works in both directions: it calls the people you need to reach, such as new leads, and it answers the calls of people who reach you.",
    ],
    contrastTitle: "Not a phone menu. Not a fixed script.",
    beforeLabel: "Phone menus and scripted dialers",
    afterLabel: "AI voice agent",
    rows: [
      {
        before: "Press 1 for sales, press 2 for support",
        after: "The caller says what they need in their own words",
      },
      {
        before: "Follows one script and breaks when the person goes off it",
        after: "Follows your rules and handles questions in any order",
      },
      {
        before: "Knows nothing about the person it is calling",
        after: "Reads the contact record from your CRM before the call",
      },
      {
        before: "Ends with a voicemail box or a task for someone to call back",
        after: "Ends with an outcome, notes and an updated CRM",
      },
    ],
  },
  capabilities: {
    title: "What an AI voice agent can do",
    intro: "Give each agent one clear job. It follows your instructions and records what happened.",
    items: [
      {
        icon: PhoneOutgoingIcon,
        title: "Make outbound calls",
        body: "Follow up new leads, confirm appointments and reach contacts on a schedule: immediately, after a set delay, tomorrow or on a specific date.",
      },
      {
        icon: PhoneIncomingIcon,
        title: "Answer inbound calls",
        body: "Answer calls to your number, handle routine requests and collect the caller’s details, at any hour you choose.",
      },
      {
        icon: ClipboardCheckIcon,
        title: "Qualify and collect information",
        body: "Ask the questions your team would ask and save every answer, so nobody has to repeat themselves later.",
      },
      {
        icon: BookOpenIcon,
        title: "Answer questions from your knowledge",
        body: "Use the information you give it, typed or uploaded, to answer accurately. It passes on what it cannot answer.",
      },
      {
        icon: CalendarDaysIcon,
        title: "Book appointments",
        body: "Agree a time, create the calendar event and confirm it with the person on the call.",
      },
      {
        icon: ContactIcon,
        title: "Update your CRM",
        body: "After every call it records the outcome, notes and any fields you have chosen, and can trigger follow-up actions.",
      },
    ],
  },
  example: {
    title: "One call, start to finish",
    intro:
      "Here is what happens when a new enquiry arrives, from the first CRM read to the saved transcript. The agent works alone until a person is needed.",
    ledger: {
      title: "Example run: outbound follow-up call",
      doneLabel: "Call complete in 3 minutes",
      description: "Example: an outbound follow-up call handled by an AI voice agent",
      rows: [
        {
          icon: InboxIcon,
          title: "New lead added",
          detail: "Web form enquiry, saved to the CRM",
          time: "09:02",
        },
        {
          icon: DatabaseIcon,
          title: "Read the contact",
          detail: "Name, enquiry and earlier notes passed to the agent",
          time: "09:02",
        },
        {
          icon: PhoneCallIcon,
          title: "Placed the call",
          detail: "Inside calling hours. Opened by referring to the enquiry",
          time: "09:03",
          waveform: true,
        },
        {
          icon: BookOpenIcon,
          title: "Answered a question",
          detail: "Pricing and availability, from the agent’s knowledge",
          time: "09:05",
        },
        {
          icon: CalendarDaysIcon,
          title: "Booked Thursday, 11:00",
          detail: "Calendar event created and confirmed on the call",
          time: "09:06",
        },
        {
          icon: FileTextIcon,
          title: "Saved the outcome",
          detail: "Appointment requested, transcript and notes in the CRM",
          time: "09:06",
        },
      ],
    },
  },
  setup: {
    title: "Set up an AI voice agent in five steps",
    intro: "Most of the work is telling the agent what you want. There is nothing to install and nothing to code.",
    steps: [
      {
        title: "Give it a job",
        body: "Describe what the agent is for, such as following up leads or confirming appointments, and how it should speak and behave.",
      },
      {
        title: "Add your information",
        body: "Type in or upload the knowledge it needs: services, prices, opening hours, policies and answers to common questions.",
      },
      {
        title: "Connect your CRM and calendar",
        body: "Link the systems that hold your contacts and diaries, and choose which actions the agent may take in them.",
      },
      {
        title: "Choose a phone number",
        body: "Use a number provisioned for you, or bring your own, and assign it to the agent.",
      },
      {
        title: "Test it, then go live",
        body: "Make test calls before any real contact hears the agent. Then set calling hours and retry rules and switch it on.",
      },
    ],
  },
  control: {
    title: "You set the rules for every call",
    intro: "The agent is fast, but you decide how far it goes. Every limit below is yours to set.",
    items: [
      "Calling hours for each day, in your time zone. The AI never calls outside them",
      "Retry rules: how many attempts, how long between them and when to stop",
      "Hand a live call to a person when asked, or when the AI cannot resolve it",
      "Take a message and log a follow-up if nobody answers the transfer",
      "Recognise voicemail and leave only a message you have approved",
      "Choose exactly which CRM actions each agent may use",
      "Record calls where allowed and choose how long recordings are kept",
      "Read the transcript, outcome and cost of every call",
    ],
    closing:
      "The AI can only request an action. The platform checks that this agent is allowed to take it before anything changes in your systems.",
  },
  industries: {
    title: "One agent, configured for how your business works",
    intro: "The same AI voice agent is set up differently in each business. These are the most common uses.",
    items: [
      {
        slug: IndustrySlugs.realEstate,
        body: "Call property enquiries within minutes, qualify buyers and renters and book viewings.",
      },
      {
        slug: IndustrySlugs.sales,
        body: "Call new leads, qualify them against your criteria and book sales meetings.",
      },
      {
        slug: IndustrySlugs.customerSupport,
        body: "Answer and return routine support calls, and route the rest to your team.",
      },
      {
        slug: IndustrySlugs.recruitment,
        body: "Call applicants, collect availability and book interviews.",
      },
      {
        slug: IndustrySlugs.professionalServices,
        body: "Confirm appointments, collect information and return routine client calls.",
      },
    ],
  },
  faqs: [
    {
      question: "What is an AI voice agent?",
      answer:
        "An AI voice agent is software that holds phone conversations for your business. It understands what people say, answers in natural speech and takes actions you allow, such as booking an appointment or updating your CRM. It is also called an AI phone agent or AI calling agent.",
    },
    {
      question: "Can an AI voice agent make outbound calls?",
      answer:
        "Yes. It can follow up new leads, confirm appointments and contact people on a schedule you define: immediately, after a set delay, the next day or on a specific date. It retries by your rules when nobody answers.",
    },
    {
      question: "Can an AI voice agent answer inbound calls?",
      answer:
        "Yes. Assign the agent a phone number and it answers calls to it, handles routine requests, collects the caller’s details and records the outcome. It can hand a live call to a person when needed.",
    },
    {
      question: "What happens when the AI cannot handle a call?",
      answer:
        "You decide. The agent can transfer the call to a person when the caller asks or when it cannot resolve the conversation. If nobody is available it takes a message, tells the caller someone will be in touch and logs a follow-up.",
    },
    {
      question: "Does an AI voice agent work with our CRM?",
      answer:
        "Yes. The agent connects to CRM systems, including custom CRMs through their APIs. Before a call it can read the contact’s details, and afterwards it records the outcome and notes. You choose which actions each agent is allowed to use.",
    },
    {
      question: "Can I control when the AI calls people?",
      answer:
        "Yes. You set calling hours for each day and your time zone, and the agent never calls outside them. You also set how many times it retries and how long it waits between attempts.",
    },
    {
      question: "How much does an AI voice agent cost?",
      answer:
        "The cost of every call is recorded and shown against the call, with usage reports for any period. Book a demo and we will walk through pricing for your call volume.",
    },
  ],
  cta: {
    title: "What would your voice agent do first?",
    body: "Tell us which calls take the most of your team’s time and we will show you how an AI voice agent would handle them.",
  },
};

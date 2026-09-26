import {
  BookOpenIcon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
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
  tagline: "Makes and answers calls, follows your rules and updates your CRM afterwards.",
  href: Routes.marketing.voiceAgent,
  icon: MicIcon,
  orbs: ["mint", "sky"],
  seo: {
    title: "AI Voice Agent | AI Phone Agent for Business",
    description:
      "An AI voice agent that makes and answers calls, follows up leads, books appointments and updates your CRM afterwards.",
  },
  hero: {
    title: "AI voice agent for your business calls",
    lead: "An AI phone agent that makes and answers calls for you. It follows up leads, answers questions, books appointments and updates your CRM after every call. It only calls during the hours you set.",
  },
  definition: {
    title: "What is an AI voice agent?",
    body: "An AI voice agent is software that holds phone conversations for you. It listens, understands what the person says, answers in natural speech and takes the actions you allow, like booking an appointment or updating a record. You may also hear it called an AI phone agent or AI calling agent. It works both ways: it calls people you need to reach, and it answers people who call you.",
    contrastTitle: "How it differs from a phone menu",
    beforeLabel: "Phone menus and scripted dialers",
    afterLabel: "AI voice agent",
    rows: [
      {
        before: "Press 1 for sales, press 2 for support",
        after: "The caller says what they need in their own words",
      },
      {
        before: "Follows one script and gets lost when the person goes off it",
        after: "Follows your rules and handles questions in any order",
      },
      {
        before: "Knows nothing about the person it’s calling",
        after: "Reads the contact from your CRM before the call",
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
        body: "Follow up new leads, confirm appointments and reach contacts on a schedule: right away, after a delay or on a set date. It retries by your rules when nobody answers.",
      },
      {
        icon: PhoneIncomingIcon,
        title: "Answer inbound calls",
        body: "Pick up calls to your number at any hour you choose, handle routine requests and collect the caller’s details.",
      },
      {
        icon: ClipboardCheckIcon,
        title: "Qualify and answer questions",
        body: "Ask the questions your team would ask and save every answer. It answers from the knowledge you give it and passes on what it can’t answer.",
      },
      {
        icon: CalendarDaysIcon,
        title: "Book appointments and update your CRM",
        body: "Agree a time, create the calendar event and confirm it on the call. Afterwards it records the outcome and notes in your CRM.",
      },
    ],
  },
  example: {
    title: "One call, start to finish",
    intro:
      "A new enquiry comes in. Here’s what the agent does, from reading the CRM to saving the transcript, before anyone on your team gets involved.",
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
    title: "How to set up an AI voice agent",
    intro: "Most of the work is telling the agent what you want. There’s nothing to install and no code to write.",
    steps: [
      {
        title: "Give it a job and your information",
        body: "Describe what the agent is for, like following up leads, and how it should sound. Then add what it needs to know: services, prices, opening hours and answers to common questions.",
      },
      {
        title: "Connect your CRM, calendar and phone number",
        body: "Link the systems that hold your contacts and diaries and choose which actions the agent may take in them. Then assign a number, either one we provide or your own.",
      },
      {
        title: "Test it, then go live",
        body: "Make test calls before any real contact hears the agent. Then set calling hours and retry rules and switch it on.",
      },
    ],
  },
  control: {
    title: "You set the rules for every call",
    intro: "The agent is fast, but you decide how far it goes.",
    items: [
      "Set calling hours for each day in your time zone. It never calls outside them, and you choose how many retries it gets",
      "Hand a live call to a person when the caller asks or when the AI can’t resolve it",
      "Choose exactly which CRM actions each agent may use. Every action is checked against those permissions before anything changes",
      "Read the transcript, outcome and cost of every call, and choose whether recordings are kept and for how long",
    ],
  },
  industries: {
    title: "How teams use it",
    intro: "The same agent is set up differently in each business.",
    items: [
      {
        slug: IndustrySlugs.realEstate,
        body: "Calls property enquiries within minutes and books viewings.",
      },
      {
        slug: IndustrySlugs.sales,
        body: "Calls new leads, checks them against your criteria and books the meeting.",
      },
      {
        slug: IndustrySlugs.customerSupport,
        body: "Answers and returns routine calls and passes the rest to your team.",
      },
      {
        slug: IndustrySlugs.recruitment,
        body: "Calls applicants, checks availability and books interviews.",
      },
      {
        slug: IndustrySlugs.professionalServices,
        body: "Confirms appointments and returns routine client calls.",
      },
    ],
  },
  faqs: [
    {
      question: "Can an AI voice agent make and answer phone calls?",
      answer:
        "Yes, both. Outbound calls can go out right away, after a set delay, the next day or on a specific date. Inbound calls reach the agent through the phone number you assign to it.",
    },
    {
      question: "What does it do when it reaches voicemail?",
      answer:
        "It recognises voicemail and leaves only a message you’ve approved, so nothing goes out that you haven’t seen.",
    },
    {
      question: "What happens if nobody picks up the transfer?",
      answer:
        "The agent takes a message, tells the caller someone will be in touch and logs a follow-up, so the call doesn’t just end.",
    },
    {
      question: "Does an AI voice agent work with our CRM?",
      answer:
        "Yes, including custom CRMs through their APIs. Before a call it can read the contact’s details, and afterwards it records the outcome and notes.",
    },
    {
      question: "How much does an AI voice agent cost?",
      answer:
        "The cost of every call is recorded against the call, with usage reports for any period. Book a demo and we’ll walk through pricing for your call volume.",
    },
  ],
  cta: {
    title: "Which calls would you hand over first?",
    body: "Tell us which calls take most of your team’s time and we’ll show you how a voice agent would handle them.",
  },
};

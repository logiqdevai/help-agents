import {
  CalendarDaysIcon,
  ContactIcon,
  DatabaseIcon,
  InboxIcon,
  MailIcon,
  MessageSquareIcon,
  MicIcon,
  type LucideIcon,
} from "lucide-react";
import type { RunLedgerContent } from "@/interfaces/marketing.interfaces";
import { Routes } from "@/routes/routes";

export const LandingLedger: RunLedgerContent = {
  title: "Example run",
  doneLabel: "Done in 4 minutes",
  description: "Example: one new lead handled across voice, email and Viber",
  rows: [
    { icon: InboxIcon, title: "New lead", detail: "Website form: Nikos A. asked for a quote", time: "09:02" },
    {
      icon: DatabaseIcon,
      title: "Read the CRM record",
      detail: "Matched to an existing contact and an open deal",
      time: "09:02",
    },
    {
      icon: MicIcon,
      title: "Called the lead",
      detail: "2 min 14 s. Interested, timeline confirmed",
      time: "09:03",
      waveform: true,
    },
    { icon: MailIcon, title: "Sent a follow-up email", detail: "Options and pricing summary", time: "09:06" },
    {
      icon: CalendarDaysIcon,
      title: "Booked Thursday, 11:00",
      detail: "Confirmation sent on Viber",
      time: "09:06",
    },
    { icon: ContactIcon, title: "Updated the CRM", detail: "Stage, call notes and next step", time: "09:06" },
  ],
};

export const LandingSeo = {
  title: "AI Automation Platform | AI Agents for Business",
  description:
    "AI agents that make calls, read email and chat with customers on Viber for your business. Connect them to your CRM, set the rules and let them do the repetitive work.",
  ogAlt: "AI agents that handle your calls, emails and Viber chats.",
} as const;

export const LandingNavLinks = [
  { title: "Solutions", href: Routes.marketing.sections.solutions },
  { title: "How it works", href: Routes.marketing.sections.howItWorks },
  { title: "Use cases", href: Routes.marketing.sections.useCases },
  { title: "FAQ", href: Routes.marketing.sections.faq },
] as const;

export const LandingSolutionIds = { voice: "voice", email: "email", messaging: "messaging" } as const;
export type LandingSolutionId = (typeof LandingSolutionIds)[keyof typeof LandingSolutionIds];

export interface LandingSolution {
  id: LandingSolutionId;
  name: string;
  icon: LucideIcon;
  title: string;
  body: string;
  cta: string;
  href: string;
}

export const LandingSolutions: LandingSolution[] = [
  {
    id: LandingSolutionIds.voice,
    name: "AI voice agent",
    icon: MicIcon,
    title: "Calls your leads so your team doesn’t have to",
    body: "The voice agent calls new leads as soon as they come in, asks your qualifying questions and books a time in your calendar. It also answers inbound calls, and whatever it learns goes straight into your CRM.",
    cta: "See the voice agent",
    href: Routes.marketing.voiceAgent,
  },
  {
    id: LandingSolutionIds.email,
    name: "AI email agent",
    icon: MailIcon,
    title: "An inbox that sorts itself",
    body: "The email agent reads each message, works out what the sender wants and pulls out the details. Then it takes the next step: sending a reply, updating a record or passing it to the right person.",
    cta: "See the email agent",
    href: Routes.marketing.emailAgent,
  },
  {
    id: LandingSolutionIds.messaging,
    name: "AI Viber chatbot",
    icon: MessageSquareIcon,
    title: "Answers for customers, day and night",
    body: "Customers message you on Viber, the app they already use, and the chatbot replies with information from your own systems, like prices, availability or order status. If it can’t help, it passes the chat to a person.",
    cta: "See the Viber chatbot",
    href: Routes.marketing.messagingAgent,
  },
];

export const LandingSteps = [
  {
    title: "Connect your tools",
    body: "Link your CRM, calendar, email and Viber account. Have an in-house system? Connect it through its API.",
  },
  {
    title: "Set the rules",
    body: "Decide what the agent can see, what it can change and when a person should step in. Add your prices, FAQs and the way you talk to customers.",
  },
  {
    title: "Let it work",
    body: "It talks to leads and customers, does the follow-up and writes everything back to your CRM. You can review any conversation afterwards.",
  },
] as const;

export interface LandingUseCase {
  title: string;
  body: string;
  cta: string;
  href: string;
}

export const LandingUseCases: LandingUseCase[] = [
  {
    title: "Real estate",
    body: "Call back every property inquiry, find out what the buyer wants, suggest matching listings and book viewings.",
    cta: "Explore real estate",
    href: Routes.marketing.industries.realEstate,
  },
  {
    title: "Sales & lead generation",
    body: "Contact new leads the moment they arrive, qualify them and book the meeting for your sales team.",
    cta: "Explore sales",
    href: Routes.marketing.industries.sales,
  },
  {
    title: "Customer support",
    body: "Answer the common questions and hand the rest to the right person.",
    cta: "Explore support",
    href: Routes.marketing.industries.customerSupport,
  },
  {
    title: "Professional services",
    body: "Book appointments, send reminders and answer the routine questions clients keep asking.",
    cta: "Explore professional services",
    href: Routes.marketing.industries.professionalServices,
  },
  {
    title: "Recruitment",
    body: "Talk to candidates, collect their details, schedule interviews and keep your recruiting system current.",
    cta: "Explore recruitment",
    href: Routes.marketing.industries.recruitment,
  },
];

export const LandingAnyWorkflow = {
  title: "Something else?",
  body: "If the work is repetitive and involves talking to people or updating your systems, it can probably be automated.",
  cta: "Ask us about it",
  href: Routes.marketing.contact,
} as const;

export const LandingControls = [
  "Which systems and data it can access",
  "What actions it can take",
  "When it acts on its own",
  "When a person takes over",
  "What gets logged",
] as const;

export const LandingFinalCta = {
  title: "Which task would you hand over first?",
  body: "Tell us how you handle leads and customer messages today, and we’ll show you what an agent could take over. You can start with one workflow and add more once it’s working.",
} as const;

export const LandingFaqs = [
  {
    question: "What is an AI automation platform?",
    answer:
      "It’s software that lets AI agents work with your tools and data. They call people, email them or chat with them on Viber, look things up in your systems and complete tasks, following rules you set.",
  },
  {
    question: "Does it connect to our CRM?",
    answer:
      "Yes. The agents can read from and write to your CRM, calendar and other tools, so records stay up to date without anyone typing them in. If you use an in-house system, it can connect through an API.",
  },
  {
    question: "Can it really make phone calls?",
    answer:
      "Yes. The voice agent makes and receives calls. Typical jobs are following up new leads, asking qualifying questions, collecting details and booking appointments.",
  },
  {
    question: "What happens when the AI can’t handle something?",
    answer:
      "It hands the conversation to a person. You decide in advance which situations count, such as a complaint, a complex request or a customer who asks for a human.",
  },
  {
    question: "Will it work for our industry?",
    answer:
      "Probably. The agents are set up around your own process, so the same platform serves real estate, sales, support, recruitment and professional services. Book a demo and we’ll tell you honestly whether it’s a fit.",
  },
] as const;

export const LandingFooterColumns = [
  {
    title: "AI agents",
    links: [
      { title: "AI voice agent", href: Routes.marketing.voiceAgent },
      { title: "AI email agent", href: Routes.marketing.emailAgent },
      { title: "AI Viber chatbot", href: Routes.marketing.messagingAgent },
    ],
  },
  {
    title: "Industries",
    links: [
      { title: "Real estate", href: Routes.marketing.industries.realEstate },
      { title: "Sales", href: Routes.marketing.industries.sales },
      { title: "Customer support", href: Routes.marketing.industries.customerSupport },
      { title: "Recruitment", href: Routes.marketing.industries.recruitment },
      { title: "Professional services", href: Routes.marketing.industries.professionalServices },
    ],
  },
  {
    title: "Platform",
    links: [
      { title: "How it works", href: Routes.marketing.sections.howItWorks },
      { title: "Use cases", href: Routes.marketing.sections.useCases },
      { title: "FAQ", href: Routes.marketing.sections.faq },
    ],
  },
  {
    title: "Account",
    links: [
      { title: "Book a demo", href: Routes.marketing.contact },
      { title: "Log in", href: Routes.auth.login },
    ],
  },
] as const;

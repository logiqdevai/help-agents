import {
  BlocksIcon,
  CalendarDaysIcon,
  ContactIcon,
  DatabaseIcon,
  MailIcon,
  MessageSquareIcon,
  MicIcon,
  type LucideIcon,
} from "lucide-react";
import { Routes } from "@/routes/routes";

export const LandingSeo = {
  title: "AI Automation Platform | AI Agents for Business",
  description:
    "Automate business workflows with AI agents for voice calls, email and messaging. Connect AI to your CRM, business systems and data to automate repetitive work and customer interactions.",
  ogAlt: "AI agents that work for your business: voice, email and messaging on one connected AI platform.",
} as const;

export const LandingNavLinks = [
  { title: "Solutions", href: Routes.marketing.sections.solutions },
  { title: "How it works", href: Routes.marketing.sections.howItWorks },
  { title: "Use cases", href: Routes.marketing.sections.useCases },
  { title: "Integrations", href: Routes.marketing.sections.integrations },
  { title: "FAQ", href: Routes.marketing.sections.faq },
] as const;

export const LandingSolutionIds = { voice: "voice", email: "email", messaging: "messaging" } as const;
export type LandingSolutionId = (typeof LandingSolutionIds)[keyof typeof LandingSolutionIds];

export interface LandingSolution {
  id: LandingSolutionId;
  name: string;
  icon: LucideIcon;
  title: string;
  body: string[];
  tagline: string;
  cta: string;
  href: string;
}

export const LandingSolutions: LandingSolution[] = [
  {
    id: LandingSolutionIds.voice,
    name: "AI voice agent",
    icon: MicIcon,
    title: "AI-powered voice calls that get things done",
    body: [
      "Make and receive automated phone calls with an AI agent that can understand conversations, follow business rules and take action.",
      "The AI voice agent can follow up with leads, qualify prospects, answer questions, collect information, schedule appointments and update your systems automatically.",
    ],
    tagline: "Automate the conversation — not just the call.",
    cta: "Explore AI voice agent",
    href: Routes.marketing.voiceAgent,
  },
  {
    id: LandingSolutionIds.email,
    name: "AI email agent",
    icon: MailIcon,
    title: "Turn emails into actions",
    body: [
      "Let AI understand your incoming emails and take action instead of leaving your team to process everything manually.",
      "The AI email agent can read conversations, extract information, identify requests, update your systems and trigger workflows based on the content of each email.",
    ],
    tagline: "From inbox to action, automatically.",
    cta: "Explore AI email agent",
    href: Routes.marketing.emailAgent,
  },
  {
    id: LandingSolutionIds.messaging,
    name: "AI messaging agent",
    icon: MessageSquareIcon,
    title: "AI conversations across messaging channels",
    body: [
      "Give customers and users an AI-powered way to interact with your business through messaging.",
      "The AI agent can use your business data and connected systems to answer questions, provide information and perform actions.",
    ],
    tagline: "Instant answers powered by your business data.",
    cta: "Explore AI messaging",
    href: Routes.marketing.messagingAgent,
  },
];

export const LandingSteps = [
  {
    title: "Connect",
    body: "Connect your CRM, email, databases, calendars, communication channels and other business systems.",
  },
  {
    title: "Give AI context",
    body: "Provide the information, knowledge and rules your AI agents need to understand your business.",
  },
  {
    title: "Define what AI can do",
    body: "Configure the actions, workflows and processes your agents can execute.",
  },
  {
    title: "Let AI work",
    body: "Your AI agents communicate with customers, process information and execute tasks automatically.",
  },
  {
    title: "Keep everything connected",
    body: "Actions and results can be synchronized with your existing systems so your team always has the latest information.",
  },
] as const;

export const LandingLoopVerbs = ["Read", "Understand", "Decide", "Act", "Update"] as const;

export const LandingExampleFlow = [
  "New lead",
  "AI reads CRM",
  "AI calls lead",
  "Qualifies interest",
  "Recommends options",
  "Books appointment",
  "Updates CRM",
] as const;

export interface LandingUseCase {
  title: string;
  body: string;
  stack: string[];
  cta: string;
  href: string;
}

export const LandingUseCases: LandingUseCase[] = [
  {
    title: "Real estate",
    body: "Automate lead follow-ups, property inquiries, customer qualification, property recommendations and appointment scheduling.",
    stack: ["AI voice agent", "CRM", "Viber"],
    cta: "Explore real estate automation",
    href: Routes.marketing.industries.realEstate,
  },
  {
    title: "Sales & lead generation",
    body: "Automatically contact new leads, qualify prospects, follow up with opportunities and schedule sales meetings.",
    stack: ["AI voice", "Email", "CRM"],
    cta: "Explore sales automation",
    href: Routes.marketing.industries.sales,
  },
  {
    title: "Customer support",
    body: "Answer common questions, provide information and route conversations to the right person when human assistance is needed.",
    stack: ["AI messaging", "Knowledge base", "CRM"],
    cta: "Explore customer support automation",
    href: Routes.marketing.industries.customerSupport,
  },
  {
    title: "Professional services",
    body: "Automate client communication, appointment scheduling, information requests and administrative workflows.",
    stack: ["AI voice", "Email", "Calendar"],
    cta: "Explore professional services",
    href: Routes.marketing.industries.professionalServices,
  },
  {
    title: "Recruitment",
    body: "Communicate with candidates, collect information, schedule interviews and keep recruitment systems updated.",
    stack: ["AI voice", "Email", "CRM"],
    cta: "Explore recruitment automation",
    href: Routes.marketing.industries.recruitment,
  },
];

export const LandingAnyWorkflow = {
  title: "Any workflow",
  body: "If a process involves repetitive communication, information processing or actions across business systems, it may be a candidate for AI automation.",
  cta: "Explore all use cases",
  href: Routes.marketing.useCases,
} as const;

export interface LandingIntegration {
  title: string;
  body: string;
  icon: LucideIcon;
}

export const LandingIntegrations: LandingIntegration[] = [
  {
    title: "CRM",
    body: "Access customer, lead and business information and automatically update records.",
    icon: ContactIcon,
  },
  { title: "Email", body: "Read, understand and process incoming communication.", icon: MailIcon },
  { title: "Calendar", body: "Schedule appointments and coordinate availability.", icon: CalendarDaysIcon },
  {
    title: "Messaging",
    body: "Connect AI conversations to the channels your customers already use.",
    icon: MessageSquareIcon,
  },
  { title: "Databases", body: "Give AI access to structured business information.", icon: DatabaseIcon },
  {
    title: "Custom systems",
    body: "Connect your own APIs and internal tools to create workflows around your specific requirements.",
    icon: BlocksIcon,
  },
];

export const LandingControls = [
  "What information AI can access",
  "What actions AI can perform",
  "Which systems it can interact with",
  "When AI should take action",
  "When a human should take over",
  "How every action should be recorded",
] as const;

export const LandingExpansionStages = [
  "Voice agent",
  "Email agent",
  "Messaging agent",
  "CRM automation",
  "Additional AI agents",
] as const;

export const LandingBenefits = [
  {
    title: "Respond faster",
    body: "AI can respond to customers and leads without waiting for someone on your team to become available.",
  },
  {
    title: "Follow up consistently",
    body: "Automate repetitive follow-ups and reduce the number of opportunities that are forgotten.",
  },
  {
    title: "Reduce manual work",
    body: "Let AI handle repetitive communication and administrative processes.",
  },
  {
    title: "Keep systems updated",
    body: "Automatically transfer information between conversations and your business systems.",
  },
  {
    title: "Scale without adding the same amount of manual work",
    body: "Automate processes that would otherwise require additional time from your team.",
  },
] as const;

export const LandingFaqs = [
  {
    question: "What is an AI automation platform?",
    answer:
      "An AI automation platform connects AI agents with business systems, data and workflows so they can perform tasks and automate repetitive processes.",
  },
  {
    question: "What can AI agents automate?",
    answer:
      "AI agents can automate communication, lead follow-ups, customer support, data processing, appointment scheduling, CRM updates and many other workflows.",
  },
  {
    question: "Can AI agents connect to our CRM?",
    answer:
      "Yes. AI agents can be connected to CRM systems and other business applications to access relevant information and perform configured actions.",
  },
  {
    question: "Can the AI make phone calls?",
    answer:
      "Yes. The AI voice agent can make automated calls for tasks such as follow-ups, qualification, information collection and appointment scheduling.",
  },
  {
    question: "Can AI process emails?",
    answer:
      "Yes. The AI email agent can understand incoming emails, extract relevant information and trigger configured actions.",
  },
  {
    question: "Can AI answer questions using our business data?",
    answer:
      "Yes. AI agents can be connected to business information, knowledge bases and other data sources to provide context-aware responses.",
  },
  {
    question: "Can we use this for our industry?",
    answer:
      "Yes. The platform is designed to support different industries and workflows. Dedicated solutions can be configured around the specific processes of each business.",
  },
] as const;

export const LandingFooterColumns = [
  {
    title: "AI agents",
    links: [
      { title: "AI voice agent", href: Routes.marketing.voiceAgent },
      { title: "AI email agent", href: Routes.marketing.emailAgent },
      { title: "AI messaging agent", href: Routes.marketing.messagingAgent },
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
      { title: "Use cases", href: Routes.marketing.useCases },
      { title: "Integrations", href: Routes.marketing.sections.integrations },
      { title: "FAQ", href: Routes.marketing.sections.faq },
    ],
  },
  {
    title: "Account",
    links: [
      { title: "Log in", href: Routes.auth.login },
      { title: "Create account", href: Routes.auth.signup },
    ],
  },
] as const;

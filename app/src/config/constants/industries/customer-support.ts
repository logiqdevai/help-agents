import {
  BookOpenIcon,
  ContactIcon,
  DatabaseIcon,
  HeartHandshakeIcon,
  MailIcon,
  MessageSquareIcon,
  PhoneIcon,
  RouteIcon,
  UserRoundIcon,
} from "lucide-react";
import { Routes } from "@/routes/routes";
import { IndustryChannels, IndustrySlugs, type IndustryContent } from "./industry.types";

export const CustomerSupportIndustry: IndustryContent = {
  slug: IndustrySlugs.customerSupport,
  name: "Customer support",
  href: Routes.marketing.industries.customerSupport,
  orbs: ["lavender", "mint"],
  seo: {
    title: "AI Customer Support | AI Support Agents",
    description:
      "AI customer support agents that answer common questions from your knowledge base, act on connected systems and pass conversations to your team when needed.",
  },
  hero: {
    title: "AI customer support that answers and acts",
    lead: "AI support agents answer common questions from your own knowledge base, look up account details and pass conversations to the right person when human help is needed.",
    support: "Built for support teams that want faster answers for customers without giving up control of the difficult conversations.",
    stack: ["AI messaging", "Knowledge base", "CRM"],
  },
  ledger: {
    title: "Example run: customer question",
    doneLabel: "Resolved in 2 minutes",
    description: "Example: a customer question handled by an AI customer support agent",
    rows: [
      {
        icon: MessageSquareIcon,
        title: "New message",
        detail: "“Where is my order?”, sent on messaging",
        time: "19:42",
      },
      {
        icon: DatabaseIcon,
        title: "Read the customer record",
        detail: "Matched the customer and their open order",
        time: "19:42",
      },
      {
        icon: BookOpenIcon,
        title: "Checked the knowledge base",
        detail: "Delivery times and the returns policy",
        time: "19:42",
      },
      {
        icon: MessageSquareIcon,
        title: "Answered the customer",
        detail: "Order status, expected date and next step in one reply",
        time: "19:43",
      },
      {
        icon: UserRoundIcon,
        title: "Passed a refund request to the team",
        detail: "A person gets the full conversation and account details",
        time: "19:44",
      },
      {
        icon: ContactIcon,
        title: "Updated the customer record",
        detail: "Conversation summary and outcome saved",
        time: "19:44",
      },
    ],
  },
  pains: {
    title: "Where support time goes",
    intro:
      "Most support queues are dominated by a small set of questions, while the conversations that need a person wait in the same line.",
    items: [
      {
        title: "The same questions, again and again",
        body: "Order status, opening hours, pricing, how to change a booking. Each one is simple, and together they fill the queue.",
      },
      {
        title: "Answers live in too many places",
        body: "The right answer is in a document, a CRM note or someone’s head. Agents spend time looking instead of helping.",
      },
      {
        title: "Out-of-hours messages wait",
        body: "Customers write in the evening or at weekends and wait until the team is back, even when the answer is one you already have.",
      },
      {
        title: "Handoffs lose context",
        body: "When a conversation moves to a colleague the customer often has to explain everything again.",
      },
      {
        title: "Nobody follows up after resolution",
        body: "Checking that an issue is really solved rarely gets time, so problems come back as new tickets.",
      },
    ],
  },
  capabilities: {
    title: "What AI support agents do",
    intro:
      "They answer from what you have told them, act where you allow it and pass on what needs a person.",
    items: [
      {
        icon: MessageSquareIcon,
        channel: IndustryChannels.messaging,
        title: "Answer common questions",
        body: "The AI messaging agent replies instantly from your knowledge base, in the channels your customers already use.",
      },
      {
        icon: ContactIcon,
        channel: IndustryChannels.crm,
        title: "Give answers that fit the customer",
        body: "It reads the customer’s record, such as their order, plan or booking, so the answer is about their situation rather than a generic one.",
      },
      {
        icon: PhoneIcon,
        channel: IndustryChannels.voice,
        title: "Handle routine calls",
        body: "The AI voice agent answers and returns calls about routine requests, collects the details it needs and logs the outcome.",
      },
      {
        icon: MailIcon,
        channel: IndustryChannels.email,
        title: "Process support emails",
        body: "The AI email agent reads each message, identifies the request, extracts the details and updates your systems or starts a workflow.",
      },
      {
        icon: RouteIcon,
        channel: IndustryChannels.crm,
        title: "Route to the right person",
        body: "When a request needs a person, the agent passes it on with a summary of the conversation, so the customer does not start again.",
      },
      {
        icon: HeartHandshakeIcon,
        channel: IndustryChannels.voice,
        title: "Follow up after resolution",
        body: "It can check back after an issue is closed to confirm the customer is happy, and flag those who are not.",
      },
    ],
  },
  workflow: {
    title: "How it works for a support team",
    intro: "Begin with the questions that fill your queue, then widen the agent’s scope as you gain confidence.",
    steps: [
      {
        title: "Connect your systems and channels",
        body: "Link your CRM or ticketing system and the channels customers use to reach you.",
      },
      {
        title: "Add your knowledge",
        body: "Give the agent your help articles, policies, prices and procedures. Changes are versioned, so you can see earlier versions and restore them.",
      },
      {
        title: "Define what it can do",
        body: "Choose which questions it answers, which actions it may take and which situations always go to a person.",
      },
      {
        title: "Test with real questions",
        body: "Try the agent on the questions your customers actually ask before it talks to a customer, then go live on one channel.",
      },
      {
        title: "Review conversations and improve",
        body: "Read conversations and outcomes, spot gaps in your knowledge and fix them at the source.",
      },
    ],
  },
  systems: {
    title: "Connects to the tools your support team already uses",
    intro: "The agent answers from your knowledge and your customer data, not from guesswork.",
    items: [
      {
        icon: BookOpenIcon,
        title: "Knowledge base",
        body: "Help articles, policies and procedures the agent answers from.",
      },
      {
        icon: ContactIcon,
        title: "CRM",
        body: "Customer details, history and open requests, updated after each conversation.",
      },
      {
        icon: MessageSquareIcon,
        title: "Messaging",
        body: "Answer customers on the channels they already use.",
      },
      {
        icon: MailIcon,
        title: "Email",
        body: "Read and process incoming support email.",
      },
      {
        icon: PhoneIcon,
        title: "Phone numbers",
        body: "Handle routine calls on your own or a provisioned number.",
      },
      {
        icon: DatabaseIcon,
        title: "Custom systems",
        body: "Connect order, booking or ticketing systems through their APIs.",
      },
    ],
  },
  control: {
    title: "Your team handles what needs a person",
    intro: "You decide where the AI stops and your team starts.",
    items: [
      "Pass the conversation to a person when the customer asks for one",
      "Pass it on when the AI cannot resolve the request",
      "Route specific outcomes, such as complaints, straight to your team",
      "Take a message and log a follow-up when nobody is available",
      "Keep sensitive topics with people only",
      "Read every conversation and see what the AI did",
    ],
    closing: "The AI answers from your knowledge and acts only within the permissions you give it.",
  },
  faqs: [
    {
      question: "What is AI customer support?",
      answer:
        "AI customer support uses AI agents to answer customer questions, handle routine requests and pass conversations to a person when needed. Connected to your knowledge base and CRM, the agents can give answers that fit each customer.",
    },
    {
      question: "Can AI answer customer questions accurately?",
      answer:
        "The agent answers from the knowledge and customer data you connect, rather than from general guesses. You can see every conversation, fix gaps in your knowledge, and set topics that always go to a person.",
    },
    {
      question: "Can AI customer service automation take actions, not just answer?",
      answer:
        "Yes. Connected to your systems, an agent can look up records, update them and start workflows. You choose which actions each agent may use, and every action is checked against those permissions and recorded.",
    },
    {
      question: "What happens when the AI cannot help?",
      answer:
        "You set the rules. The agent can pass the conversation to a person when the customer asks, when it cannot resolve the request or when a certain outcome is reached. If nobody is available it can take a message and log a follow-up.",
    },
    {
      question: "Can AI handle phone support as well as messaging?",
      answer:
        "Yes. The AI voice agent can answer and return calls for routine requests, and the AI messaging and email agents cover written channels, all working from the same knowledge.",
    },
  ],
  cta: {
    title: "What could your support team hand off?",
    body: "Tell us which questions fill your queue and we will show you where AI agents can answer them, and where a person should step in.",
  },
};

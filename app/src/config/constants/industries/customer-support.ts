import {
  BookOpenIcon,
  ContactIcon,
  DatabaseIcon,
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
    lead: "AI support agents for teams that want faster answers without giving up the difficult conversations. They answer common questions from your knowledge base, look up account details and pass the conversation to the right person when a human is needed.",
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
    intro: "A handful of simple questions fill most queues, and the conversations that need a person wait in the same line.",
    items: [
      {
        title: "The same questions, again and again",
        body: "Order status, opening hours, pricing, how to change a booking. Each one is simple, and together they fill the queue.",
      },
      {
        title: "Out-of-hours messages wait",
        body: "Customers write in the evening or at weekends and wait until the team is back, even when the answer is one you already have.",
      },
      {
        title: "Handoffs lose context",
        body: "When a conversation moves to a colleague, the customer often has to explain everything again.",
      },
    ],
  },
  capabilities: {
    title: "What AI support agents do",
    intro: "They answer from what you’ve told them, act where you allow it and pass on what needs a person.",
    items: [
      {
        icon: MessageSquareIcon,
        channel: IndustryChannels.messaging,
        title: "Answer questions that fit the customer",
        body: "The messaging agent replies instantly from your knowledge base, on the channels customers already use. It reads the customer’s record, such as their order, plan or booking, so the answer is about their situation.",
      },
      {
        icon: PhoneIcon,
        channel: IndustryChannels.voice,
        title: "Handle routine calls",
        body: "The voice agent answers and returns calls about routine requests, collects the details it needs and logs the outcome.",
      },
      {
        icon: MailIcon,
        channel: IndustryChannels.email,
        title: "Process support emails",
        body: "The email agent reads each message, identifies the request, extracts the details and updates your systems or starts a workflow.",
      },
      {
        icon: RouteIcon,
        channel: IndustryChannels.crm,
        title: "Route to the right person",
        body: "When a request needs a person, the agent passes it on with a summary of the conversation, so the customer doesn’t start again.",
      },
    ],
  },
  workflow: {
    title: "How it works for a support team",
    intro: "Begin with the questions that fill your queue, then widen the agent’s scope as you gain confidence.",
    steps: [
      {
        title: "Connect your tools",
        body: "Link your CRM or ticketing system and the channels customers use to reach you: messaging, email and phone. Connect order or booking systems through their APIs.",
      },
      {
        title: "Add your knowledge and set the rules",
        body: "Give the agent your help articles, policies, prices and procedures. Changes are versioned, so you can see earlier versions and restore them. Then choose which questions it answers, which actions it may take and which situations always go to a person.",
      },
      {
        title: "Test with real questions, then go live",
        body: "Try the questions your customers actually ask before the agent talks to one, then go live on a single channel. Read conversations, spot gaps in your knowledge and fix them at the source.",
      },
    ],
  },
  control: {
    title: "Your team handles what needs a person",
    intro: "You decide where the AI stops and your team starts.",
    items: [
      "Pass the conversation to a person when the customer asks, or when the AI can’t resolve the request",
      "Route specific outcomes, such as complaints, straight to your team, and keep sensitive topics with people only",
      "Take a message and log a follow-up when nobody is available",
      "Read every conversation afterwards. Every action is checked against permissions and logged",
    ],
  },
  faqs: [
    {
      question: "What is AI customer support?",
      answer:
        "It uses AI agents to answer customer questions, handle routine requests and pass conversations to a person when needed. Connected to your knowledge base and CRM, the agents can give answers that fit each customer.",
    },
    {
      question: "Can AI answer customer questions accurately?",
      answer:
        "The agent answers from the knowledge and customer data you connect, not from general guesses. You can read every conversation, fix gaps in your knowledge and set topics that always go to a person.",
    },
    {
      question: "Can AI customer service automation take actions, not just answer?",
      answer:
        "Yes. Connected to your systems, an agent can look up records, update them and start workflows. You choose which actions each agent may use.",
    },
    {
      question: "Can AI handle phone support as well as messaging?",
      answer:
        "Yes. The voice agent answers and returns calls for routine requests, while the messaging and email agents cover written channels. All three work from the same knowledge.",
    },
  ],
  cta: {
    title: "Which questions fill your queue?",
    body: "Tell us what your customers ask most, and we’ll show you where an agent can answer and where a person should step in.",
  },
};

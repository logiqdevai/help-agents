import {
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ContactIcon,
  MessageSquareIcon,
  RouteIcon,
  UserRoundIcon,
  ZapIcon,
} from "lucide-react";
import { IndustrySlugs } from "@/config/constants/industries";
import { Routes } from "@/routes/routes";
import { ProductSlugs, type ProductContent } from "./product.types";

export const MessagingAgentProduct: ProductContent = {
  slug: ProductSlugs.messaging,
  name: "AI messaging agent",
  tagline: "Answers customers on messaging apps using your own data.",
  href: Routes.marketing.messagingAgent,
  icon: MessageSquareIcon,
  orbs: ["lavender", "mint"],
  seo: {
    title: "AI Messaging Agent | AI Chatbot for Business",
    description:
      "An AI messaging agent that answers customers on messaging apps from your own data and takes actions in your connected systems.",
  },
  hero: {
    title: "AI messaging agent: a chatbot that knows your business",
    lead: "The agent answers customers on the apps they already use, drawing on your knowledge base and connected systems. It can act, not just reply, and a person steps in when the conversation needs one.",
  },
  definition: {
    title: "What is an AI messaging agent?",
    body: "An AI messaging agent is an AI assistant that talks to your customers over messaging channels. It reads your knowledge base, looks up the customer’s record and takes actions like booking or updating. It’s what many businesses mean when they ask for an AI chatbot, without the menus and dead ends.",
    contrastTitle: "How it differs from a scripted chatbot",
    beforeLabel: "Scripted chatbots",
    afterLabel: "AI messaging agent",
    rows: [
      {
        before: "Offers buttons and fixed conversation paths",
        after: "Understands free-text questions in the customer’s own words",
      },
      {
        before: "Gives everyone the same answer",
        after: "Answers using the customer’s own record and your data",
      },
      {
        before: "Says “contact us” when it can’t help",
        after: "Does the task, or hands over with a summary",
      },
    ],
  },
  capabilities: {
    title: "What an AI messaging agent can do",
    intro: "It answers, acts and hands over, using only the information and permissions you give it.",
    items: [
      {
        icon: BookOpenIcon,
        title: "Answer from your business data",
        body: "Replies come from your knowledge base and the customer’s own record, so an answer about prices, policies or a booking matches your information and their situation.",
      },
      {
        icon: ZapIcon,
        title: "Take actions",
        body: "Book an appointment, update a record or create a task in your connected systems, within the actions you allow.",
      },
      {
        icon: BellIcon,
        title: "Follow the thread and send reminders",
        body: "It remembers what the customer has already said and doesn’t ask twice. Within a workflow you set up, it also confirms bookings and sends reminders.",
      },
      {
        icon: UserRoundIcon,
        title: "Hand over to a person",
        body: "When a request needs a person, it passes the conversation on with a summary, so the customer never starts again.",
      },
    ],
  },
  example: {
    title: "One conversation, start to finish",
    intro:
      "A customer asks about availability. The agent answers, books and updates your systems without a person stepping in.",
    ledger: {
      title: "Example run: customer conversation",
      doneLabel: "Booked in 1 minute",
      description: "Example: a customer conversation handled by an AI messaging agent",
      rows: [
        {
          icon: MessageSquareIcon,
          title: "Customer message",
          detail: "“Do you have anything available on Thursday?”",
          time: "18:31",
        },
        {
          icon: ContactIcon,
          title: "Read the customer record",
          detail: "Existing customer, previous appointment found",
          time: "18:31",
        },
        {
          icon: CalendarDaysIcon,
          title: "Checked availability",
          detail: "Two free slots on Thursday: 11:00 and 15:30",
          time: "18:31",
        },
        {
          icon: MessageSquareIcon,
          title: "Offered both times",
          detail: "One reply with the options and the location",
          time: "18:31",
        },
        {
          icon: CalendarDaysIcon,
          title: "Booked Thursday, 11:00",
          detail: "After the customer chose, the event was created and confirmed",
          time: "18:32",
        },
        {
          icon: RouteIcon,
          title: "Updated the CRM",
          detail: "Appointment added and the conversation summarised on the record",
          time: "18:32",
        },
      ],
    },
  },
  setup: {
    title: "How to set up an AI messaging agent",
    intro: "You decide what it knows, what it can do and when a person takes over.",
    steps: [
      {
        title: "Connect your channels and systems",
        body: "Link the messaging channels your customers use, plus the CRM and calendar the agent should work with.",
      },
      {
        title: "Add your knowledge and set the limits",
        body: "Give it the articles, policies and prices to answer from. Update them in one place and every conversation follows. Then choose which actions it may take and which topics always go to a person.",
      },
      {
        title: "Test it, then go live",
        body: "Try it with the questions your customers really ask. Switch it on for one channel first and widen from there.",
      },
    ],
  },
  control: {
    title: "You decide where the agent stops",
    intro: "It answers what you’ve taught it and passes on what it shouldn’t handle.",
    items: [
      "Choose which channels it answers on and which topics go straight to a person",
      "Set when it hands a conversation over and who receives it, history included",
      "Limit it to the actions you allow. Every action is checked against those permissions",
      "Read every conversation and see what the agent did",
    ],
  },
  industries: {
    title: "How teams use it",
    intro: "The same agent is set up differently in each business.",
    items: [
      {
        slug: IndustrySlugs.realEstate,
        body: "Answers property questions, recommends listings and sends details on Viber.",
      },
      {
        slug: IndustrySlugs.sales,
        body: "Answers product questions and moves interested prospects toward a meeting.",
      },
      {
        slug: IndustrySlugs.customerSupport,
        body: "Answers common questions and passes difficult ones to the right person.",
      },
      {
        slug: IndustrySlugs.recruitment,
        body: "Answers candidates’ questions and sends interview confirmations and reminders.",
      },
      {
        slug: IndustrySlugs.professionalServices,
        body: "Answers routine client questions about appointments and process.",
      },
    ],
  },
  faqs: [
    {
      question: "Which messaging channels does it work on?",
      answer:
        "It connects to the channels your customers already use, such as Viber. Tell us which ones matter to you and we’ll confirm support during your demo.",
    },
    {
      question: "Can an AI chatbot for business use our own data?",
      answer:
        "Yes. It answers from your help articles, policies and prices and from connected systems like your CRM, not from general guesses.",
    },
    {
      question: "What happens when the AI can’t answer?",
      answer:
        "It passes the conversation to a person when the customer asks, when it can’t resolve the request or when the topic is one you’ve reserved for your team. A summary goes with it.",
    },
    {
      question: "Can it message customers first, for example with reminders?",
      answer:
        "Yes. As part of a workflow you set up, it can send confirmations and reminders, and it carries on the conversation if the customer replies.",
    },
  ],
  cta: {
    title: "Which questions would you hand over first?",
    body: "Tell us what customers ask most and we’ll show you how a messaging agent would answer them.",
  },
};

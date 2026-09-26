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
  name: "AI Viber chatbot",
  tagline: "Answers customers on Viber from your own data.",
  href: Routes.marketing.messagingAgent,
  icon: MessageSquareIcon,
  orbs: ["lavender", "mint"],
  seo: {
    title: "AI Viber Chatbot | AI Chatbot for Business on Viber",
    description:
      "An AI chatbot for Viber that answers customers from your own data, takes actions in your connected systems and hands over to your team when needed.",
  },
  hero: {
    title: "AI Viber chatbot that knows your business",
    lead: "Customers message your business on Viber and the chatbot replies from your knowledge base and connected systems. It can act, not just reply, and a person steps in when the conversation needs one.",
  },
  definition: {
    title: "What is an AI Viber chatbot?",
    body: "An AI Viber chatbot is an AI assistant that chats with your customers inside Viber. It reads your knowledge base, looks up the customer’s record and takes actions like booking or updating. It’s what many businesses mean when they ask for a Viber chatbot, without the menus and dead ends.",
    contrastTitle: "How it differs from a scripted Viber bot",
    beforeLabel: "Scripted Viber bots",
    afterLabel: "AI Viber chatbot",
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
    title: "What an AI Viber chatbot can do",
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
        title: "Follow the chat and send reminders",
        body: "It remembers what the customer has already said in the conversation and doesn’t ask twice. Within a workflow you set up, it also confirms bookings and sends reminders on Viber.",
      },
      {
        icon: UserRoundIcon,
        title: "Hand over to a person",
        body: "When a request needs a person, it passes the chat on with a summary, so the customer never starts again.",
      },
    ],
  },
  example: {
    title: "One Viber conversation, start to finish",
    intro:
      "A customer asks about availability on Viber. The chatbot answers, books and updates your systems without a person stepping in.",
    ledger: {
      title: "Example run: Viber conversation",
      doneLabel: "Booked in 1 minute",
      description: "Example: a Viber conversation handled by an AI chatbot",
      rows: [
        {
          icon: MessageSquareIcon,
          title: "Customer message",
          detail: "“Do you have anything available on Thursday?”, sent on Viber",
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
          detail: "One reply in the chat with the options and the location",
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
    title: "How to set up an AI Viber chatbot",
    intro: "You decide what it knows, what it can do and when a person takes over.",
    steps: [
      {
        title: "Connect Viber and your systems",
        body: "Link your Viber account, plus the CRM and calendar the chatbot should work with.",
      },
      {
        title: "Add your knowledge and set the limits",
        body: "Give it the articles, policies and prices to answer from. Update them in one place and every conversation follows. Then choose which actions it may take and which topics always go to a person.",
      },
      {
        title: "Test it, then go live",
        body: "Try it with the questions your customers really ask. Start with a small group of customers and widen from there.",
      },
    ],
  },
  control: {
    title: "You decide where the chatbot stops",
    intro: "It answers what you’ve taught it and passes on what it shouldn’t handle.",
    items: [
      "Choose which topics it answers and which go straight to a person",
      "Set when it hands a chat over and who receives it, history included",
      "Limit it to the actions you allow. Every action is checked against those permissions",
      "Read every conversation and see what the chatbot did",
    ],
  },
  industries: {
    title: "How teams use it",
    intro: "The same chatbot is set up differently in each business.",
    items: [
      {
        slug: IndustrySlugs.realEstate,
        body: "Answers property questions on Viber, recommends listings and sends the details in the chat.",
      },
      {
        slug: IndustrySlugs.sales,
        body: "Answers product questions on Viber and moves interested prospects toward a meeting.",
      },
      {
        slug: IndustrySlugs.customerSupport,
        body: "Answers common questions on Viber and passes difficult ones to the right person.",
      },
      {
        slug: IndustrySlugs.recruitment,
        body: "Answers candidates’ questions on Viber and sends interview confirmations and reminders.",
      },
      {
        slug: IndustrySlugs.professionalServices,
        body: "Answers routine client questions about appointments and process on Viber.",
      },
    ],
  },
  faqs: [
    {
      question: "Does it work on Viber?",
      answer:
        "Yes. The chatbot chats with customers in Viber, the app they already use, so there’s nothing new for them to install. We’ll go through connecting your Viber account during your demo.",
    },
    {
      question: "Can a Viber chatbot use our own data?",
      answer:
        "Yes. It answers from your help articles, policies and prices and from connected systems like your CRM, not from general guesses.",
    },
    {
      question: "What happens when the AI can’t answer?",
      answer:
        "It passes the chat to a person when the customer asks, when it can’t resolve the request or when the topic is one you’ve reserved for your team. A summary goes with it.",
    },
    {
      question: "Can it send the first message, for example a reminder?",
      answer:
        "Yes. As part of a workflow you set up, it can send confirmations and reminders on Viber, and it carries on the conversation if the customer replies. Viber’s own messaging rules apply, and we’ll go through them with you.",
    },
  ],
  cta: {
    title: "Which questions would you hand over first?",
    body: "Tell us what customers ask most on Viber and we’ll show you how the chatbot would answer them.",
  },
};

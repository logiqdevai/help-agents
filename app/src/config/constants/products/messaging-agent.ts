import {
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ContactIcon,
  MessageSquareIcon,
  MessagesSquareIcon,
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
  tagline: "Answers customers on messaging channels using your business data.",
  href: Routes.marketing.messagingAgent,
  icon: MessageSquareIcon,
  orbs: ["lavender", "mint"],
  seo: {
    title: "AI Messaging Agent | AI Chatbot for Business",
    description:
      "AI messaging agent that answers customer questions on messaging channels using your business data, and takes actions in your connected systems.",
  },
  hero: {
    title: "AI messaging agent: a chatbot that knows your business",
    lead: "Give customers an AI-powered way to message your business. The agent answers from your knowledge base and connected systems, and performs actions instead of only replying.",
    support:
      "Instant answers on the channels your customers already use, with a person ready when the conversation needs one.",
  },
  definition: {
    title: "What is an AI messaging agent?",
    paragraphs: [
      "An AI messaging agent is an AI assistant that holds conversations with customers over messaging channels. Unlike a basic chatbot it is connected to your business: it reads your knowledge base, looks up a customer’s record and takes actions such as booking or updating.",
      "It is what many businesses mean when they ask for an AI chatbot, without the scripted menus and dead ends. Customers write in their own words, and the agent answers from your information.",
    ],
    contrastTitle: "Not a scripted chatbot.",
    beforeLabel: "Scripted chatbots",
    afterLabel: "AI messaging agent",
    rows: [
      {
        before: "Offers buttons and fixed conversation paths",
        after: "Understands free-text questions in the customer’s own words",
      },
      {
        before: "Gives the same answer to everyone",
        after: "Answers using the customer’s own record and your data",
      },
      {
        before: "Says “contact us” when it cannot help",
        after: "Performs the action, or hands over with a summary",
      },
      {
        before: "Needs every answer written into a flow",
        after: "Answers from a knowledge base you update in one place",
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
        body: "Replies come from your knowledge base, so answers about prices, policies and processes match what you actually say.",
      },
      {
        icon: ContactIcon,
        title: "Personalise with your CRM",
        body: "It reads the customer’s record, such as their booking, order or plan, so the answer fits their situation.",
      },
      {
        icon: ZapIcon,
        title: "Take actions",
        body: "Book an appointment, update a record or create a task in your connected systems, within the actions you allow.",
      },
      {
        icon: MessagesSquareIcon,
        title: "Keep the whole conversation in mind",
        body: "It follows the thread, remembers what the customer has already said and does not ask twice.",
      },
      {
        icon: BellIcon,
        title: "Send confirmations and reminders",
        body: "As part of a workflow you set up, it confirms bookings and reminds customers so fewer appointments are missed.",
      },
      {
        icon: UserRoundIcon,
        title: "Hand over to a person",
        body: "When a request needs a person it passes the conversation on with a summary, so the customer never starts again.",
      },
    ],
  },
  example: {
    title: "One conversation, start to finish",
    intro: "A customer asks about availability. The agent answers, books and updates your systems without a person stepping in.",
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
    title: "Set up an AI messaging agent in five steps",
    intro: "You decide what it knows, what it can do and when a person takes over.",
    steps: [
      {
        title: "Connect your channels and systems",
        body: "Link the messaging channels your customers use, and the CRM and calendar the agent should work with.",
      },
      {
        title: "Add your knowledge",
        body: "Give it the articles, policies, prices and answers it should use. Update them in one place and every conversation follows.",
      },
      {
        title: "Define what it can do",
        body: "Choose the questions it answers, the actions it may take and the situations that always go to a person.",
      },
      {
        title: "Set the handover rules",
        body: "Decide when the agent passes a conversation on, and who receives it.",
      },
      {
        title: "Test it, then go live",
        body: "Try it with the questions your customers really ask, then switch it on for one channel and widen from there.",
      },
    ],
  },
  control: {
    title: "You decide where the agent stops",
    intro: "It answers what you have taught it and passes on what it should not handle.",
    items: [
      "Choose which channels the agent answers on",
      "Decide which topics it answers and which go straight to a person",
      "Hand a conversation to a team member together with its history",
      "Limit it to the actions you allow in your systems",
      "Keep its answers tied to information you provide",
      "Read every conversation and see what the agent did",
    ],
    closing:
      "The AI can only request an action. The platform checks that this agent is allowed to take it before anything changes in your systems.",
  },
  industries: {
    title: "One agent, configured for how your business works",
    intro: "The same AI messaging agent is set up differently in each business. These are the most common uses.",
    items: [
      {
        slug: IndustrySlugs.realEstate,
        body: "Answer property questions, recommend listings and send details on Viber.",
      },
      {
        slug: IndustrySlugs.sales,
        body: "Answer product questions and move interested prospects towards a meeting.",
      },
      {
        slug: IndustrySlugs.customerSupport,
        body: "Answer common questions and pass difficult ones to the right person.",
      },
      {
        slug: IndustrySlugs.recruitment,
        body: "Answer candidates’ questions and send interview confirmations and reminders.",
      },
      {
        slug: IndustrySlugs.professionalServices,
        body: "Answer routine client questions about appointments and process.",
      },
    ],
  },
  faqs: [
    {
      question: "What is an AI messaging agent?",
      answer:
        "An AI messaging agent is an AI assistant that talks with your customers over messaging channels. It answers questions from your knowledge base and customer data, takes actions in your connected systems and hands over to a person when needed.",
    },
    {
      question: "How is it different from a chatbot?",
      answer:
        "A scripted chatbot follows fixed paths and gives the same answers to everyone. An AI messaging agent understands free-text questions, uses each customer’s own record and your business data, and can act, for example by booking an appointment, instead of only replying.",
    },
    {
      question: "Can an AI chatbot for business use our own data?",
      answer:
        "Yes. You give the agent your knowledge, such as help articles, policies and prices, and connect systems like your CRM. It answers from those sources, and you can update them in one place.",
    },
    {
      question: "Which messaging channels does it work on?",
      answer:
        "It connects to the messaging channels your customers already use, such as Viber. Tell us which channels matter to you and we will confirm support during your demo.",
    },
    {
      question: "What happens when the AI cannot answer?",
      answer:
        "You set the rules. The agent passes the conversation to a person when the customer asks, when it cannot resolve the request, or when the topic is one you have reserved for your team, and it includes a summary so the customer does not repeat themselves.",
    },
    {
      question: "Can it take actions, not just reply?",
      answer:
        "Yes. Connected to your systems, it can book appointments, update records and create tasks. You choose which actions each agent is allowed to take, and every action is recorded.",
    },
    {
      question: "Can it message customers first, for example with reminders?",
      answer:
        "Yes. As part of a workflow you configure, it can send confirmations and reminders, and continue the conversation if the customer replies.",
    },
  ],
  cta: {
    title: "What would your messaging agent answer first?",
    body: "Tell us which questions your customers ask most and we will show you how an AI messaging agent would handle them.",
  },
};

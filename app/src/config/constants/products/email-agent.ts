import {
  CalendarDaysIcon,
  ClipboardCheckIcon,
  ContactIcon,
  InboxIcon,
  MailIcon,
  MailsIcon,
  ScanTextIcon,
  SendIcon,
  WorkflowIcon,
} from "lucide-react";
import { IndustrySlugs } from "@/config/constants/industries";
import { Routes } from "@/routes/routes";
import { ProductSlugs, type ProductContent } from "./product.types";

export const EmailAgentProduct: ProductContent = {
  slug: ProductSlugs.email,
  name: "AI email agent",
  tagline: "Reads incoming email, pulls out the details and turns each message into action.",
  href: Routes.marketing.emailAgent,
  icon: MailIcon,
  orbs: ["peach", "rose"],
  seo: {
    title: "AI Email Agent | AI Email Automation",
    description:
      "An AI email agent that reads incoming email, pulls out the details, updates your systems and starts the right workflow.",
  },
  hero: {
    title: "AI email agent that turns email into action",
    lead: "The email agent reads each message, works out what’s being asked and pulls out the details. Then it updates your systems or starts the right workflow, so your team sees requests that are already understood and routed.",
  },
  definition: {
    title: "What is an AI email agent?",
    body: "An AI email agent reads your incoming email the way a colleague would and acts on what it says. It goes by the meaning of each message, not only keywords, so it can tell a reschedule from a complaint however it’s worded. You may also see it called an AI email assistant.",
    contrastTitle: "How it differs from email rules",
    beforeLabel: "Email rules and filters",
    afterLabel: "AI email agent",
    rows: [
      {
        before: "Match keywords, senders and subject lines",
        after: "Understands what the sender is asking, however it’s worded",
      },
      {
        before: "Sort messages into folders",
        after: "Pulls dates, names and amounts into fields",
      },
      {
        before: "Leave the actual work to a person",
        after: "Updates your CRM and starts the workflow",
      },
    ],
  },
  capabilities: {
    title: "What an AI email agent can do",
    intro: "Each agent handles one kind of inbox and acts only on what you’ve told it to.",
    items: [
      {
        icon: MailsIcon,
        title: "Read whole conversations",
        body: "It reads the full thread, not just the latest message, then works out what the sender wants and how urgent it is: a quote request, a reschedule, a complaint, a document.",
      },
      {
        icon: ScanTextIcon,
        title: "Extract information",
        body: "Names, dates, amounts, references and anything else you care about are pulled out and saved as fields.",
      },
      {
        icon: WorkflowIcon,
        title: "Update systems and start workflows",
        body: "Matching CRM records are updated, and tasks, calendar events or notifications are created based on what the email says. Nobody retypes anything.",
      },
      {
        icon: SendIcon,
        title: "Reply within your rules",
        body: "It sends the confirmations and follow-ups you’ve set up and passes everything else to the right person.",
      },
    ],
  },
  example: {
    title: "One email, start to finish",
    intro: "A reschedule request arrives. Here’s what the agent does before anyone on your team opens it.",
    ledger: {
      title: "Example run: incoming email",
      doneLabel: "Handled in 1 minute",
      description: "Example: an incoming email handled by an AI email agent",
      rows: [
        {
          icon: InboxIcon,
          title: "Email received",
          detail: "“Can we move Friday’s meeting?” from Elena K.",
          time: "16:10",
        },
        {
          icon: MailsIcon,
          title: "Read the conversation",
          detail: "Three earlier messages and the original booking",
          time: "16:10",
        },
        {
          icon: ClipboardCheckIcon,
          title: "Extracted the details",
          detail: "Request: reschedule. New time: Tuesday afternoon. Task: send the updated proposal",
          time: "16:10",
        },
        {
          icon: CalendarDaysIcon,
          title: "Updated the calendar",
          detail: "Meeting moved to Tuesday, 14:00",
          time: "16:11",
        },
        {
          icon: SendIcon,
          title: "Sent a confirmation",
          detail: "New time confirmed with Elena",
          time: "16:11",
        },
        {
          icon: ContactIcon,
          title: "Updated the CRM",
          detail: "Meeting date changed, proposal task assigned to the owner",
          time: "16:11",
        },
      ],
    },
  },
  setup: {
    title: "How to set up an AI email agent",
    intro: "You describe what should happen with your email. The agent does the reading and the routine actions.",
    steps: [
      {
        title: "Connect the mailbox",
        body: "Link the mailbox or shared inbox the agent should read, and choose which folders are in scope.",
      },
      {
        title: "Tell it what to look for and what to do",
        body: "List the kinds of request you get, the details to pull from each and what happens next: update a record, create a task, book an event or notify a person.",
      },
      {
        title: "Try it, then go live",
        body: "Run it on sample emails and check the results. Choose which replies it may send itself, then switch it on for the live inbox.",
      },
    ],
  },
  control: {
    title: "You decide what the agent handles",
    intro: "It works inside the limits you set and passes on everything else.",
    items: [
      "Choose which mailboxes and folders it can read, and keep sensitive senders and topics with your team",
      "Decide which kinds of request it acts on and which it only flags",
      "Pick exactly which systems and actions it can use. Every action is checked against those permissions",
      "See every email it read, what it extracted and what it did",
    ],
  },
  industries: {
    title: "How teams use it",
    intro: "The same agent is set up differently in each business.",
    items: [
      {
        slug: IndustrySlugs.realEstate,
        body: "Picks out viewing and document requests and starts the matching workflow.",
      },
      {
        slug: IndustrySlugs.sales,
        body: "Reads replies, tells interested from not now and triggers the next step.",
      },
      {
        slug: IndustrySlugs.customerSupport,
        body: "Classifies support emails, pulls out order and account details and routes them.",
      },
      {
        slug: IndustrySlugs.recruitment,
        body: "Reads candidate replies, reschedule requests and documents.",
      },
      {
        slug: IndustrySlugs.professionalServices,
        body: "Turns client emails into tasks and chases missing documents.",
      },
    ],
  },
  faqs: [
    {
      question: "Can an AI email agent reply to emails?",
      answer:
        "Only to what you’ve approved, like confirmations and follow-ups. Everything else goes to a person with the details already extracted.",
    },
    {
      question: "Does it work with our CRM?",
      answer:
        "Yes. It finds the matching record and saves what it extracted, and it connects to custom CRMs through their APIs. You choose exactly which CRM actions each agent can use.",
    },
    {
      question: "Which mailboxes does it work with?",
      answer:
        "The agent connects to the mailbox your team already uses. Tell us which email provider you have and we’ll confirm the connection during your demo.",
    },
    {
      question: "Is our email data kept safe?",
      answer:
        "Connection credentials are stored encrypted, and each company’s data is kept separate from every other company’s. Every action is recorded so you can review it.",
    },
  ],
  cta: {
    title: "Which inbox would you hand over first?",
    body: "Tell us which inbox takes the most manual work and we’ll show you how an email agent would handle it.",
  },
};

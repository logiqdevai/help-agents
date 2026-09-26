import {
  CalendarDaysIcon,
  ClipboardCheckIcon,
  ContactIcon,
  DatabaseIcon,
  InboxIcon,
  MailIcon,
  MailsIcon,
  ScanTextIcon,
  SendIcon,
  TagsIcon,
  WorkflowIcon,
} from "lucide-react";
import { IndustrySlugs } from "@/config/constants/industries";
import { Routes } from "@/routes/routes";
import { ProductSlugs, type ProductContent } from "./product.types";

export const EmailAgentProduct: ProductContent = {
  slug: ProductSlugs.email,
  name: "AI email agent",
  tagline: "Reads incoming email, extracts the details and turns each message into action.",
  href: Routes.marketing.emailAgent,
  icon: MailIcon,
  orbs: ["peach", "rose"],
  seo: {
    title: "AI Email Agent | AI Email Automation",
    description:
      "AI email agent that reads incoming email, extracts the details, identifies requests, updates your systems and triggers workflows, so the inbox turns into action.",
  },
  hero: {
    title: "AI email agent that turns email into action",
    lead: "Automated email workflows powered by AI. The email agent reads each message, works out what is being asked, extracts the details and updates your systems or starts the right workflow.",
    support:
      "Stop sorting the inbox by hand. Your team sees requests that are already understood, recorded and routed.",
  },
  definition: {
    title: "What is an AI email agent?",
    paragraphs: [
      "An AI email agent is software that reads your incoming email the way a colleague would, understands what each message is asking and acts on it. It goes beyond filters and rules because it works from the meaning of the message, not only from keywords or senders.",
      "You may also see it called an AI email assistant or email automation AI. What matters is the result: requests recorded, details extracted, systems updated and workflows started.",
    ],
    contrastTitle: "Not a filter. Not a folder rule.",
    beforeLabel: "Email rules and filters",
    afterLabel: "AI email agent",
    rows: [
      {
        before: "Match keywords, senders and subject lines",
        after: "Understands what the sender is asking, however it is worded",
      },
      {
        before: "Sort messages into folders",
        after: "Extracts dates, names, amounts and requests into fields",
      },
      {
        before: "Leave the actual work to a person",
        after: "Updates your CRM and starts the workflow",
      },
      {
        before: "Break when the wording or format changes",
        after: "Handles varied messages and whole conversations",
      },
    ],
  },
  capabilities: {
    title: "What an AI email agent can do",
    intro: "Each agent handles one kind of inbox and acts only on what you have told it to.",
    items: [
      {
        icon: MailsIcon,
        title: "Read whole conversations",
        body: "It reads the full thread, not just the latest message, so it understands what has already been agreed.",
      },
      {
        icon: TagsIcon,
        title: "Identify requests",
        body: "Quote request, reschedule, complaint, document, question. It works out what each message is and how urgent it is.",
      },
      {
        icon: ScanTextIcon,
        title: "Extract information",
        body: "Names, dates, amounts, references and anything else you care about are pulled out and saved as fields.",
      },
      {
        icon: DatabaseIcon,
        title: "Update your systems",
        body: "Matching records in your CRM and other systems are updated, so the data is right without anyone retyping it.",
      },
      {
        icon: WorkflowIcon,
        title: "Trigger workflows",
        body: "Create a task, book a calendar event, notify the owner or start a call, based on what the email says.",
      },
      {
        icon: SendIcon,
        title: "Reply within your rules",
        body: "Send the confirmations and follow-ups you have set up, and pass everything else to the right person.",
      },
    ],
  },
  example: {
    title: "One email, start to finish",
    intro: "A reschedule request arrives in the inbox. Here is what the agent does before anyone on your team opens it.",
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
    title: "Set up an AI email agent in five steps",
    intro: "You describe what you want done with email. The agent handles the reading and the routine actions.",
    steps: [
      {
        title: "Connect the mailbox",
        body: "Link the mailbox or shared inbox the agent should read, and choose which folders are in scope.",
      },
      {
        title: "Tell it what to look for",
        body: "List the kinds of request you receive and the details to extract from each, such as dates, references or amounts.",
      },
      {
        title: "Define the actions",
        body: "For each kind of request, decide what happens: update a record, create a task, book an event or notify a person.",
      },
      {
        title: "Set what it may send",
        body: "Choose which confirmations and follow-ups the agent can send itself, and which messages it should only route.",
      },
      {
        title: "Try it, then go live",
        body: "Run it on sample emails first and check the results. Then switch it on for the live inbox.",
      },
    ],
  },
  control: {
    title: "You decide what the agent handles",
    intro: "It reads and acts inside the boundaries you set, and passes on everything else.",
    items: [
      "Choose which mailboxes and folders the agent can read",
      "Decide which kinds of request it acts on and which it only flags",
      "Pick exactly which systems and actions it can use",
      "Send only the replies you have set up, and route the rest to a person",
      "Keep sensitive senders and topics with your team",
      "See every email it read, what it extracted and what it did",
    ],
    closing:
      "The AI can only request an action. The platform checks that this agent is allowed to take it before anything changes in your systems.",
  },
  industries: {
    title: "One agent, configured for how your business works",
    intro: "The same AI email agent is set up differently in each business. These are the most common uses.",
    items: [
      {
        slug: IndustrySlugs.realEstate,
        body: "Pick out viewing requests and document requests and start the matching workflow.",
      },
      {
        slug: IndustrySlugs.sales,
        body: "Read replies, tell interested from not now, and trigger the next step.",
      },
      {
        slug: IndustrySlugs.customerSupport,
        body: "Classify support emails, extract order and account details and route them.",
      },
      {
        slug: IndustrySlugs.recruitment,
        body: "Read candidate replies, reschedule requests and documents.",
      },
      {
        slug: IndustrySlugs.professionalServices,
        body: "Triage client emails into requests and tasks and chase missing documents.",
      },
    ],
  },
  faqs: [
    {
      question: "What is an AI email agent?",
      answer:
        "An AI email agent reads your incoming email, understands what each message is asking, extracts the important details and takes the actions you allow, such as updating your CRM or starting a workflow. It is also called an AI email assistant.",
    },
    {
      question: "How is AI email automation different from email rules?",
      answer:
        "Rules match keywords, senders and subject lines, so they miss anything worded differently. An AI email agent works from the meaning of the message and the whole conversation, so it can identify a request however it is phrased and pull out the details you need.",
    },
    {
      question: "Can an AI email agent reply to emails?",
      answer:
        "Yes, within the rules you set. You choose which confirmations and follow-ups the agent may send itself, and which messages it should only route to a person.",
    },
    {
      question: "Can it update our CRM from emails?",
      answer:
        "Yes. The agent can find the matching record, save the details it extracted and start follow-up actions. You choose exactly which CRM actions each agent is allowed to use.",
    },
    {
      question: "Which mailboxes does it work with?",
      answer:
        "The agent connects to the mailbox your team already uses. Tell us which email provider you have and we will confirm the connection during your demo.",
    },
    {
      question: "Is our email data kept safe?",
      answer:
        "Connection credentials are stored encrypted, each company’s data is kept separate from every other company’s, and you choose which mailboxes and actions the agent can use. Every action is recorded so you can review it.",
    },
  ],
  cta: {
    title: "What would your email agent read first?",
    body: "Tell us which inbox takes the most manual work and we will show you how an AI email agent would turn it into action.",
  },
};

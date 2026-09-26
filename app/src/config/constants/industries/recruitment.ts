import {
  BellRingIcon,
  CalendarDaysIcon,
  ClipboardCheckIcon,
  ContactIcon,
  DatabaseIcon,
  InboxIcon,
  MailIcon,
  MessageSquareIcon,
  MicIcon,
  PhoneIcon,
} from "lucide-react";
import { Routes } from "@/routes/routes";
import { IndustryChannels, IndustrySlugs, type IndustryContent } from "./industry.types";

export const RecruitmentIndustry: IndustryContent = {
  slug: IndustrySlugs.recruitment,
  name: "Recruitment",
  href: Routes.marketing.industries.recruitment,
  orbs: ["peach", "rose"],
  seo: {
    title: "AI for Recruitment | Recruitment AI Automation",
    description:
      "AI recruitment agents that contact candidates, collect availability and experience, schedule interviews and keep your recruitment system updated.",
  },
  hero: {
    title: "AI recruitment agents that keep candidates moving",
    lead: "Recruitment AI automation that contacts candidates, collects the details you need, schedules interviews and keeps your recruitment system up to date.",
    support: "Built for recruitment agencies and in-house hiring teams that spend more time chasing than talking to people.",
    stack: ["AI voice", "Email", "CRM"],
  },
  ledger: {
    title: "Example run: new applicant",
    doneLabel: "Done in 8 minutes",
    description: "Example: a new applicant handled by an AI recruitment agent",
    rows: [
      {
        icon: InboxIcon,
        title: "New application",
        detail: "Operations coordinator role, CV attached",
        time: "11:30",
      },
      {
        icon: DatabaseIcon,
        title: "Read the recruitment record",
        detail: "Role, pipeline stage and CV found",
        time: "11:30",
      },
      {
        icon: MicIcon,
        title: "Called the candidate",
        detail: "5 min. Availability, notice period and salary range confirmed",
        time: "11:32",
        waveform: true,
      },
      {
        icon: MailIcon,
        title: "Sent the interview details",
        detail: "Location, agenda and who they will meet",
        time: "11:37",
      },
      {
        icon: CalendarDaysIcon,
        title: "Booked an interview: Wednesday, 15:00",
        detail: "Added to the recruiter’s calendar",
        time: "11:37",
      },
      {
        icon: ContactIcon,
        title: "Updated the recruitment system",
        detail: "Moved to interview stage, answers saved to the profile",
        time: "11:38",
      },
    ],
  },
  pains: {
    title: "Where recruiters lose time",
    intro:
      "Recruiting is a people business, but a large share of the day goes on logistics: reaching candidates, asking the same questions and coordinating diaries.",
    items: [
      {
        title: "Chasing candidates who do not answer",
        body: "A first call often means several attempts at different times. Each unanswered call is time that could have gone to a real conversation.",
      },
      {
        title: "The same screening questions, every time",
        body: "Availability, notice period, location, salary expectations. The answers are simple, but collecting them from every applicant is slow.",
      },
      {
        title: "Interview scheduling goes back and forth",
        body: "Matching candidate availability to interviewers takes many messages, and each delay gives the candidate time to accept another offer.",
      },
      {
        title: "Candidates hear nothing",
        body: "When the team is busy, applicants wait for updates and drop out of a process that never told them what happens next.",
      },
      {
        title: "Records are updated late",
        body: "Notes and stages are written after the fact, so the recruitment system is rarely an accurate picture of the pipeline.",
      },
    ],
  },
  capabilities: {
    title: "What AI recruitment agents do",
    intro:
      "They handle the contact and the collection. Your recruiters handle the judgement.",
    items: [
      {
        icon: PhoneIcon,
        channel: IndustryChannels.voice,
        title: "Contact applicants quickly",
        body: "The AI voice agent calls new applicants soon after they apply, follows your calling hours and retries by your rules if they do not answer.",
      },
      {
        icon: ClipboardCheckIcon,
        channel: IndustryChannels.voice,
        title: "Screen with your questions",
        body: "Availability, notice period, location, salary expectations or anything else you ask. The agent collects the answers and saves them to the candidate’s profile.",
      },
      {
        icon: CalendarDaysIcon,
        channel: IndustryChannels.voice,
        title: "Schedule interviews",
        body: "It agrees a time with the candidate, creates the interview in the right calendar and confirms the details.",
      },
      {
        icon: BellRingIcon,
        channel: IndustryChannels.messaging,
        title: "Confirm and remind",
        body: "Confirmations and reminders by message or email help candidates turn up and tell you early when they cannot.",
      },
      {
        icon: MailIcon,
        channel: IndustryChannels.email,
        title: "Read candidate emails",
        body: "The AI email agent reads replies, reschedule requests and documents, extracts the details and starts the matching workflow.",
      },
      {
        icon: ContactIcon,
        channel: IndustryChannels.crm,
        title: "Keep the system updated",
        body: "Stages, notes and answers go into your CRM or recruitment system after every conversation.",
      },
    ],
  },
  workflow: {
    title: "How it works for a recruitment team",
    intro: "Start with one stage of your process, such as first contact after application, and grow from there.",
    steps: [
      {
        title: "Connect your recruitment system and calendars",
        body: "Link the CRM or recruitment system that holds your candidates, and the calendars interviews are booked into.",
      },
      {
        title: "Give it the role information",
        body: "Add job descriptions, company details, location and process, so it can answer a candidate’s first questions.",
      },
      {
        title: "Define the questions and outcomes",
        body: "Choose exactly what the agent asks, what outcomes are possible, and what happens after each one.",
      },
      {
        title: "Test it, then go live",
        body: "Run test calls first. Then set calling hours and retry rules and switch the agent on for real candidates.",
      },
      {
        title: "Review every conversation",
        body: "Recruiters see the transcript, the answers and what was updated, and refine the agent as they learn.",
      },
    ],
  },
  systems: {
    title: "Connects to the tools your recruiters already use",
    intro: "Candidates, roles and calendars stay in your systems. The agent works with them.",
    items: [
      {
        icon: ContactIcon,
        title: "CRM or recruitment system",
        body: "Read candidate records and update stages, notes and answers.",
      },
      {
        icon: CalendarDaysIcon,
        title: "Calendar",
        body: "Book interviews against real availability.",
      },
      {
        icon: MailIcon,
        title: "Email",
        body: "Send interview details and read candidate replies.",
      },
      {
        icon: MessageSquareIcon,
        title: "Messaging",
        body: "Send confirmations and reminders on the channels candidates use.",
      },
      {
        icon: PhoneIcon,
        title: "Phone numbers",
        body: "Call from a provisioned number or your own.",
      },
      {
        icon: DatabaseIcon,
        title: "Databases and custom systems",
        body: "Give the agent access to structured data and your own APIs.",
      },
    ],
  },
  control: {
    title: "Recruiters make the decisions",
    intro: "The AI collects information and schedules. It does not decide who gets hired.",
    items: [
      "Decide exactly what the AI asks candidates, and nothing more",
      "Transfer a live call to a recruiter when the candidate asks for a person",
      "Choose the hours the AI is allowed to call",
      "Limit each agent to the records and actions it needs",
      "Keep hiring decisions with your team",
      "Read every transcript and record change afterwards",
    ],
    closing: "Every action the AI takes is checked against its permissions and recorded, so you always see what happened.",
  },
  faqs: [
    {
      question: "How is AI used in recruitment?",
      answer:
        "AI agents handle the contact and admin around hiring: calling applicants, asking screening questions, scheduling interviews, sending confirmations and updating the recruitment system. Recruiters then spend their time interviewing and advising.",
    },
    {
      question: "Can an AI agent call candidates?",
      answer:
        "Yes. The AI voice agent can call candidates, ask the questions you define, such as availability and notice period, and record the answers. It calls only within the hours you set and retries by your rules if a candidate does not answer.",
    },
    {
      question: "Can AI schedule interviews?",
      answer:
        "Yes. Connected to your calendars, the agent can agree an interview time with the candidate, create the event and send the details by email or message.",
    },
    {
      question: "Does the AI make hiring decisions?",
      answer:
        "No. The agent collects information and handles scheduling. You define what it asks, and your recruiters review the answers and make every hiring decision.",
    },
    {
      question: "Will it work with our recruitment system or CRM?",
      answer:
        "AI agents connect to CRM systems and to custom systems through their APIs. They can read a candidate’s record before a call and update stages, notes and answers afterwards, using only the actions you allow.",
    },
  ],
  cta: {
    title: "What could your recruiters hand off?",
    body: "Tell us how candidates move through your process and we will show you where AI agents can take over the chasing.",
  },
};

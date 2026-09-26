import {
  BellRingIcon,
  CalendarDaysIcon,
  ContactIcon,
  DatabaseIcon,
  InboxIcon,
  MailIcon,
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
      "AI recruitment agents that call candidates, collect availability and experience, book interviews and keep your recruitment system updated.",
  },
  hero: {
    title: "AI recruitment agents that keep candidates moving",
    lead: "Recruitment automation for agencies and in-house hiring teams. The agents contact candidates, collect the details you need, book interviews and keep your recruitment system up to date.",
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
    intro: "Recruiting is a people business, but a big share of the day goes on logistics.",
    items: [
      {
        title: "Chasing candidates who don’t answer",
        body: "A first call often takes several attempts at different times, and each miss is time you could have spent on a real conversation.",
      },
      {
        title: "Interview scheduling goes back and forth",
        body: "Matching candidate availability to interviewers takes many messages, and every delay gives the candidate time to accept another offer.",
      },
      {
        title: "The same screening questions, every time",
        body: "Availability, notice period, salary expectations. The answers are simple, but collecting them from every applicant is slow, and the notes often reach the system late.",
      },
    ],
  },
  capabilities: {
    title: "What AI recruitment agents do",
    intro: "They handle the contact and the collection. Your recruiters handle the judgement.",
    items: [
      {
        icon: PhoneIcon,
        channel: IndustryChannels.voice,
        title: "Call, screen and book interviews",
        body: "The voice agent calls new applicants soon after they apply, asks your screening questions and agrees an interview time. It follows your calling hours, retries by your rules and saves everything to the candidate’s profile.",
      },
      {
        icon: BellRingIcon,
        channel: IndustryChannels.messaging,
        title: "Confirm and remind",
        body: "Confirmations and reminders on Viber or by email help candidates turn up, and tell you early when they can’t.",
      },
      {
        icon: MailIcon,
        channel: IndustryChannels.email,
        title: "Read candidate emails",
        body: "The email agent reads replies, reschedule requests and documents, pulls out the details and starts the matching workflow.",
      },
      {
        icon: ContactIcon,
        channel: IndustryChannels.crm,
        title: "Keep the system updated",
        body: "Stages, notes and answers go into your CRM or recruitment system after every conversation, so the record matches what happened.",
      },
    ],
  },
  workflow: {
    title: "How it works for a recruitment team",
    intro: "Start with one stage, such as first contact after an application, and grow from there.",
    steps: [
      {
        title: "Connect your tools",
        body: "Link your CRM or recruitment system, your calendars and your email. Add Viber and a phone number too, either one provisioned for you or your own.",
      },
      {
        title: "Tell it what to ask",
        body: "Add job descriptions and company details so it can answer a candidate’s first questions. Then choose exactly what it asks, which outcomes are possible and what happens after each one.",
      },
      {
        title: "Test it, then go live",
        body: "Run test calls first, then set calling hours and retry rules and switch it on. Your recruiters can read every transcript and see what was updated, so you can refine the agent as you learn.",
      },
    ],
  },
  control: {
    title: "Recruiters make the decisions",
    intro: "The AI collects information and schedules. It doesn’t decide who gets hired.",
    items: [
      "You decide exactly what it asks candidates, and nothing more",
      "It calls only in the hours you set, and transfers a live call to a recruiter when a candidate asks for a person",
      "Each agent is limited to the records and actions it needs",
      "Every action is checked against those permissions and logged, so you can read any transcript or record change afterwards",
    ],
  },
  faqs: [
    {
      question: "How is AI used in recruitment?",
      answer:
        "AI agents handle the contact and admin around hiring: calling applicants, asking screening questions, scheduling interviews, sending reminders and updating your recruitment system. Recruiters then spend their time interviewing and advising.",
    },
    {
      question: "Can an AI agent call candidates?",
      answer:
        "Yes. The voice agent asks the questions you define, such as availability and notice period, and records the answers. It only calls in the hours you set and retries by your rules if a candidate doesn’t answer. Connected to your calendars, it can also agree an interview time and send the details by email or on Viber.",
    },
    {
      question: "Does the AI make hiring decisions?",
      answer:
        "No. The agent collects information and handles scheduling. You define what it asks, and your recruiters review the answers and make every hiring decision.",
    },
    {
      question: "Will it work with our recruitment system or CRM?",
      answer:
        "Yes. Agents connect to CRM systems, and to custom systems through their APIs. They read a candidate’s record before a call and update stages, notes and answers afterwards, using only the actions you allow.",
    },
  ],
  cta: {
    title: "What could your recruiters hand off?",
    body: "Tell us how candidates move through your process today, and we’ll show you where an agent could take over the chasing.",
  },
};

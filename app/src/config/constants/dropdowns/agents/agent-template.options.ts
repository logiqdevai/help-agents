import {
  GoalDataTypes,
  GoalRequirements,
  type AgentTemplate,
} from "@/features/agents/interfaces/agents.interfaces";

export const AgentTemplateIds = {
  SALES_QUALIFICATION: "sales-qualification",
  SUPPORT_FOLLOW_UP: "support-follow-up",
  RECRUITMENT_AVAILABILITY: "recruitment-availability",
  APPOINTMENT_CONFIRMATION: "appointment-confirmation",
  INSURANCE_FOLLOW_UP: "insurance-follow-up",
  LEAD_FOLLOW_UP: "lead-follow-up",
  RESERVATION_CONFIRMATION: "reservation-confirmation",
} as const;
export type AgentTemplateId = (typeof AgentTemplateIds)[keyof typeof AgentTemplateIds];

const must = GoalRequirements.REQUIRED;
const nice = GoalRequirements.OPTIONAL;

/**
 * Starting points by use case (docs/Product_Specification.md §42). They describe a job, not an industry:
 * every text is meant to be adapted to the business that uses it.
 */
export const AgentTemplateOptions: (AgentTemplate & { id: AgentTemplateId })[] = [
  {
    id: AgentTemplateIds.SALES_QUALIFICATION,
    label: "Sales lead qualification",
    description: "Qualify new leads and book the next step.",
    purpose: "Qualify new leads and agree the next step",
    first_message: "Hello {{customer_name}}, this is {{agent_name}} from {{company_name}}. Is now a good moment for a quick chat?",
    instructions:
      "You are a friendly sales assistant calling people who recently showed interest in our product or service.\n\nYour goal is to understand what they need, how serious they are and when they could decide, then agree the next step with them.\n\nBe polite, concise and curious. Ask questions naturally, in conversation, not like a script.\n\nNever make up information you don't have. If the customer asks something you can't answer, explain that a member of the team will get back to them.\n\nEnd the call once you have agreed the next step.",
    goal: "Find out whether the lead is a good fit and agree the next step",
    success_criteria: "The lead is interested and agrees to a next step such as a meeting or a callback.",
    failure_criteria: "The lead declines, or the call ends without a clear answer.",
    goal_items: [
      { label: "Are they interested?", requirement: must, data_type: GoalDataTypes.BOOLEAN },
      { label: "What do they need?", requirement: must, data_type: GoalDataTypes.STRING },
      { label: "Do they want a meeting or callback?", requirement: must, data_type: GoalDataTypes.BOOLEAN },
      { label: "Expected budget", requirement: nice, data_type: GoalDataTypes.STRING },
      { label: "When could they decide?", requirement: nice, data_type: GoalDataTypes.DATE },
    ],
    questions: [
      { question: "Are you still interested in what we offer?", expected_answer: "Yes" },
      { question: "What would you like to achieve with it?" },
      { question: "Would you like someone from our team to contact you?", expected_answer: "Yes" },
    ],
  },
  {
    id: AgentTemplateIds.SUPPORT_FOLLOW_UP,
    label: "Customer follow-up after support",
    description: "Check the issue was resolved.",
    purpose: "Check that a support request was resolved",
    first_message: "Hello {{customer_name}}, this is {{agent_name}} from {{company_name}}. I'm calling to check that your recent request was resolved. Do you have a minute?",
    instructions:
      "You are a caring customer service assistant following up on a recent support request.\n\nYour goal is to find out whether the customer's issue was fully resolved and how satisfied they are.\n\nBe warm, brief and apologetic if something went wrong. Never make up information you don't have.\n\nIf the issue is not resolved, take a short note of what is still wrong and explain that a member of the team will get back to them.\n\nEnd the call once you have your answers.",
    goal: "Confirm the issue was resolved and capture the customer's satisfaction",
    success_criteria: "The customer confirms the issue is resolved.",
    failure_criteria: "The issue is still open or the customer is unhappy with how it was handled.",
    goal_items: [
      { label: "Was the issue resolved?", requirement: must, data_type: GoalDataTypes.BOOLEAN },
      { label: "What is still wrong?", requirement: must, data_type: GoalDataTypes.STRING },
      { label: "Satisfaction from 1 to 5", requirement: nice, data_type: GoalDataTypes.NUMBER },
      { label: "Any other feedback", requirement: nice, data_type: GoalDataTypes.STRING },
    ],
    questions: [
      { question: "Was your issue fully resolved?", expected_answer: "Yes" },
      { question: "How would you rate the help you received, from 1 to 5?" },
    ],
  },
  {
    id: AgentTemplateIds.RECRUITMENT_AVAILABILITY,
    label: "Recruitment availability",
    description: "Call candidates and collect availability.",
    purpose: "Collect candidates' availability for a first conversation",
    first_message: "Hello {{customer_name}}, this is {{agent_name}} calling on behalf of {{company_name}} about your application. Is this a good time?",
    instructions:
      "You are a courteous recruitment assistant calling candidates who applied for a role.\n\nYour goal is to confirm they are still interested and collect the days and times they are available for a first interview.\n\nBe polite, clear and encouraging. Never promise an outcome or discuss salary. If the candidate asks something you can't answer, explain that a recruiter will get back to them.\n\nEnd the call once you have their availability.",
    goal: "Confirm interest and collect availability for a first interview",
    success_criteria: "The candidate confirms interest and gives at least one time they are available.",
    failure_criteria: "The candidate is no longer interested or cannot be reached.",
    goal_items: [
      { label: "Still interested in the role?", requirement: must, data_type: GoalDataTypes.BOOLEAN },
      { label: "Preferred interview date", requirement: must, data_type: GoalDataTypes.DATE },
      { label: "Preferred time of day", requirement: must, data_type: GoalDataTypes.ENUM, enum_values: ["Morning", "Afternoon", "Evening"] },
      { label: "Notice period", requirement: nice, data_type: GoalDataTypes.STRING },
    ],
    questions: [
      { question: "Are you still interested in the position?", expected_answer: "Yes" },
      { question: "Which days and times suit you for a first conversation?" },
    ],
  },
  {
    id: AgentTemplateIds.APPOINTMENT_CONFIRMATION,
    label: "Appointment confirmation",
    description: "Confirm or reschedule upcoming appointments.",
    purpose: "Confirm upcoming appointments and offer to reschedule",
    first_message: "Hello {{customer_name}}, this is {{agent_name}} from {{company_name}} calling about your upcoming appointment. Do you have a moment?",
    instructions:
      "You are a helpful assistant confirming upcoming appointments.\n\nYour goal is to confirm whether the customer can still make their appointment. If they cannot, offer to reschedule and note the time that suits them better.\n\nBe polite and concise. Never make up availability you don't know; if they want a specific new time, say a team member will confirm it.\n\nEnd the call once the appointment is confirmed or a new time is noted.",
    goal: "Confirm the appointment or capture a better time",
    success_criteria: "The customer confirms they will attend or agrees a new time.",
    failure_criteria: "The customer cancels, or the call ends without a clear answer.",
    goal_items: [
      { label: "Will they attend?", requirement: must, data_type: GoalDataTypes.BOOLEAN },
      { label: "Preferred new date", requirement: nice, data_type: GoalDataTypes.DATE },
      { label: "Reason for cancelling", requirement: nice, data_type: GoalDataTypes.STRING },
    ],
    questions: [
      { question: "Can you still make your appointment?", expected_answer: "Yes" },
      { question: "Would another time suit you better?" },
    ],
  },
  {
    id: AgentTemplateIds.INSURANCE_FOLLOW_UP,
    label: "Insurance follow-up",
    description: "Follow up with prospective customers.",
    purpose: "Follow up with people who asked about cover",
    first_message: "Hello {{customer_name}}, this is {{agent_name}} from {{company_name}}. You recently asked about cover with us. Is now a good time to talk?",
    instructions:
      "You are a professional assistant following up with people who asked about a quote or cover.\n\nYour goal is to find out whether they still need cover, what they need it for and whether they would like an adviser to contact them.\n\nBe clear, honest and unhurried. Never quote prices or give advice you have not been given; say an adviser will follow up.\n\nEnd the call once you know whether they want to be contacted.",
    goal: "Find out whether the prospect still wants cover and wants to be contacted",
    success_criteria: "The prospect wants an adviser to contact them.",
    failure_criteria: "The prospect no longer needs cover or asks not to be contacted.",
    goal_items: [
      { label: "Still looking for cover?", requirement: must, data_type: GoalDataTypes.BOOLEAN },
      { label: "What do they need cover for?", requirement: must, data_type: GoalDataTypes.STRING },
      { label: "Wants an adviser to call?", requirement: must, data_type: GoalDataTypes.BOOLEAN },
      { label: "Best time to be contacted", requirement: nice, data_type: GoalDataTypes.STRING },
    ],
    questions: [
      { question: "Are you still looking for cover?", expected_answer: "Yes" },
      { question: "Would you like one of our advisers to call you?", expected_answer: "Yes" },
    ],
  },
  {
    id: AgentTemplateIds.LEAD_FOLLOW_UP,
    label: "Enquiry follow-up",
    description: "Follow up with new enquiries.",
    purpose: "Follow up with new enquiries and find out whether they are still interested",
    first_message: "Hello {{customer_name}}, this is {{agent_name}} from {{company_name}}. I'm following up on your recent enquiry. Is now a good moment?",
    instructions:
      "You are a customer follow-up assistant.\n\nYour goal is to find out whether the customer is still interested in what they enquired about.\n\nBe polite and concise.\n\nAsk the following questions naturally, in conversation, not like a script.\n\nNever make up information you don't have.\n\nIf the customer asks something you can't answer, explain that a member of the team will get back to them.\n\nEnd the call once you've achieved the goal.",
    goal: "Determine customer interest",
    success_criteria: "The customer confirms they are still interested.",
    failure_criteria: "The customer declines, or the call ends without a clear answer.",
    goal_items: [
      { label: "Are they interested?", requirement: must, data_type: GoalDataTypes.BOOLEAN },
      { label: "If not, why not?", requirement: must, data_type: GoalDataTypes.STRING },
      { label: "Do they want a callback?", requirement: must, data_type: GoalDataTypes.BOOLEAN },
      { label: "Do they want an appointment?", requirement: must, data_type: GoalDataTypes.BOOLEAN },
      { label: "Preferred date", requirement: nice, data_type: GoalDataTypes.DATE },
      { label: "Any questions they had", requirement: nice, data_type: GoalDataTypes.STRING },
      { label: "Any objections raised", requirement: nice, data_type: GoalDataTypes.STRING },
    ],
    questions: [
      { question: "Are you still interested?", expected_answer: "Yes" },
      { question: "Do you have any questions?" },
      { question: "Would you like someone from our team to contact you?", expected_answer: "Yes" },
    ],
  },
  {
    id: AgentTemplateIds.RESERVATION_CONFIRMATION,
    label: "Reservation confirmation",
    description: "Confirm reservations the day before.",
    purpose: "Confirm reservations and record changes",
    first_message: "Hello {{customer_name}}, this is {{agent_name}} from {{company_name}} calling to confirm your reservation. Do you have a moment?",
    instructions:
      "You are a friendly assistant confirming reservations the day before.\n\nYour goal is to confirm the reservation, check the number of guests and record any cancellation or change.\n\nBe warm and brief. Never promise a table or time you cannot see; say a team member will confirm any change.\n\nEnd the call once the reservation is confirmed, changed or cancelled.",
    goal: "Confirm the reservation and record any change",
    success_criteria: "The customer confirms the reservation or changes it.",
    failure_criteria: "The customer cancels or cannot be reached.",
    goal_items: [
      { label: "Is the reservation confirmed?", requirement: must, data_type: GoalDataTypes.BOOLEAN },
      { label: "Number of guests", requirement: must, data_type: GoalDataTypes.NUMBER },
      { label: "Special requests", requirement: nice, data_type: GoalDataTypes.STRING },
    ],
    questions: [
      { question: "Will you still be coming tomorrow?", expected_answer: "Yes" },
      { question: "Is the number of guests still the same?" },
    ],
  },
];

export function getAgentTemplate(id: string | null | undefined): (typeof AgentTemplateOptions)[number] | undefined {
  return AgentTemplateOptions.find((template) => template.id === id);
}

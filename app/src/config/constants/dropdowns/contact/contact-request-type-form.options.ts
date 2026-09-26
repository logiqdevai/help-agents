import { ContactRequestTypes, type ContactRequestType } from "@/features/contact/interfaces/contact.interfaces";

export const ContactRequestTypeFormOptions: { id: ContactRequestType; label: string }[] = [
  { id: ContactRequestTypes.demo, label: "Book a demo" },
  { id: ContactRequestTypes.question, label: "Ask a question" },
];

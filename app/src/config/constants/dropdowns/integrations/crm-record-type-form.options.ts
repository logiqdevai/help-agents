import { CrmRecordTypes, type CrmRecordType } from "@/features/contacts/interfaces/contacts.interfaces";

export const CrmRecordTypeFormOptions: { id: CrmRecordType; label: string }[] = [
  { id: CrmRecordTypes.CONTACT, label: "Contact" },
  { id: CrmRecordTypes.LEAD, label: "Lead" },
  { id: CrmRecordTypes.COMPANY, label: "Company" },
  { id: CrmRecordTypes.DEAL, label: "Deal" },
  { id: CrmRecordTypes.OTHER, label: "Other" },
];

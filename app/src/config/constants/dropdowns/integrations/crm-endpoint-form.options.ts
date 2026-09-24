import {
  CrmEndpointKeys,
  type CrmEndpointKey,
} from "@/features/integrations/interfaces/integrations.interfaces";

export const CrmEndpointFormOptions: {
  id: CrmEndpointKey;
  label: string;
  description: string;
  placeholders: string;
}[] = [
  {
    id: CrmEndpointKeys.TEST,
    label: "Test connection",
    description: "Called to check that the address and credentials work. Defaults to GET /.",
    placeholders: "none",
  },
  {
    id: CrmEndpointKeys.LOOKUP,
    label: "Look up a record",
    description:
      "Finds a person by phone, email or id. Add result_path, id_path, name_path, phone_path and email_path to read the response.",
    placeholders: "{phone} {email} {external_id} {record_type}",
  },
  {
    id: CrmEndpointKeys.UPDATE,
    label: "Update a record",
    description: "Writes the mapped fields (outcome, summary, interest…) back to the record.",
    placeholders: "{external_id} {record_type} {properties}",
  },
  {
    id: CrmEndpointKeys.NOTE,
    label: "Add a note",
    description: "Attaches the call summary to the record history.",
    placeholders: "{external_id} {record_type} {note}",
  },
  {
    id: CrmEndpointKeys.TASK,
    label: "Create a task",
    description: "Creates a follow-up task for your team.",
    placeholders: "{external_id} {record_type} {title} {due_at} {notes}",
  },
  {
    id: CrmEndpointKeys.FIELDS,
    label: "List fields",
    description:
      "Returns the record fields your CRM offers, for the field-mapping screen. Add result_path, name_path, label_path and type_path.",
    placeholders: "{record_type}",
  },
];

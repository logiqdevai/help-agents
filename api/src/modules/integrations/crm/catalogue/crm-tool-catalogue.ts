import { IntegrationProvider } from 'generated/prisma';

export interface CatalogueTool {
  provider: IntegrationProvider;
  key: string;
  name: string;
  description: string;
  category: string;
  input_schema: Record<string, any>;
}

type Props = Record<string, { type: string; description: string; enum?: string[] }>;

function tool(
  provider: IntegrationProvider,
  key: string,
  name: string,
  category: string,
  description: string,
  properties: Props,
  required: string[] = [],
): CatalogueTool {
  return {
    provider,
    key,
    name,
    description,
    category,
    input_schema: { type: 'object', properties, required },
  };
}

const str = (description: string) => ({ type: 'string', description });
const obj = (description: string) => ({ type: 'object', description });

const H = IntegrationProvider.HUBSPOT;
const S = IntegrationProvider.SALESFORCE;
const P = IntegrationProvider.PIPEDRIVE;
const Z = IntegrationProvider.ZOHO;

export const CRM_TOOL_CATALOGUE: CatalogueTool[] = [
  // HubSpot
  tool(H, 'hubspot_lookup_contact', 'Look up a contact', 'lookup', 'Find a contact by phone number, email or contact id.', {
    phone: str('Phone number in E.164 format'),
    email: str('Email address'),
    contact_id: str('HubSpot contact id'),
  }),
  tool(H, 'hubspot_lookup_deal', 'Look up a deal', 'lookup', 'Find a deal by deal id, by the contact it belongs to, or by name.', {
    deal_id: str('Deal id'),
    contact_id: str('Contact id whose deals to list'),
    query: str('Text to search in deal names'),
  }),
  tool(H, 'hubspot_update_contact', 'Update a contact', 'update', 'Update properties of a contact.', {
    contact_id: str('Contact id'),
    properties: obj('Property names and their new values'),
  }, ['contact_id', 'properties']),
  tool(H, 'hubspot_update_deal_stage', 'Update a deal stage', 'update', 'Move a deal to another pipeline stage.', {
    deal_id: str('Deal id'),
    stage: str('Internal id of the target deal stage'),
  }, ['deal_id', 'stage']),
  tool(H, 'hubspot_add_note_to_contact', 'Add a note to a contact', 'notes', 'Attach a note to a contact.', {
    contact_id: str('Contact id'),
    note: str('Note text'),
  }, ['contact_id', 'note']),
  tool(H, 'hubspot_log_activity', 'Log an activity', 'activity', 'Log a call activity on a contact.', {
    contact_id: str('Contact id'),
    subject: str('Short title of the activity'),
    body: str('What happened'),
  }, ['contact_id', 'body']),
  tool(H, 'hubspot_update_custom_property', 'Update a custom property', 'update', 'Set a single (custom) property of a contact.', {
    contact_id: str('Contact id'),
    property: str('Internal property name'),
    value: { type: 'string', description: 'New value' },
  }, ['contact_id', 'property', 'value']),
  tool(H, 'hubspot_create_task', 'Create a task', 'tasks', 'Create a follow-up task for a contact.', {
    contact_id: str('Contact id'),
    title: str('Task title'),
    due_at: str('Due date/time (ISO 8601)'),
    notes: str('Task details'),
  }, ['contact_id', 'title']),

  // Salesforce
  tool(S, 'salesforce_lookup_lead', 'Look up a lead', 'lookup', 'Find a lead (or contact) by phone number, email or id.', {
    phone: str('Phone number in E.164 format'),
    email: str('Email address'),
    lead_id: str('Salesforce lead id'),
  }),
  tool(S, 'salesforce_lookup_opportunity', 'Look up an opportunity', 'lookup', 'Find an opportunity by id or name.', {
    opportunity_id: str('Opportunity id'),
    name: str('Text to search in opportunity names'),
  }),
  tool(S, 'salesforce_update_lead', 'Update a lead', 'update', 'Update fields of a lead.', {
    lead_id: str('Lead id'),
    fields: obj('API field names and their new values'),
  }, ['lead_id', 'fields']),
  tool(S, 'salesforce_update_opportunity_stage', 'Update an opportunity stage', 'update', 'Move an opportunity to another stage.', {
    opportunity_id: str('Opportunity id'),
    stage: str('Target stage name'),
  }, ['opportunity_id', 'stage']),
  tool(S, 'salesforce_add_note', 'Add a note', 'notes', 'Attach a note to a lead, contact or opportunity.', {
    record_id: str('Id of the record to attach the note to'),
    note: str('Note text'),
  }, ['record_id', 'note']),
  tool(S, 'salesforce_log_call', 'Log a call', 'activity', 'Log a completed call on a record.', {
    record_id: str('Id of the lead, contact or opportunity'),
    subject: str('Short title'),
    description: str('What happened'),
    duration_seconds: { type: 'number', description: 'Call duration in seconds' },
  }, ['record_id', 'subject']),
  tool(S, 'salesforce_update_custom_field', 'Update a custom field', 'update', 'Set a single (custom) field of a record.', {
    record_id: str('Record id'),
    field: str('API name of the field'),
    value: { type: 'string', description: 'New value' },
  }, ['record_id', 'field', 'value']),
  tool(S, 'salesforce_create_follow_up_task', 'Create a follow-up task', 'tasks', 'Create a follow-up task on a record.', {
    record_id: str('Record id'),
    subject: str('Task subject'),
    due_at: str('Due date (ISO 8601)'),
    description: str('Task details'),
  }, ['record_id', 'subject']),

  // Pipedrive
  tool(P, 'pipedrive_lookup_person', 'Look up a person', 'lookup', 'Find a person by phone number, email or id.', {
    phone: str('Phone number in E.164 format'),
    email: str('Email address'),
    person_id: str('Person id'),
  }),
  tool(P, 'pipedrive_lookup_deal', 'Look up a deal', 'lookup', 'Find a deal by id, by person, or by title.', {
    deal_id: str('Deal id'),
    person_id: str('Person id whose deals to list'),
    title: str('Text to search in deal titles'),
  }),
  tool(P, 'pipedrive_update_person', 'Update a person', 'update', 'Update fields of a person.', {
    person_id: str('Person id'),
    fields: obj('Field keys and their new values'),
  }, ['person_id', 'fields']),
  tool(P, 'pipedrive_update_deal_stage', 'Update a deal stage', 'update', 'Move a deal to another stage.', {
    deal_id: str('Deal id'),
    stage_id: { type: 'number', description: 'Id of the target stage' },
  }, ['deal_id', 'stage_id']),
  tool(P, 'pipedrive_add_note', 'Add a note', 'notes', 'Attach a note to a person or a deal.', {
    person_id: str('Person id'),
    deal_id: str('Deal id (when not attaching to a person)'),
    content: str('Note text'),
  }, ['content']),
  tool(P, 'pipedrive_log_activity', 'Log an activity', 'activity', 'Log a finished activity (e.g. a call) for a person.', {
    person_id: str('Person id'),
    subject: str('Activity subject'),
    type: str('Activity type key, e.g. call'),
    note: str('What happened'),
  }, ['person_id', 'subject']),
  tool(P, 'pipedrive_update_custom_field', 'Update a custom field', 'update', 'Set a single (custom) field of a person.', {
    person_id: str('Person id'),
    field_key: str('Field key'),
    value: { type: 'string', description: 'New value' },
  }, ['person_id', 'field_key', 'value']),
  tool(P, 'pipedrive_create_task', 'Create a task', 'tasks', 'Create a follow-up task for a person.', {
    person_id: str('Person id'),
    subject: str('Task subject'),
    due_date: str('Due date (ISO 8601)'),
    note: str('Task details'),
  }, ['person_id', 'subject']),

  // Zoho CRM
  tool(Z, 'zoho_lookup_lead', 'Look up a lead', 'lookup', 'Find a lead (or contact) by phone number, email or id.', {
    phone: str('Phone number in E.164 format'),
    email: str('Email address'),
    lead_id: str('Lead id'),
  }),
  tool(Z, 'zoho_lookup_deal', 'Look up a deal', 'lookup', 'Find a deal by id or name.', {
    deal_id: str('Deal id'),
    name: str('Text to search in deal names'),
  }),
  tool(Z, 'zoho_update_lead', 'Update a lead', 'update', 'Update fields of a lead.', {
    lead_id: str('Lead id'),
    fields: obj('API field names and their new values'),
  }, ['lead_id', 'fields']),
  tool(Z, 'zoho_update_deal_stage', 'Update a deal stage', 'update', 'Move a deal to another stage.', {
    deal_id: str('Deal id'),
    stage: str('Target stage name'),
  }, ['deal_id', 'stage']),
  tool(Z, 'zoho_add_note', 'Add a note', 'notes', 'Attach a note to a record.', {
    record_id: str('Record id'),
    module: { type: 'string', description: 'Module of the record', enum: ['Leads', 'Contacts', 'Accounts', 'Deals'] },
    content: str('Note text'),
  }, ['record_id', 'content']),
  tool(Z, 'zoho_log_call', 'Log a call', 'activity', 'Log a completed call on a record.', {
    record_id: str('Record id'),
    module: { type: 'string', description: 'Module of the record', enum: ['Leads', 'Contacts'] },
    subject: str('Short title'),
    description: str('What happened'),
    duration_seconds: { type: 'number', description: 'Call duration in seconds' },
  }, ['record_id', 'subject']),
  tool(Z, 'zoho_update_custom_field', 'Update a custom field', 'update', 'Set a single (custom) field of a record.', {
    record_id: str('Record id'),
    module: { type: 'string', description: 'Module of the record', enum: ['Leads', 'Contacts', 'Accounts', 'Deals'] },
    field: str('API name of the field'),
    value: { type: 'string', description: 'New value' },
  }, ['record_id', 'field', 'value']),
  tool(Z, 'zoho_create_task', 'Create a follow-up task', 'tasks', 'Create a follow-up task on a record.', {
    record_id: str('Record id'),
    module: { type: 'string', description: 'Module of the record', enum: ['Leads', 'Contacts', 'Accounts', 'Deals'] },
    subject: str('Task subject'),
    due_date: str('Due date (ISO 8601)'),
    description: str('Task details'),
  }, ['record_id', 'subject']),
];

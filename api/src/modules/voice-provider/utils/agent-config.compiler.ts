import { createHash } from 'crypto';
import Retell from 'retell-sdk';
import { GoalDataType, GoalRequirement, Prisma } from 'generated/prisma';
import {
  BASE_PERSONALIZATION_VARIABLES,
  GOAL_FIELD_PREFIX,
  personalizationVariableKey,
} from '@/shared/constants/crm-fields';

export const AGENT_SYNC_INCLUDE = {
  company: { select: { id: true, name: true, timezone: true } },
  goal_items: { orderBy: { position: 'asc' } },
  questions: { orderBy: { position: 'asc' } },
  outcomes: { orderBy: { position: 'asc' } },
  transfer_outcomes: { include: { outcome: true } },
  crm_tools: { include: { crm_tool: true } },
  knowledge_sources: {
    include: {
      source: {
        include: { versions: { select: { version: true, external_knowledge_base_id: true } } },
      },
    },
  },
} as const satisfies Prisma.AgentInclude;

export type AgentForSync = Prisma.AgentGetPayload<{ include: typeof AGENT_SYNC_INCLUDE }>;

export interface PersonalizationVariable {
  key: string;
  label: string;
}

export interface CompileInput {
  agent: AgentForSync;
  personalization: PersonalizationVariable[];
  webhookUrls: { events: string; tools: string };
}

export interface CompiledAgentConfig {
  llm: Retell.LlmCreateParams;
  agent: Omit<Retell.AgentCreateParams, 'response_engine' | 'voice_id'>;
}

const LANGUAGE_LOCALES: Record<string, string> = {
  en: 'en-US', de: 'de-DE', es: 'es-ES', hi: 'hi-IN', fr: 'fr-FR', ja: 'ja-JP', pt: 'pt-PT',
  zh: 'zh-CN', ru: 'ru-RU', it: 'it-IT', ko: 'ko-KR', nl: 'nl-NL', pl: 'pl-PL', tr: 'tr-TR',
  vi: 'vi-VN', ro: 'ro-RO', bg: 'bg-BG', ca: 'ca-ES', th: 'th-TH', da: 'da-DK', fi: 'fi-FI',
  el: 'el-GR', hu: 'hu-HU', id: 'id-ID', no: 'no-NO', sk: 'sk-SK', sv: 'sv-SE', lt: 'lt-LT',
  lv: 'lv-LV', cs: 'cs-CZ', ms: 'ms-MY', af: 'af-ZA', ar: 'ar-SA', he: 'he-IL', hr: 'hr-HR',
  uk: 'uk-UA', sl: 'sl-SI', sr: 'sr-RS',
};

const KNOWN_LOCALES = new Set(Object.values(LANGUAGE_LOCALES).concat(['en-IN', 'en-GB', 'en-AU', 'en-NZ', 'es-419', 'fr-CA', 'pt-BR', 'nl-BE', 'multi']));

export function toProviderLanguage(language: string | null | undefined): string {
  const raw = (language || 'en').trim();
  if (KNOWN_LOCALES.has(raw)) return raw;
  const base = raw.split(/[-_]/)[0].toLowerCase();
  return LANGUAGE_LOCALES[base] ?? 'multi';
}

function languageName(language: string | null | undefined): string {
  const code = (language || 'en').split(/[-_]/)[0];
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code;
  } catch {
    return code;
  }
}

function humanize(field: string): string {
  return field.replace(GOAL_FIELD_PREFIX, '').replace(/[_.]+/g, ' ').trim();
}

export function toPersonalizationVariables(
  mappings: Array<{ internal_field: string; agent_uuid: string | null }>,
  agentUuid: string,
): PersonalizationVariable[] {
  const byField = new Map<string, { agent_uuid: string | null }>();
  for (const m of mappings) {
    const existing = byField.get(m.internal_field);
    if (!existing || (existing.agent_uuid === null && m.agent_uuid === agentUuid)) {
      byField.set(m.internal_field, m);
    }
  }
  const base = new Set<string>(BASE_PERSONALIZATION_VARIABLES);
  return [...byField.keys()]
    .map((field) => ({ key: personalizationVariableKey(field), label: humanize(field) }))
    .filter((v) => !base.has(v.key));
}

function goalLine(item: AgentForSync['goal_items'][number]): string {
  const type =
    item.data_type === GoalDataType.ENUM && item.enum_values.length
      ? `one of: ${item.enum_values.join(', ')}`
      : item.data_type.toLowerCase();
  return `- ${item.label}${item.description ? ` — ${item.description}` : ''} (${type})`;
}

export function buildPrompt(input: CompileInput): string {
  const { agent, personalization } = input;
  const sections: string[] = [];

  if (agent.instructions?.trim()) sections.push(agent.instructions.trim());

  const context = [
    '## Call context',
    'You are {{agent_name}}, speaking on behalf of {{company_name}}. You are talking to {{customer_name}}.',
    `Conduct the conversation in ${languageName(agent.language)}.`,
  ];
  if (personalization.length) {
    context.push('What we already know about this person (do not ask for it again; ignore any value that is "unknown"):');
    for (const v of personalization) context.push(`- ${v.label}: {{${v.key}}}`);
  }
  sections.push(context.join('\n'));

  if (agent.goal?.trim() || agent.goal_items.length) {
    const lines = ['## Goal'];
    if (agent.goal?.trim()) lines.push(agent.goal.trim());
    const must = agent.goal_items.filter((g) => g.requirement === GoalRequirement.REQUIRED);
    const nice = agent.goal_items.filter((g) => g.requirement === GoalRequirement.OPTIONAL);
    if (must.length) lines.push('You must find out:', ...must.map(goalLine));
    if (nice.length) lines.push('Nice to know if it comes up naturally:', ...nice.map(goalLine));
    sections.push(lines.join('\n'));
  }

  if (agent.questions.length) {
    const lines = [
      '## Questions',
      'Work these into the conversation naturally, the way a person would. Do not read them like a script or in a rigid order.',
    ];
    agent.questions.forEach((q, i) => {
      const flags = [q.is_required ? 'must be answered' : 'optional'];
      if (q.expected_answer) flags.push(`desired answer: ${q.expected_answer}`);
      lines.push(`${i + 1}. ${q.question} (${flags.join('; ')})`);
    });
    sections.push(lines.join('\n'));
  }

  if (agent.success_criteria?.trim() || agent.failure_criteria?.trim()) {
    const lines = ['## What counts as success'];
    if (agent.success_criteria?.trim()) lines.push(`Successful call: ${agent.success_criteria.trim()}`);
    if (agent.failure_criteria?.trim()) lines.push(`Unsuccessful call: ${agent.failure_criteria.trim()}`);
    sections.push(lines.join('\n'));
  }

  if (agent.outcomes.length) {
    sections.push(
      [
        '## Possible call outcomes',
        'Every call ends in exactly one of these outcomes:',
        ...agent.outcomes.map((o) => `- ${o.label}${o.description ? `: ${o.description}` : ''}`),
      ].join('\n'),
    );
  }

  if (agent.transfer_enabled && agent.transfer_number) {
    const when: string[] = [];
    if (agent.transfer_on_request) when.push('the customer explicitly asks to speak to a human');
    if (agent.transfer_on_unresolved) when.push('you cannot resolve the conversation or answer what they need');
    for (const t of agent.transfer_outcomes) when.push(`the outcome "${t.outcome.label}" is reached`);
    if (when.length) {
      const lines = [
        '## Transferring to a person',
        `Use the transfer_to_human tool when: ${when.join('; ')}.`,
        agent.transfer_fallback_message?.trim()
          ? `If nobody is available to take the call, say: "${agent.transfer_fallback_message.trim()}". Take a message, tell the customer someone will call them back, and end the call politely.`
          : 'If nobody is available to take the call, take a message, tell the customer someone from the team will call them back, and end the call politely.',
      ];
      sections.push(lines.join('\n'));
    }
  }

  sections.push(
    [
      '## Rules',
      '- Never make up information you do not have. If asked something you cannot answer, say a member of the team will get back to them.',
      '- Only take actions through the tools you have been given.',
      '- End the call with end_call once the goal is achieved or the customer wants to stop.',
    ].join('\n'),
  );

  return sections.join('\n\n');
}

function analysisFields(agent: AgentForSync): Retell.AgentCreateParams['post_call_analysis_data'] {
  const fields: NonNullable<Retell.AgentCreateParams['post_call_analysis_data']> = [];

  if (agent.outcomes.length) {
    fields.push({
      type: 'enum',
      name: 'outcome',
      description: `The final outcome of the call. ${agent.outcomes
        .map((o) => `${o.key}: ${o.label}${o.description ? ` (${o.description})` : ''}`)
        .join('; ')}`,
      choices: agent.outcomes.map((o) => o.key),
    });
  }

  for (const item of agent.goal_items) {
    const description = `${item.label}${item.description ? `: ${item.description}` : ''}`;
    switch (item.data_type) {
      case GoalDataType.BOOLEAN:
        fields.push({ type: 'boolean', name: item.key, description });
        break;
      case GoalDataType.NUMBER:
        fields.push({ type: 'number', name: item.key, description });
        break;
      case GoalDataType.ENUM:
        if (item.enum_values.length) {
          fields.push({ type: 'enum', name: item.key, description, choices: item.enum_values });
          break;
        }
        fields.push({ type: 'string', name: item.key, description });
        break;
      default:
        fields.push({
          type: 'string',
          name: item.key,
          description: item.data_type === GoalDataType.DATE ? `${description} (ISO 8601 date)` : description,
        });
    }
  }

  agent.questions.forEach((q, i) => {
    fields.push({
      type: 'string',
      name: `question_${i + 1}`,
      description: `The customer's answer to: ${q.question}`,
    });
  });

  return fields;
}

function customTools(agent: AgentForSync, toolsUrl: string): Retell.LlmCreateParams['general_tools'] {
  const tools: NonNullable<Retell.LlmCreateParams['general_tools']> = [];
  for (const link of agent.crm_tools) {
    const tool = link.crm_tool;
    if (!tool.is_active) continue;
    const schema = (tool.input_schema ?? {}) as Record<string, any>;
    tools.push({
      type: 'custom',
      name: tool.key,
      description: tool.description ?? tool.name,
      url: toolsUrl,
      method: 'POST',
      timeout_ms: 20000,
      speak_during_execution: false,
      parameters: {
        type: 'object',
        properties: schema.properties ?? {},
        ...(Array.isArray(schema.required) && schema.required.length ? { required: schema.required } : {}),
      },
    });
  }
  return tools;
}

export function knowledgeBaseIds(agent: AgentForSync): string[] {
  const ids: string[] = [];
  for (const link of agent.knowledge_sources) {
    const source = link.source;
    if (!source.is_enabled || source.deleted_at || source.status !== 'READY') continue;
    const current = source.versions.find((v) => v.version === source.current_version);
    if (current?.external_knowledge_base_id) ids.push(current.external_knowledge_base_id);
  }
  return ids.sort();
}

export function compileAgentConfig(input: CompileInput): CompiledAgentConfig {
  const { agent, webhookUrls } = input;

  const tools: NonNullable<Retell.LlmCreateParams['general_tools']> = [
    {
      type: 'end_call',
      name: 'end_call',
      description: 'End the call when the goal is achieved, the customer asks to stop, or the conversation is over.',
    },
  ];

  if (agent.transfer_enabled && agent.transfer_number) {
    tools.push({
      type: 'transfer_call',
      name: 'transfer_to_human',
      description: 'Transfer the live call to a member of the team.',
      transfer_destination: { type: 'predefined', number: agent.transfer_number },
      transfer_option: { type: 'cold_transfer', show_transferee_as_caller: false },
    });
  }
  tools.push(...customTools(agent, webhookUrls.tools));

  const defaults: Record<string, string> = {};
  for (const key of [...BASE_PERSONALIZATION_VARIABLES, ...input.personalization.map((v) => v.key)]) {
    defaults[key] = 'unknown';
  }

  const kbIds = knowledgeBaseIds(agent);

  const llm: Retell.LlmCreateParams = {
    general_prompt: buildPrompt(input),
    general_tools: tools,
    begin_message: agent.first_message?.trim() || null,
    default_dynamic_variables: defaults,
    knowledge_base_ids: kbIds.length ? kbIds : null,
    start_speaker: 'agent',
  };

  const voicemail: Retell.AgentCreateParams['voicemail_option'] = agent.detect_voicemail
    ? agent.leave_voicemail && agent.voicemail_message?.trim()
      ? { action: { type: 'static_text', text: agent.voicemail_message.trim() } }
      : { action: { type: 'hangup' } }
    : null;

  const params: CompiledAgentConfig['agent'] = {
    agent_name: `${agent.company.name} - ${agent.name}`.slice(0, 200),
    language: toProviderLanguage(agent.language) as any,
    timezone: agent.company.timezone,
    webhook_url: webhookUrls.events,
    webhook_events: ['call_started', 'call_ended', 'call_analyzed', 'transfer_started', 'transfer_ended'],
    post_call_analysis_data: analysisFields(agent),
    voicemail_option: voicemail,
  };

  if (agent.max_call_duration_seconds) {
    params.max_call_duration_ms = Math.min(7_200_000, Math.max(60_000, agent.max_call_duration_seconds * 1000));
  }

  return { llm, agent: params };
}

export function hashConfig(config: unknown): string {
  return createHash('sha256').update(JSON.stringify(config)).digest('hex');
}

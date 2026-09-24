-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AuthRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN', 'SUPPORT');

-- CreateEnum
CREATE TYPE "CompanyRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('LOGO', 'BANNER', 'IMAGE', 'VIDEO', 'AUDIO', 'PDF', 'DOCUMENT', 'KNOWLEDGE', 'OTHER');

-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "GoalRequirement" AS ENUM ('REQUIRED', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "GoalDataType" AS ENUM ('STRING', 'BOOLEAN', 'NUMBER', 'DATE', 'ENUM');

-- CreateEnum
CREATE TYPE "OutcomeSystemType" AS ENUM ('VOICEMAIL', 'NO_ANSWER', 'WRONG_NUMBER', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "IntegrationCategory" AS ENUM ('CRM', 'KNOWLEDGE', 'CALENDAR', 'EMAIL', 'MESSAGING', 'STORAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('HUBSPOT', 'SALESFORCE', 'PIPEDRIVE', 'ZOHO', 'CUSTOM_CRM', 'GENERIC_API', 'GOOGLE_DOCS', 'GOOGLE_DRIVE', 'GOOGLE_CALENDAR', 'GMAIL', 'NOTION', 'DROPBOX', 'SHAREPOINT', 'SLACK', 'OTHER');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('PENDING', 'ACTIVE', 'ERROR', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "IntegrationAuthType" AS ENUM ('API_KEY', 'BEARER_TOKEN', 'BASIC', 'OAUTH2', 'CUSTOM_HEADERS');

-- CreateEnum
CREATE TYPE "CrmRecordType" AS ENUM ('CONTACT', 'LEAD', 'COMPANY', 'DEAL', 'OTHER');

-- CreateEnum
CREATE TYPE "MappingDirection" AS ENUM ('READ', 'WRITE', 'BOTH');

-- CreateEnum
CREATE TYPE "KnowledgeSourceType" AS ENUM ('TEXT', 'FILE', 'GOOGLE_DOCS', 'NOTION', 'GOOGLE_DRIVE', 'DROPBOX', 'SHAREPOINT');

-- CreateEnum
CREATE TYPE "KnowledgeStatus" AS ENUM ('PROCESSING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "PhoneNumberSource" AS ENUM ('PROVISIONED', 'BYO');

-- CreateEnum
CREATE TYPE "PhoneNumberStatus" AS ENUM ('PENDING', 'ACTIVE', 'ERROR', 'RELEASED');

-- CreateEnum
CREATE TYPE "VoiceProvider" AS ENUM ('RETELL');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('SCHEDULED', 'QUEUED', 'RINGING', 'IN_PROGRESS', 'COMPLETED', 'TRANSFERRED', 'NO_ANSWER', 'BUSY', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CostCategory" AS ENUM ('AI', 'TELEPHONY', 'OTHER');

-- CreateEnum
CREATE TYPE "CostUnit" AS ENUM ('SECOND', 'MINUTE', 'CALL', 'TOKEN', 'MESSAGE');

-- CreateEnum
CREATE TYPE "ActionKind" AS ENUM ('CRM', 'CALENDAR', 'EMAIL', 'MESSAGING', 'OTHER');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'EXECUTED', 'FAILED', 'RETRYING', 'NEEDS_ATTENTION', 'CANCELED');

-- CreateEnum
CREATE TYPE "ScheduledCallStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ScheduledCallSource" AS ENUM ('MANUAL', 'RETRY', 'AUTOMATION', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "RetryTrigger" AS ENUM ('NO_ANSWER', 'BUSY', 'FAILED', 'VOICEMAIL');

-- CreateEnum
CREATE TYPE "AutomationTrigger" AS ENUM ('CALL_OUTCOME', 'CALL_COMPLETED', 'CALL_FAILED', 'CALL_TRANSFERRED', 'VOICEMAIL_DETECTED');

-- CreateEnum
CREATE TYPE "AutomationActionType" AS ENUM ('UPDATE_CRM', 'ADD_CRM_NOTE', 'CREATE_CRM_TASK', 'SCHEDULE_FOLLOW_UP', 'CANCEL_FOLLOW_UPS', 'CREATE_CALENDAR_EVENT', 'SEND_EMAIL', 'SEND_SMS', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "ProviderEventStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'SYSTEM', 'AGENT', 'PROVIDER');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('INTEGRATION_FAILED', 'AI_SERVICE_UNAVAILABLE', 'CALL_FAILED', 'KNOWLEDGE_PROCESSING_FAILED', 'CRM_UPDATE_FAILED', 'INVALID_PHONE_NUMBER', 'NO_PHONE_NUMBER_AVAILABLE', 'OTHER');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "timezone" TEXT,
    "language" TEXT,
    "role" "AuthRole" NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "company_uuid" TEXT,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'LOGO',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "phone" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "recording_retention_days" INTEGER,
    "stripe_customer_id" TEXT,
    "deletion_requested_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_members" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "role" "CompanyRole" NOT NULL DEFAULT 'MEMBER',
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_invitations" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "CompanyRole" NOT NULL DEFAULT 'MEMBER',
    "token_hash" TEXT NOT NULL,
    "invited_by_uuid" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_calling_hours" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL DEFAULT '09:00',
    "end_time" TEXT NOT NULL DEFAULT '18:00',
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_calling_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "created_by_uuid" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "purpose" TEXT,
    "status" "AgentStatus" NOT NULL DEFAULT 'DRAFT',
    "voice" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "first_message" TEXT,
    "instructions" TEXT NOT NULL DEFAULT '',
    "goal" TEXT,
    "success_criteria" TEXT,
    "failure_criteria" TEXT,
    "max_call_duration_seconds" INTEGER,
    "crm_integration_uuid" TEXT,
    "personalization_config" JSONB,
    "detect_voicemail" BOOLEAN NOT NULL DEFAULT true,
    "leave_voicemail" BOOLEAN NOT NULL DEFAULT false,
    "voicemail_message" TEXT,
    "transfer_enabled" BOOLEAN NOT NULL DEFAULT false,
    "transfer_on_request" BOOLEAN NOT NULL DEFAULT true,
    "transfer_on_unresolved" BOOLEAN NOT NULL DEFAULT false,
    "transfer_number" TEXT,
    "transfer_fallback_message" TEXT,
    "activated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_goal_items" (
    "id" TEXT NOT NULL,
    "agent_uuid" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "requirement" "GoalRequirement" NOT NULL DEFAULT 'REQUIRED',
    "data_type" "GoalDataType" NOT NULL DEFAULT 'STRING',
    "enum_values" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_goal_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_questions" (
    "id" TEXT NOT NULL,
    "agent_uuid" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "expected_answer" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_outcomes" (
    "id" TEXT NOT NULL,
    "agent_uuid" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "is_success" BOOLEAN NOT NULL DEFAULT false,
    "system_type" "OutcomeSystemType",
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_outcomes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_transfer_outcomes" (
    "agent_uuid" TEXT NOT NULL,
    "outcome_uuid" TEXT NOT NULL,

    CONSTRAINT "agent_transfer_outcomes_pkey" PRIMARY KEY ("agent_uuid","outcome_uuid")
);

-- CreateTable
CREATE TABLE "agent_access" (
    "agent_uuid" TEXT NOT NULL,
    "member_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_access_pkey" PRIMARY KEY ("agent_uuid","member_uuid")
);

-- CreateTable
CREATE TABLE "agent_provider_links" (
    "id" TEXT NOT NULL,
    "agent_uuid" TEXT NOT NULL,
    "provider" "VoiceProvider" NOT NULL,
    "external_agent_id" TEXT NOT NULL,
    "external_llm_id" TEXT,
    "agent_version" INTEGER,
    "llm_version" INTEGER,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "config_hash" TEXT,
    "sync_status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "synced_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_provider_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "created_by_uuid" TEXT,
    "category" "IntegrationCategory" NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'PENDING',
    "base_url" TEXT,
    "api_docs_url" TEXT,
    "auth_type" "IntegrationAuthType",
    "credentials_encrypted" TEXT,
    "credentials_hint" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "config" JSONB,
    "last_error" TEXT,
    "last_verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_tools" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT,
    "integration_uuid" TEXT,
    "provider" "IntegrationProvider" NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "input_schema" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_tools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_crm_tools" (
    "agent_uuid" TEXT NOT NULL,
    "crm_tool_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_crm_tools_pkey" PRIMARY KEY ("agent_uuid","crm_tool_uuid")
);

-- CreateTable
CREATE TABLE "crm_field_mappings" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "integration_uuid" TEXT NOT NULL,
    "agent_uuid" TEXT,
    "internal_field" TEXT NOT NULL,
    "external_object" TEXT,
    "external_field" TEXT NOT NULL,
    "direction" "MappingDirection" NOT NULL DEFAULT 'BOTH',
    "use_for_personalization" BOOLEAN NOT NULL DEFAULT false,
    "transform" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_field_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "integration_uuid" TEXT,
    "external_id" TEXT,
    "record_type" "CrmRecordType" NOT NULL DEFAULT 'CONTACT',
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "external_url" TEXT,
    "do_not_call" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_sources" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "added_by_uuid" TEXT,
    "integration_uuid" TEXT,
    "name" TEXT NOT NULL,
    "type" "KnowledgeSourceType" NOT NULL,
    "status" "KnowledgeStatus" NOT NULL DEFAULT 'PROCESSING',
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "external_ref" TEXT,
    "last_error" TEXT,
    "last_refreshed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_source_versions" (
    "id" TEXT NOT NULL,
    "source_uuid" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "created_by_uuid" TEXT,
    "document_uuid" TEXT,
    "content" TEXT NOT NULL,
    "content_hash" TEXT,
    "status" "KnowledgeStatus" NOT NULL DEFAULT 'PROCESSING',
    "error" TEXT,
    "external_knowledge_base_id" TEXT,
    "external_source_id" TEXT,
    "indexed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_source_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_knowledge_sources" (
    "agent_uuid" TEXT NOT NULL,
    "source_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_knowledge_sources_pkey" PRIMARY KEY ("agent_uuid","source_uuid")
);

-- CreateTable
CREATE TABLE "phone_numbers" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "agent_uuid" TEXT,
    "number" TEXT NOT NULL,
    "label" TEXT,
    "source" "PhoneNumberSource" NOT NULL,
    "status" "PhoneNumberStatus" NOT NULL DEFAULT 'PENDING',
    "provider" "VoiceProvider" NOT NULL,
    "external_id" TEXT,
    "provider_number_type" TEXT,
    "byo_config" JSONB,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phone_numbers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calls" (
    "id" TEXT NOT NULL,
    "call_number" SERIAL NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "agent_uuid" TEXT NOT NULL,
    "contact_uuid" TEXT,
    "phone_number_uuid" TEXT,
    "scheduled_call_uuid" TEXT,
    "outcome_uuid" TEXT,
    "direction" "CallDirection" NOT NULL,
    "status" "CallStatus" NOT NULL DEFAULT 'QUEUED',
    "is_test" BOOLEAN NOT NULL DEFAULT false,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "from_number" TEXT,
    "to_number" TEXT,
    "contact_name" TEXT,
    "outcome_key" TEXT,
    "outcome_label" TEXT,
    "is_successful" BOOLEAN,
    "provider" "VoiceProvider" NOT NULL,
    "external_call_id" TEXT,
    "provider_agent_version" INTEGER,
    "queued_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "answered_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "disconnect_reason" TEXT,
    "summary" TEXT,
    "transcript" JSONB,
    "transcript_text" TEXT,
    "gathered_data" JSONB,
    "in_voicemail" BOOLEAN,
    "analysis_status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "transferred_to" TEXT,
    "transfer_reason" TEXT,
    "recording_path" TEXT,
    "recording_duration_seconds" INTEGER,
    "recording_expires_at" TIMESTAMP(3),
    "recording_deleted_at" TIMESTAMP(3),
    "agent_snapshot" JSONB,
    "knowledge_snapshot" JSONB,
    "dynamic_variables" JSONB,
    "provider_cost" JSONB,
    "ai_cost" DECIMAL(14,6) NOT NULL DEFAULT 0,
    "telephony_cost" DECIMAL(14,6) NOT NULL DEFAULT 0,
    "total_cost" DECIMAL(14,6) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "error_code" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_events" (
    "id" TEXT NOT NULL,
    "call_uuid" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "data" JSONB,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rates" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT,
    "key" TEXT NOT NULL,
    "category" "CostCategory" NOT NULL,
    "provider" "VoiceProvider",
    "unit" "CostUnit" NOT NULL,
    "unit_price" DECIMAL(14,8) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_cost_items" (
    "id" TEXT NOT NULL,
    "call_uuid" TEXT NOT NULL,
    "pricing_rate_uuid" TEXT,
    "category" "CostCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(14,4) NOT NULL,
    "unit" "CostUnit" NOT NULL,
    "unit_price" DECIMAL(14,8) NOT NULL,
    "amount" DECIMAL(14,6) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_cost_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "call_actions" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "call_uuid" TEXT NOT NULL,
    "agent_uuid" TEXT,
    "integration_uuid" TEXT,
    "crm_tool_uuid" TEXT,
    "automation_action_uuid" TEXT,
    "kind" "ActionKind" NOT NULL DEFAULT 'CRM',
    "tool_key" TEXT NOT NULL,
    "status" "ActionStatus" NOT NULL DEFAULT 'REQUESTED',
    "request_payload" JSONB,
    "result" JSONB,
    "rejection_reason" TEXT,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "next_retry_at" TIMESTAMP(3),
    "last_error" TEXT,
    "executed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_events" (
    "id" TEXT NOT NULL,
    "provider" "VoiceProvider" NOT NULL,
    "event_type" TEXT NOT NULL,
    "dedupe_key" TEXT,
    "external_call_id" TEXT,
    "call_uuid" TEXT,
    "payload" JSONB NOT NULL,
    "signature_verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "ProviderEventStatus" NOT NULL DEFAULT 'RECEIVED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "provider_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_calls" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "agent_uuid" TEXT NOT NULL,
    "contact_uuid" TEXT NOT NULL,
    "origin_call_uuid" TEXT,
    "source" "ScheduledCallSource" NOT NULL DEFAULT 'MANUAL',
    "status" "ScheduledCallStatus" NOT NULL DEFAULT 'PENDING',
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "closed_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retry_rules" (
    "id" TEXT NOT NULL,
    "agent_uuid" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "delays_minutes" INTEGER[] DEFAULT ARRAY[120, 1440]::INTEGER[],
    "retry_on" "RetryTrigger"[] DEFAULT ARRAY['NO_ANSWER', 'BUSY', 'FAILED']::"RetryTrigger"[],
    "calling_hours_override" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retry_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "agent_uuid" TEXT,
    "outcome_uuid" TEXT,
    "name" TEXT NOT NULL,
    "trigger" "AutomationTrigger" NOT NULL,
    "conditions" JSONB,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_actions" (
    "id" TEXT NOT NULL,
    "rule_uuid" TEXT NOT NULL,
    "type" "AutomationActionType" NOT NULL,
    "config" JSONB,
    "delay_minutes" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "user_uuid" TEXT,
    "actor_type" "ActorType" NOT NULL DEFAULT 'USER',
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_uuid" TEXT,
    "metadata" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "company_uuid" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'ERROR',
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "message" TEXT,
    "entity_type" TEXT,
    "entity_uuid" TEXT,
    "metadata" JSONB,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_hash_key" ON "password_reset_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_uuid_idx" ON "password_reset_tokens"("user_uuid");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "documents_user_uuid_idx" ON "documents"("user_uuid");

-- CreateIndex
CREATE INDEX "documents_company_uuid_idx" ON "documents"("company_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "companies_stripe_customer_id_key" ON "companies"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "companies_deleted_at_idx" ON "companies"("deleted_at");

-- CreateIndex
CREATE INDEX "company_members_user_uuid_idx" ON "company_members"("user_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "company_members_company_uuid_user_uuid_key" ON "company_members"("company_uuid", "user_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "company_invitations_token_hash_key" ON "company_invitations"("token_hash");

-- CreateIndex
CREATE INDEX "company_invitations_company_uuid_idx" ON "company_invitations"("company_uuid");

-- CreateIndex
CREATE INDEX "company_invitations_email_idx" ON "company_invitations"("email");

-- CreateIndex
CREATE UNIQUE INDEX "company_calling_hours_company_uuid_day_of_week_key" ON "company_calling_hours"("company_uuid", "day_of_week");

-- CreateIndex
CREATE INDEX "agents_company_uuid_status_idx" ON "agents"("company_uuid", "status");

-- CreateIndex
CREATE INDEX "agents_company_uuid_deleted_at_idx" ON "agents"("company_uuid", "deleted_at");

-- CreateIndex
CREATE INDEX "agents_crm_integration_uuid_idx" ON "agents"("crm_integration_uuid");

-- CreateIndex
CREATE INDEX "agent_goal_items_agent_uuid_position_idx" ON "agent_goal_items"("agent_uuid", "position");

-- CreateIndex
CREATE UNIQUE INDEX "agent_goal_items_agent_uuid_key_key" ON "agent_goal_items"("agent_uuid", "key");

-- CreateIndex
CREATE INDEX "agent_questions_agent_uuid_position_idx" ON "agent_questions"("agent_uuid", "position");

-- CreateIndex
CREATE INDEX "agent_outcomes_agent_uuid_position_idx" ON "agent_outcomes"("agent_uuid", "position");

-- CreateIndex
CREATE UNIQUE INDEX "agent_outcomes_agent_uuid_key_key" ON "agent_outcomes"("agent_uuid", "key");

-- CreateIndex
CREATE INDEX "agent_access_member_uuid_idx" ON "agent_access"("member_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "agent_provider_links_agent_uuid_provider_key" ON "agent_provider_links"("agent_uuid", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "agent_provider_links_provider_external_agent_id_key" ON "agent_provider_links"("provider", "external_agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "agent_provider_links_provider_external_llm_id_key" ON "agent_provider_links"("provider", "external_llm_id");

-- CreateIndex
CREATE INDEX "integrations_company_uuid_category_idx" ON "integrations"("company_uuid", "category");

-- CreateIndex
CREATE INDEX "integrations_company_uuid_provider_idx" ON "integrations"("company_uuid", "provider");

-- CreateIndex
CREATE INDEX "crm_tools_provider_key_idx" ON "crm_tools"("provider", "key");

-- CreateIndex
CREATE INDEX "crm_tools_integration_uuid_idx" ON "crm_tools"("integration_uuid");

-- CreateIndex
CREATE INDEX "crm_tools_company_uuid_idx" ON "crm_tools"("company_uuid");

-- CreateIndex
CREATE INDEX "agent_crm_tools_crm_tool_uuid_idx" ON "agent_crm_tools"("crm_tool_uuid");

-- CreateIndex
CREATE INDEX "crm_field_mappings_company_uuid_idx" ON "crm_field_mappings"("company_uuid");

-- CreateIndex
CREATE INDEX "crm_field_mappings_integration_uuid_agent_uuid_idx" ON "crm_field_mappings"("integration_uuid", "agent_uuid");

-- CreateIndex
CREATE INDEX "contacts_company_uuid_phone_idx" ON "contacts"("company_uuid", "phone");

-- CreateIndex
CREATE INDEX "contacts_company_uuid_email_idx" ON "contacts"("company_uuid", "email");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_company_uuid_integration_uuid_record_type_external_key" ON "contacts"("company_uuid", "integration_uuid", "record_type", "external_id");

-- CreateIndex
CREATE INDEX "knowledge_sources_company_uuid_status_idx" ON "knowledge_sources"("company_uuid", "status");

-- CreateIndex
CREATE INDEX "knowledge_sources_company_uuid_deleted_at_idx" ON "knowledge_sources"("company_uuid", "deleted_at");

-- CreateIndex
CREATE INDEX "knowledge_source_versions_external_knowledge_base_id_idx" ON "knowledge_source_versions"("external_knowledge_base_id");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_source_versions_source_uuid_version_key" ON "knowledge_source_versions"("source_uuid", "version");

-- CreateIndex
CREATE INDEX "agent_knowledge_sources_source_uuid_idx" ON "agent_knowledge_sources"("source_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "phone_numbers_number_key" ON "phone_numbers"("number");

-- CreateIndex
CREATE INDEX "phone_numbers_company_uuid_status_idx" ON "phone_numbers"("company_uuid", "status");

-- CreateIndex
CREATE INDEX "phone_numbers_agent_uuid_idx" ON "phone_numbers"("agent_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "calls_call_number_key" ON "calls"("call_number");

-- CreateIndex
CREATE UNIQUE INDEX "calls_scheduled_call_uuid_key" ON "calls"("scheduled_call_uuid");

-- CreateIndex
CREATE INDEX "calls_company_uuid_started_at_idx" ON "calls"("company_uuid", "started_at");

-- CreateIndex
CREATE INDEX "calls_company_uuid_agent_uuid_started_at_idx" ON "calls"("company_uuid", "agent_uuid", "started_at");

-- CreateIndex
CREATE INDEX "calls_company_uuid_status_idx" ON "calls"("company_uuid", "status");

-- CreateIndex
CREATE INDEX "calls_company_uuid_outcome_key_idx" ON "calls"("company_uuid", "outcome_key");

-- CreateIndex
CREATE INDEX "calls_company_uuid_direction_idx" ON "calls"("company_uuid", "direction");

-- CreateIndex
CREATE INDEX "calls_contact_uuid_idx" ON "calls"("contact_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "calls_provider_external_call_id_key" ON "calls"("provider", "external_call_id");

-- CreateIndex
CREATE INDEX "call_events_call_uuid_occurred_at_idx" ON "call_events"("call_uuid", "occurred_at");

-- CreateIndex
CREATE INDEX "pricing_rates_key_effective_from_idx" ON "pricing_rates"("key", "effective_from");

-- CreateIndex
CREATE INDEX "pricing_rates_company_uuid_idx" ON "pricing_rates"("company_uuid");

-- CreateIndex
CREATE INDEX "call_cost_items_call_uuid_idx" ON "call_cost_items"("call_uuid");

-- CreateIndex
CREATE INDEX "call_actions_call_uuid_idx" ON "call_actions"("call_uuid");

-- CreateIndex
CREATE INDEX "call_actions_company_uuid_status_idx" ON "call_actions"("company_uuid", "status");

-- CreateIndex
CREATE INDEX "call_actions_status_next_retry_at_idx" ON "call_actions"("status", "next_retry_at");

-- CreateIndex
CREATE INDEX "provider_events_status_received_at_idx" ON "provider_events"("status", "received_at");

-- CreateIndex
CREATE INDEX "provider_events_external_call_id_idx" ON "provider_events"("external_call_id");

-- CreateIndex
CREATE INDEX "provider_events_call_uuid_idx" ON "provider_events"("call_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "provider_events_provider_dedupe_key_key" ON "provider_events"("provider", "dedupe_key");

-- CreateIndex
CREATE INDEX "scheduled_calls_status_scheduled_for_idx" ON "scheduled_calls"("status", "scheduled_for");

-- CreateIndex
CREATE INDEX "scheduled_calls_company_uuid_status_idx" ON "scheduled_calls"("company_uuid", "status");

-- CreateIndex
CREATE INDEX "scheduled_calls_agent_uuid_idx" ON "scheduled_calls"("agent_uuid");

-- CreateIndex
CREATE INDEX "scheduled_calls_contact_uuid_idx" ON "scheduled_calls"("contact_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "retry_rules_agent_uuid_key" ON "retry_rules"("agent_uuid");

-- CreateIndex
CREATE INDEX "automation_rules_company_uuid_trigger_is_enabled_idx" ON "automation_rules"("company_uuid", "trigger", "is_enabled");

-- CreateIndex
CREATE INDEX "automation_rules_agent_uuid_idx" ON "automation_rules"("agent_uuid");

-- CreateIndex
CREATE INDEX "automation_rules_outcome_uuid_idx" ON "automation_rules"("outcome_uuid");

-- CreateIndex
CREATE INDEX "automation_actions_rule_uuid_position_idx" ON "automation_actions"("rule_uuid", "position");

-- CreateIndex
CREATE INDEX "activity_logs_company_uuid_created_at_idx" ON "activity_logs"("company_uuid", "created_at");

-- CreateIndex
CREATE INDEX "activity_logs_company_uuid_entity_type_entity_uuid_idx" ON "activity_logs"("company_uuid", "entity_type", "entity_uuid");

-- CreateIndex
CREATE INDEX "activity_logs_user_uuid_idx" ON "activity_logs"("user_uuid");

-- CreateIndex
CREATE INDEX "alerts_company_uuid_status_created_at_idx" ON "alerts"("company_uuid", "status", "created_at");

-- CreateIndex
CREATE INDEX "alerts_company_uuid_entity_type_entity_uuid_idx" ON "alerts"("company_uuid", "entity_type", "entity_uuid");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_invitations" ADD CONSTRAINT "company_invitations_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_invitations" ADD CONSTRAINT "company_invitations_invited_by_uuid_fkey" FOREIGN KEY ("invited_by_uuid") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_calling_hours" ADD CONSTRAINT "company_calling_hours_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_created_by_uuid_fkey" FOREIGN KEY ("created_by_uuid") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_crm_integration_uuid_fkey" FOREIGN KEY ("crm_integration_uuid") REFERENCES "integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_goal_items" ADD CONSTRAINT "agent_goal_items_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_questions" ADD CONSTRAINT "agent_questions_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_outcomes" ADD CONSTRAINT "agent_outcomes_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_transfer_outcomes" ADD CONSTRAINT "agent_transfer_outcomes_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_transfer_outcomes" ADD CONSTRAINT "agent_transfer_outcomes_outcome_uuid_fkey" FOREIGN KEY ("outcome_uuid") REFERENCES "agent_outcomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_access" ADD CONSTRAINT "agent_access_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_access" ADD CONSTRAINT "agent_access_member_uuid_fkey" FOREIGN KEY ("member_uuid") REFERENCES "company_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_provider_links" ADD CONSTRAINT "agent_provider_links_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_created_by_uuid_fkey" FOREIGN KEY ("created_by_uuid") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_tools" ADD CONSTRAINT "crm_tools_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_tools" ADD CONSTRAINT "crm_tools_integration_uuid_fkey" FOREIGN KEY ("integration_uuid") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_crm_tools" ADD CONSTRAINT "agent_crm_tools_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_crm_tools" ADD CONSTRAINT "agent_crm_tools_crm_tool_uuid_fkey" FOREIGN KEY ("crm_tool_uuid") REFERENCES "crm_tools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_field_mappings" ADD CONSTRAINT "crm_field_mappings_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_field_mappings" ADD CONSTRAINT "crm_field_mappings_integration_uuid_fkey" FOREIGN KEY ("integration_uuid") REFERENCES "integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_field_mappings" ADD CONSTRAINT "crm_field_mappings_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_integration_uuid_fkey" FOREIGN KEY ("integration_uuid") REFERENCES "integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_added_by_uuid_fkey" FOREIGN KEY ("added_by_uuid") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_integration_uuid_fkey" FOREIGN KEY ("integration_uuid") REFERENCES "integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_source_versions" ADD CONSTRAINT "knowledge_source_versions_source_uuid_fkey" FOREIGN KEY ("source_uuid") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_source_versions" ADD CONSTRAINT "knowledge_source_versions_created_by_uuid_fkey" FOREIGN KEY ("created_by_uuid") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_source_versions" ADD CONSTRAINT "knowledge_source_versions_document_uuid_fkey" FOREIGN KEY ("document_uuid") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_knowledge_sources" ADD CONSTRAINT "agent_knowledge_sources_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_knowledge_sources" ADD CONSTRAINT "agent_knowledge_sources_source_uuid_fkey" FOREIGN KEY ("source_uuid") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_numbers" ADD CONSTRAINT "phone_numbers_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_contact_uuid_fkey" FOREIGN KEY ("contact_uuid") REFERENCES "contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_phone_number_uuid_fkey" FOREIGN KEY ("phone_number_uuid") REFERENCES "phone_numbers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_scheduled_call_uuid_fkey" FOREIGN KEY ("scheduled_call_uuid") REFERENCES "scheduled_calls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calls" ADD CONSTRAINT "calls_outcome_uuid_fkey" FOREIGN KEY ("outcome_uuid") REFERENCES "agent_outcomes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_events" ADD CONSTRAINT "call_events_call_uuid_fkey" FOREIGN KEY ("call_uuid") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_rates" ADD CONSTRAINT "pricing_rates_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_cost_items" ADD CONSTRAINT "call_cost_items_call_uuid_fkey" FOREIGN KEY ("call_uuid") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_cost_items" ADD CONSTRAINT "call_cost_items_pricing_rate_uuid_fkey" FOREIGN KEY ("pricing_rate_uuid") REFERENCES "pricing_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_actions" ADD CONSTRAINT "call_actions_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_actions" ADD CONSTRAINT "call_actions_call_uuid_fkey" FOREIGN KEY ("call_uuid") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_actions" ADD CONSTRAINT "call_actions_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_actions" ADD CONSTRAINT "call_actions_integration_uuid_fkey" FOREIGN KEY ("integration_uuid") REFERENCES "integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_actions" ADD CONSTRAINT "call_actions_crm_tool_uuid_fkey" FOREIGN KEY ("crm_tool_uuid") REFERENCES "crm_tools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "call_actions" ADD CONSTRAINT "call_actions_automation_action_uuid_fkey" FOREIGN KEY ("automation_action_uuid") REFERENCES "automation_actions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_events" ADD CONSTRAINT "provider_events_call_uuid_fkey" FOREIGN KEY ("call_uuid") REFERENCES "calls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_calls" ADD CONSTRAINT "scheduled_calls_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_calls" ADD CONSTRAINT "scheduled_calls_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_calls" ADD CONSTRAINT "scheduled_calls_contact_uuid_fkey" FOREIGN KEY ("contact_uuid") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_calls" ADD CONSTRAINT "scheduled_calls_origin_call_uuid_fkey" FOREIGN KEY ("origin_call_uuid") REFERENCES "calls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retry_rules" ADD CONSTRAINT "retry_rules_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_agent_uuid_fkey" FOREIGN KEY ("agent_uuid") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_outcome_uuid_fkey" FOREIGN KEY ("outcome_uuid") REFERENCES "agent_outcomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_actions" ADD CONSTRAINT "automation_actions_rule_uuid_fkey" FOREIGN KEY ("rule_uuid") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_company_uuid_fkey" FOREIGN KEY ("company_uuid") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;


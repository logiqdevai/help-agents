export const VoiceProviderName = 'RETELL' as const;

/** Countries the provider can provision numbers in directly. Others must bring their own number. */
export const PROVISIONING_COUNTRIES = ['US', 'CA'] as const;

/** Where a business's carrier must route inbound traffic for a number it brings itself. */
export const INBOUND_SIP_ADDRESS = 'sip.retellai.com';

export const WEBHOOK_PATHS = {
  events: '/webhooks/voice/events',
  inbound: '/webhooks/voice/inbound',
  tools: '/webhooks/voice/tools',
} as const;

export const GENERIC_SYNC_ERROR =
  'The agent configuration could not be synchronised right now. Please try again shortly.';

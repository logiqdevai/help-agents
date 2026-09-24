export interface Voice {
  voice_id: string;
  name: string;
  gender: string | null;
  accent: string | null;
  language: string | null;
  preview_audio_url: string | null;
}

export interface VoicesQuery {
  search?: string;
  gender?: "male" | "female";
  accent?: string;
}

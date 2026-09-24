import { useQuery } from "@tanstack/react-query";
import type { VoicesQuery } from "@/features/voices/interfaces/voices.interfaces";
import { getVoices } from "@/features/voices/services/voices.services";

const VOICES_STALE_TIME_MS = 10 * 60 * 1000;

export const useGetVoices = (query?: VoicesQuery) =>
  useQuery({
    queryKey: ["voices", query],
    queryFn: () => getVoices(query),
    staleTime: VOICES_STALE_TIME_MS,
  });

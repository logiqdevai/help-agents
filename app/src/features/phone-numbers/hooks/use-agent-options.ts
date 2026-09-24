import { useQuery } from "@tanstack/react-query";
import { getAgentOptions } from "@/features/phone-numbers/services/agent-options.services";

/** The company's agents as `{ id, name }`, for pickers that let the user choose an agent. */
export const useGetAgentOptions = () =>
  useQuery({
    queryKey: ["agent-options"],
    queryFn: getAgentOptions,
  });

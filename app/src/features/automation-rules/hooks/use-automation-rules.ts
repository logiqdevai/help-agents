import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AutomationRulesQuery } from "@/features/automation-rules/interfaces/automation-rules.interfaces";
import {
  createAutomationRule,
  deleteAutomationRule,
  getAutomationRules,
  setAutomationRuleEnabled,
  updateAutomationRule,
} from "@/features/automation-rules/services/automation-rules.services";
import { notify } from "@/lib/notify";

const AUTOMATION_RULES_KEY = "automation-rules";

/** `enabled` lets callers skip the request for roles that cannot read automation rules. */
export const useGetAutomationRules = (query?: AutomationRulesQuery, enabled = true) =>
  useQuery({
    queryKey: [AUTOMATION_RULES_KEY, query],
    queryFn: () => getAutomationRules(query),
    enabled,
  });

export const useCreateAutomationRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAutomationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTOMATION_RULES_KEY] });
      notify.success("Rule created");
    },
    onError: (error) => notify.error("Could not create the rule", error.message),
  });
};

export const useUpdateAutomationRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAutomationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTOMATION_RULES_KEY] });
      notify.success("Rule saved");
    },
    onError: (error) => notify.error("Could not save the rule", error.message),
  });
};

export const useSetAutomationRuleEnabled = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setAutomationRuleEnabled,
    onSuccess: (rule) => {
      queryClient.invalidateQueries({ queryKey: [AUTOMATION_RULES_KEY] });
      notify.success(rule.is_enabled ? "Rule turned on" : "Rule turned off");
    },
    onError: (error) => notify.error("Could not change the rule", error.message),
  });
};

export const useDeleteAutomationRule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAutomationRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTOMATION_RULES_KEY] });
      notify.success("Rule deleted");
    },
    onError: (error) => notify.error("Could not delete the rule", error.message),
  });
};

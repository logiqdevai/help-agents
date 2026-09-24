import { toast } from "@/components/ui/toast";

// Thin wrapper over the Base UI toast manager. Every mutation hook calls these in
// onSuccess / onError (see app rules §5). Requires <Toaster> mounted in providers.tsx.
export const notify = {
  success: (title: string, description?: string) =>
    toast.add({ title, description, type: "success", timeout: 3000 }),
  error: (title: string, description?: string) =>
    toast.add({ title, description, type: "error", timeout: 6000 }),
  info: (title: string, description?: string) =>
    toast.add({ title, description, type: "info", timeout: 4000 }),
  warning: (title: string, description?: string) =>
    toast.add({ title, description, type: "warning", timeout: 5000 }),
};

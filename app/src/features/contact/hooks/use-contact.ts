import { useMutation } from "@tanstack/react-query";
import { sendContactRequest } from "@/features/contact/services/contact.services";
import { notify } from "@/lib/notify";

export const useSendContactRequest = () =>
  useMutation({
    mutationFn: sendContactRequest,
    onSuccess: () => notify.success("Request sent", "Thanks, we will be in touch soon."),
    onError: (error) => notify.error("Could not send your request", error.message),
  });

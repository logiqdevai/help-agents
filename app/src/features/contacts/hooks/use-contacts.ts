import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ContactsQuery } from "@/features/contacts/interfaces/contacts.interfaces";
import {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  importContacts,
  syncContactFromCrm,
  updateContact,
} from "@/features/contacts/services/contacts.services";
import { notify } from "@/lib/notify";

export const useGetContacts = (query?: ContactsQuery) =>
  useQuery({
    queryKey: ["contacts", query],
    queryFn: () => getContacts(query),
    placeholderData: keepPreviousData,
  });

export const useGetContact = (id: string) =>
  useQuery({
    queryKey: ["contact", id],
    queryFn: () => getContact(id),
    enabled: !!id,
  });

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      notify.success("Contact created");
    },
    onError: (error) => notify.error("Could not create contact", error.message),
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact"] });
      notify.success("Contact updated");
    },
    onError: (error) => notify.error("Could not update contact", error.message),
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      notify.success("Contact deleted");
    },
    onError: (error) => notify.error("Could not delete contact", error.message),
  });
};

export const useImportContacts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importContacts,
    onSuccess: ({ results }) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      const failed = results.filter((row) => row.status === "failed").length;
      notify.success(
        "Contacts imported",
        failed ? `${results.length - failed} imported, ${failed} failed.` : `${results.length} imported.`,
      );
    },
    onError: (error) => notify.error("Could not import contacts", error.message),
  });
};

export const useSyncContactFromCrm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncContactFromCrm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      notify.success("Contact synced from your CRM");
    },
    onError: (error) => notify.error("Could not sync contact", error.message),
  });
};

import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  Contact,
  ContactDetail,
  ContactsQuery,
  CreateContactDto,
  ImportContactsDto,
  ImportRowResult,
  SyncContactFromCrmDto,
  UpdateContactDto,
} from "@/features/contacts/interfaces/contacts.interfaces";
import { cleanParams, type PaginatedResponse } from "@/interfaces/common.interfaces";

export const getContacts = async (query?: ContactsQuery): Promise<PaginatedResponse<Contact>> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.contacts.root, { params: cleanParams(query) });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch contacts. Please try again."));
  }
};

export const getContact = async (id: string): Promise<ContactDetail> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.contacts.detail(id));
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch the contact."));
  }
};

export const createContact = async (dto: CreateContactDto): Promise<Contact> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.contacts.root, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not create the contact."));
  }
};

export const updateContact = async ({ id, dto }: { id: string; dto: UpdateContactDto }): Promise<Contact> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.contacts.detail(id), dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not update the contact."));
  }
};

export const deleteContact = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(ApiRoutes.contacts.detail(id));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not delete the contact."));
  }
};

export const importContacts = async (dto: ImportContactsDto): Promise<{ results: ImportRowResult[] }> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.contacts.import, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not import contacts."));
  }
};

export const syncContactFromCrm = async (dto: SyncContactFromCrmDto): Promise<Contact> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.contacts.syncFromCrm, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not find that record in the CRM."));
  }
};

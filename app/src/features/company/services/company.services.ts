import axiosInstance, { getApiErrorMessage } from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
  CallingHours,
  Company,
  CompanyDeletionStatus,
  CompanySummary,
  RequestCompanyDeletionDto,
  SetCallingHoursDto,
  UpdateCompanyDto,
} from "@/features/company/interfaces/company.interfaces";

export const getMyCompanies = async (): Promise<CompanySummary[]> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.company.list);
    return response.data.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load your companies."));
  }
};

export const getCompany = async (): Promise<Company> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.company.current);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load company details."));
  }
};

export const updateCompany = async (dto: UpdateCompanyDto): Promise<Company> => {
  try {
    const response = await axiosInstance.patch(ApiRoutes.company.current, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save company settings."));
  }
};

export const getCallingHours = async (): Promise<CallingHours> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.company.callingHours);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load calling hours."));
  }
};

export const setCallingHours = async (dto: SetCallingHoursDto): Promise<CallingHours> => {
  try {
    const response = await axiosInstance.put(ApiRoutes.company.callingHours, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not save calling hours."));
  }
};

export const getDeletionStatus = async (): Promise<CompanyDeletionStatus> => {
  try {
    const response = await axiosInstance.get(ApiRoutes.company.deletionStatus);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not load the deletion status."));
  }
};

export const requestCompanyDeletion = async (dto: RequestCompanyDeletionDto): Promise<CompanyDeletionStatus> => {
  try {
    const response = await axiosInstance.post(ApiRoutes.company.deletionRequest, dto);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not request deletion."));
  }
};

export const cancelCompanyDeletion = async (): Promise<CompanyDeletionStatus> => {
  try {
    const response = await axiosInstance.delete(ApiRoutes.company.deletionRequest);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Could not cancel the deletion request."));
  }
};

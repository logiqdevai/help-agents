import { HttpMethods, type HttpMethod } from "@/features/integrations/interfaces/integrations.interfaces";

export const HttpMethodFormOptions: { id: HttpMethod; label: string }[] = [
  { id: HttpMethods.GET, label: "GET" },
  { id: HttpMethods.POST, label: "POST" },
  { id: HttpMethods.PUT, label: "PUT" },
  { id: HttpMethods.PATCH, label: "PATCH" },
  { id: HttpMethods.DELETE, label: "DELETE" },
];

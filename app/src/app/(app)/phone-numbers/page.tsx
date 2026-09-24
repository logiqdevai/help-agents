import type { Metadata } from "next";
import PhoneNumbersPage from "@/views/phone-numbers";

export const metadata: Metadata = { title: "Phone numbers" };

export default function Page() {
  return <PhoneNumbersPage />;
}

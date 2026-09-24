import type { CreateContactDto } from "@/features/contacts/interfaces/contacts.interfaces";

export const MaxImportRows = 500;

/** One contact per line: "name, phone, email" — the phone and email may come in either order and either may be left out. */
export function parseContactLines(text: string): CreateContactDto[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...rest] = line.split(/[,;\t]/).map((cell) => cell.trim());
      const contact: CreateContactDto = {};
      if (name) contact.name = name;
      for (const cell of rest.filter(Boolean)) {
        if (cell.includes("@")) contact.email = cell;
        else contact.phone = cell;
      }
      return contact;
    });
}

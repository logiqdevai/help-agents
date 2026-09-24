"use client";

import { useState, type FC } from "react";
import { SearchIcon, UserRoundIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetContacts } from "@/features/contacts/hooks/use-contacts";
import type { Contact } from "@/features/contacts/interfaces/contacts.interfaces";
import { useDebouncedValue } from "@/views/calls/hooks/use-debounced-value";

const RESULT_LIMIT = 6;

/** The part of a contact the picker needs, so callers can pre-select from any API shape. */
export type PickedContact = Pick<Contact, "id" | "name" | "phone"> & { integration: { name: string } | null };

interface ContactPickerProps {
  id?: string;
  value: PickedContact | null;
  onChange: (contact: PickedContact | null) => void;
}

/** Search contacts (including CRM records) and pick one; shows the pick as a removable chip. */
export const ContactPicker: FC<ContactPickerProps> = ({ id, value, onChange }) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debounced = useDebouncedValue(search.trim());
  const contacts = useGetContacts({ search: debounced || undefined, limit: RESULT_LIMIT });

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-input px-3 py-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <UserRoundIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{value.name ?? "Unnamed contact"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {[value.phone, value.integration?.name].filter(Boolean).join(" · ") || "No phone number"}
            </p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(null)} aria-label="Remove contact">
          <XIcon />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={id}
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search contacts or CRM records"
          autoComplete="off"
          className="pl-8"
        />
      </div>
      {isOpen ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {contacts.isPending ? (
            <div className="flex flex-col gap-2 p-2" aria-busy="true">
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
            </div>
          ) : contacts.isError ? (
            <p className="p-3 text-sm text-destructive">{contacts.error.message}</p>
          ) : contacts.data.data.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              No contacts found. Type a phone number below to call someone new.
            </p>
          ) : (
            <ul aria-label="Matching contacts" className="max-h-48 overflow-y-auto">
              {contacts.data.data.map((contact) => (
                <li key={contact.id}>
                  <button
                    type="button"
                    disabled={!contact.phone}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => {
                      onChange(contact);
                      setSearch("");
                      setIsOpen(false);
                    }}
                  >
                    <span className="min-w-0 truncate font-medium">{contact.name ?? "Unnamed contact"}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {contact.phone ?? "No phone number"}
                      {contact.integration ? ` · ${contact.integration.name}` : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
};

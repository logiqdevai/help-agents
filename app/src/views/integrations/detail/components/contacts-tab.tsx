"use client";

import { useState, type FC } from "react";
import { InfoIcon, SearchIcon, UploadIcon, UsersIcon, RefreshCwIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { CrmRecordTypeFormOptions } from "@/config/constants/dropdowns/integrations/crm-record-type-form.options";
import { useGetContacts } from "@/features/contacts/hooks/use-contacts";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { ImportContactsDialog } from "./import-contacts-dialog";
import { SyncContactDialog } from "./sync-contact-dialog";

const PageSize = 10;

interface ContactsTabProps {
  integrationId: string;
  integrationName: string;
  canWrite: boolean;
}

export const ContactsTab: FC<ContactsTabProps> = ({ integrationId, integrationName, canWrite }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [syncOpen, setSyncOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim());

  const contacts = useGetContacts({
    integration_uuid: integrationId,
    search: debouncedSearch,
    page,
    limit: PageSize,
  });

  const isFiltering = !!debouncedSearch;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted px-4 py-3.5 text-sm">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-body">
          We only keep a light record of who to call. Your real customer data stays in {integrationName}.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            className="pl-8"
            placeholder="Search name, phone or email"
            aria-label="Search contacts"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        {canWrite ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setSyncOpen(true)}>
              <RefreshCwIcon />
              Sync from CRM
            </Button>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <UploadIcon />
              Import
            </Button>
          </div>
        ) : null}
      </div>

      {contacts.isPending ? (
        <TableSkeleton rows={5} columns={6} />
      ) : contacts.isError ? (
        <ErrorState
          title="Could not load contacts"
          message={contacts.error.message}
          onRetry={() => void contacts.refetch()}
        />
      ) : contacts.data.data.length ? (
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CRM reference</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Record type</TableHead>
                  <TableHead className="text-right">CRM record</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.data.data.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-mono text-xs">{contact.external_id ?? "—"}</TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{contact.name ?? "—"}</span>
                      {contact.do_not_call ? (
                        <Badge variant="destructive" className="ml-2">
                          Do not call
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{contact.phone ?? "—"}</TableCell>
                    <TableCell>{contact.email ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getDropdownOptionLabel(CrmRecordTypeFormOptions, contact.record_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {contact.external_url ? (
                        <a
                          href={contact.external_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-sm underline underline-offset-4"
                        >
                          Open in CRM
                          <span className="sr-only"> for {contact.name ?? "this contact"}</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationControls pagination={contacts.data.pagination} onPageChange={setPage} noun="contacts" />
          <p className="text-sm text-muted-foreground">Contacts marked do-not-call are never dialled.</p>
        </div>
      ) : (
        <EmptyState
          icon={UsersIcon}
          title={isFiltering ? "No contacts match your search" : "No contacts from this CRM yet"}
          description={
            isFiltering
              ? "Try a different name, phone number or email."
              : `Sync a person from ${integrationName} or import a list, and agents can start calling them.`
          }
          action={
            canWrite && !isFiltering ? (
              <Button size="lg" onClick={() => setSyncOpen(true)}>
                <RefreshCwIcon />
                Sync from CRM
              </Button>
            ) : undefined
          }
        />
      )}

      <SyncContactDialog
        integrationId={integrationId}
        integrationName={integrationName}
        open={syncOpen}
        onOpenChange={setSyncOpen}
      />
      <ImportContactsDialog
        integrationId={integrationId}
        integrationName={integrationName}
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </div>
  );
};

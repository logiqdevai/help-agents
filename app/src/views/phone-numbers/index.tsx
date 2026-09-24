"use client";

import type { FC } from "react";
import { useState } from "react";
import { PhoneIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageHeader } from "@/components/ui/page-header";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoneNumberTabFilterOptions } from "@/config/constants/dropdowns/phone-numbers/phone-number-tab-filter.options";
import { Permissions } from "@/config/constants/permissions";
import {
  useAssignPhoneNumberAgent,
  useGetPhoneNumbers,
  useReleasePhoneNumber,
} from "@/features/phone-numbers/hooks/use-phone-numbers";
import {
  PhoneNumberSources,
  PhoneNumberStatuses,
  PhoneNumberTabs,
  type PhoneNumber,
  type PhoneNumberTab,
} from "@/features/phone-numbers/interfaces/phone-numbers.interfaces";
import { usePermissions } from "@/hooks/use-permissions";
import { AddPhoneNumberDialog } from "./components/add-phone-number-dialog";
import { AssignAgentDialog } from "./components/assign-agent-dialog";
import { EditLabelDialog } from "./components/edit-label-dialog";
import { PhoneNumberCard } from "./components/phone-number-card";

// Numbers are few per company, so one large page holds them all and the tabs filter it locally.
const PAGE_SIZE = 100;

const matchesTab = (phone: PhoneNumber, tab: PhoneNumberTab) => {
  if (tab === PhoneNumberTabs.ACTIVE) return phone.status === PhoneNumberStatuses.ACTIVE;
  if (tab === PhoneNumberTabs.ATTENTION) {
    return phone.status === PhoneNumberStatuses.PENDING || phone.status === PhoneNumberStatuses.ERROR;
  }
  return true;
};

const PhoneNumbersPage: FC = () => {
  const { can } = usePermissions();
  const canManage = can(Permissions.PHONE_NUMBERS_MANAGE);

  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<PhoneNumberTab>(PhoneNumberTabs.ALL);
  const [addOpen, setAddOpen] = useState(false);
  const [labelTarget, setLabelTarget] = useState<PhoneNumber | null>(null);
  const [assignTarget, setAssignTarget] = useState<PhoneNumber | null>(null);
  const [unassignTarget, setUnassignTarget] = useState<PhoneNumber | null>(null);
  const [releaseTarget, setReleaseTarget] = useState<PhoneNumber | null>(null);

  const numbers = useGetPhoneNumbers({
    page,
    limit: PAGE_SIZE,
    order_by: "created_at",
    order_direction: "desc",
  });
  const assign = useAssignPhoneNumberAgent();
  const release = useReleasePhoneNumber();

  const all = numbers.data?.data ?? [];
  const visible = all.filter((phone) => matchesTab(phone, tab));
  const releaseIsOwn = releaseTarget?.source === PhoneNumberSources.BYO;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Phone numbers"
        description="Numbers your agents call from and answer on. Get a new one in minutes or bring the number your customers already know."
        actions={
          canManage ? (
            <Button onClick={() => setAddOpen(true)}>
              <PlusIcon aria-hidden="true" />
              Add phone number
            </Button>
          ) : null
        }
      />

      {numbers.isPending ? (
        <div className="grid gap-4 md:grid-cols-2" aria-busy="true">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="gap-0 py-0">
              <div className="flex flex-col gap-3 p-6">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-3 h-4 w-44" />
                <Skeleton className="h-4 w-52" />
              </div>
              <Skeleton className="h-14 w-full rounded-none" />
            </Card>
          ))}
        </div>
      ) : null}

      {numbers.isError ? (
        <ErrorState
          title="Could not load phone numbers"
          message={numbers.error.message}
          onRetry={() => numbers.refetch()}
        />
      ) : null}

      {numbers.data && all.length === 0 ? (
        <EmptyState
          icon={PhoneIcon}
          title="No phone numbers yet"
          description="Get a new number or bring your own, then assign it to an agent so it can call and answer."
          action={
            canManage ? (
              <Button onClick={() => setAddOpen(true)}>
                <PlusIcon aria-hidden="true" />
                Add phone number
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {numbers.data && all.length > 0 ? (
        <>
          <Tabs value={tab} onValueChange={(next) => setTab(next as PhoneNumberTab)}>
            <TabsList aria-label="Filter phone numbers">
              {PhoneNumberTabFilterOptions.map((option) => (
                <TabsTrigger key={option.id} value={option.id} className="px-3">
                  {option.label}
                  <span className="text-muted-foreground tabular-nums">
                    {all.filter((phone) => matchesTab(phone, option.id)).length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {visible.length === 0 ? (
            <EmptyState
              icon={PhoneIcon}
              title={tab === PhoneNumberTabs.ATTENTION ? "Nothing needs attention" : "No active numbers yet"}
              description={
                tab === PhoneNumberTabs.ATTENTION
                  ? "Every phone number is active."
                  : "Numbers appear here once they are active."
              }
            />
          ) : (
            <section className="grid gap-4 md:grid-cols-2" aria-label="Phone numbers">
              {visible.map((phone) => (
                <PhoneNumberCard
                  key={phone.id}
                  phone={phone}
                  canManage={canManage}
                  onEditLabel={setLabelTarget}
                  onAssign={setAssignTarget}
                  onUnassign={setUnassignTarget}
                  onRelease={setReleaseTarget}
                />
              ))}
            </section>
          )}

          <PaginationControls pagination={numbers.data.pagination} onPageChange={setPage} noun="phone numbers" />
        </>
      ) : null}

      <AddPhoneNumberDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditLabelDialog phone={labelTarget} onClose={() => setLabelTarget(null)} />
      <AssignAgentDialog phone={assignTarget} onClose={() => setAssignTarget(null)} />

      <ConfirmationDialog
        open={unassignTarget !== null}
        onOpenChange={(open) => !open && setUnassignTarget(null)}
        variant="default"
        title="Unassign this number?"
        description={
          unassignTarget
            ? `${unassignTarget.agent?.name ?? "The agent"} stops answering and calling on ${unassignTarget.number}. You can assign an agent again at any time.`
            : undefined
        }
        confirmLabel="Unassign"
        isPending={assign.isPending}
        onConfirm={() => assign.mutateAsync({ id: unassignTarget?.id ?? "", agent_uuid: null })}
      />

      <ConfirmationDialog
        open={releaseTarget !== null}
        onOpenChange={(open) => !open && setReleaseTarget(null)}
        title={releaseIsOwn ? "Remove this number?" : "Release this number?"}
        description={
          releaseIsOwn
            ? "The agent stops answering and calling on it straight away. The number stays with your carrier. Past calls stay in your history."
            : "The agent stops answering and calling on it straight away. A released number may not come back. Past calls stay in your history."
        }
        confirmLabel={releaseIsOwn ? "Remove number" : "Release number"}
        isPending={release.isPending}
        onConfirm={() => release.mutateAsync(releaseTarget?.id ?? "")}
      />
    </div>
  );
};

export default PhoneNumbersPage;

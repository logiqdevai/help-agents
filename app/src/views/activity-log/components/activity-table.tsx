import { Fragment, type FC } from "react";
import Link from "next/link";
import { BotIcon, ZapIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActivityActorTypeFormOptions } from "@/config/constants/dropdowns/activity/activity-actor-filter.options";
import { getActivityActionLabel } from "@/config/constants/dropdowns/activity/activity-action-form.options";
import { ActorTypes, type ActivityLogEntry } from "@/features/activity-log/interfaces/activity-log.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { formatTime, initialsOf } from "@/lib/format";
import { getActivityDetail } from "@/views/activity-log/utils/activity-detail";
import { getActivityEntity } from "@/views/activity-log/utils/activity-entity";
import { groupActivityByDay } from "@/views/activity-log/utils/group-by-day";

const avatarClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-medium [&>svg]:size-3.5";

const ActorCell: FC<{ entry: ActivityLogEntry }> = ({ entry }) => {
  if (entry.actor) {
    return (
      <span className="flex items-center gap-2.5">
        <span aria-hidden="true" className={avatarClass}>
          {initialsOf(entry.actor.name ?? entry.actor.email)}
        </span>
        <span className="truncate">{entry.actor.name ?? entry.actor.email}</span>
      </span>
    );
  }
  const Icon = entry.actor_type === ActorTypes.AGENT ? BotIcon : ZapIcon;
  return (
    <span className="flex items-center gap-2.5">
      <span aria-hidden="true" className={avatarClass}>
        <Icon />
      </span>
      {getDropdownOptionLabel(ActivityActorTypeFormOptions, entry.actor_type)}
    </span>
  );
};

interface ActivityTableProps {
  entries: ActivityLogEntry[];
}

export const ActivityTable: FC<ActivityTableProps> = ({ entries }) => {
  const groups = groupActivityByDay(entries);

  return (
    <Card className="gap-0 py-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-11 px-6">Time</TableHead>
            <TableHead>Who</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Affected</TableHead>
            <TableHead className="px-6">IP address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <Fragment key={group.key}>
              <TableRow className="bg-muted/60 hover:bg-muted/60">
                <TableCell colSpan={5} className="px-6 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  {group.label}
                </TableCell>
              </TableRow>
              {group.entries.map((entry) => {
                const entity = getActivityEntity(entry);
                const detail = getActivityDetail(entry);
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="px-6 py-3 whitespace-nowrap text-muted-foreground tabular-nums">
                      {formatTime(entry.created_at)}
                    </TableCell>
                    <TableCell>
                      <ActorCell entry={entry} />
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      {getActivityActionLabel(entry.action)}
                      {detail ? <span className="text-muted-foreground"> ({detail})</span> : null}
                    </TableCell>
                    <TableCell>
                      {entity ? (
                        entity.href ? (
                          <Link href={entity.href} className="font-medium underline-offset-4 hover:underline">
                            {entity.label}
                          </Link>
                        ) : (
                          <span className="font-medium">{entity.label}</span>
                        )
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 font-mono text-xs text-muted-foreground">
                      {entry.ip_address ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@ui/components/ui/card";
import { Badge } from "@ui/components/ui/badge";
import { Button } from "@ui/components/ui/button";
import { Skeleton } from "@ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@ui/components/ui/dialog";
import { MESSAGE_STATUS, MESSAGE_STATUS_VARIANT } from "../constants/app";
import { formatDateTime } from "../lib/format";
import { messages } from "../lib/resources";
import type { Message } from "../types/domain";
import { cn } from "@ui/lib/utils";

export default function MessagesPage() {
  const { data, isLoading } = messages.useList();
  const updateMessage = messages.useUpdate();
  const [selected, setSelected] = useState<Message | null>(null);

  const setStatus = (message: Message, status: string) => {
    updateMessage.mutate(
      { id: message.id, input: { status } },
      {
        onSuccess: () => {
          toast.success(`Message ${status.toLowerCase()}`);
          if (status === MESSAGE_STATUS.Archived) setSelected(null);
        },
        onError: () => toast.error("Failed to update message"),
      },
    );
  };

  const open = (message: Message) => {
    setSelected(message);
    if (message.status === MESSAGE_STATUS.Unread) setStatus(message, MESSAGE_STATUS.Read);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((message) => (
                <TableRow
                  key={message.id}
                  className="cursor-pointer"
                  onClick={() => open(message)}
                >
                  <TableCell>
                    <div
                      className={cn(
                        "font-medium",
                        message.status === MESSAGE_STATUS.Unread && "font-bold",
                      )}
                    >
                      {message.name}
                    </div>
                    <div className="text-muted-foreground text-xs">{message.email}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {message.subject ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={MESSAGE_STATUS_VARIANT[message.status] ?? "secondary"}>
                      {message.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right text-xs">
                    {formatDateTime(message.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject ?? "Enquiry"}</DialogTitle>
                <DialogDescription>
                  {selected.name} · {selected.email} · {formatDateTime(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <p className="text-sm whitespace-pre-wrap">{selected.body}</p>
              <DialogFooter>
                {selected.status !== MESSAGE_STATUS.Archived ? (
                  <Button
                    variant="outline"
                    disabled={updateMessage.isPending}
                    onClick={() => setStatus(selected, MESSAGE_STATUS.Archived)}
                  >
                    Archive
                  </Button>
                ) : null}
                <Button asChild>
                  <a href={`mailto:${selected.email}`}>Reply</a>
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

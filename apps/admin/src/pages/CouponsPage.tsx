import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
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
} from "@ui/components/ui/dialog";
import { AutoForm } from "@ui/components/ui/auto-form";
import { coupons } from "../lib/resources";
import { COUPONS_COPY } from "../constants/app";

const couponSchema = z.object({
  code: z.string().min(1),
  type: z.enum(["percent", "fixed"]),
  value: z.number().min(0),
  minSubtotal: z.number().min(0),
  active: z.enum(["Active", "Inactive"]),
});

export default function CouponsPage() {
  const { data, isLoading } = coupons.useList();
  const create = coupons.useCreate();
  const remove = coupons.useRemove();
  const [creating, setCreating] = useState(false);

  const onSubmit = (v: z.infer<typeof couponSchema>) => {
    create.mutate(
      {
        code: v.code,
        type: v.type,
        value: v.value,
        minSubtotal: v.minSubtotal,
        active: v.active === "Active",
      },
      {
        onSuccess: () => { toast.success("Coupon created"); setCreating(false); },
        onError: () => toast.error("Create failed"),
      },
    );
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" /> {COUPONS_COPY.newCoupon}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-muted-foreground text-sm">{COUPONS_COPY.empty}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{COUPONS_COPY.code}</TableHead>
                <TableHead>{COUPONS_COPY.type}</TableHead>
                <TableHead className="text-right">{COUPONS_COPY.value}</TableHead>
                <TableHead className="text-right">{COUPONS_COPY.minSubtotal}</TableHead>
                <TableHead>{COUPONS_COPY.active}</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-medium">{c.code}</TableCell>
                  <TableCell>{c.type}</TableCell>
                  <TableCell className="text-right">
                    {c.type === "percent" ? `${c.value}%` : c.value}
                  </TableCell>
                  <TableCell className="text-right">{c.minSubtotal}</TableCell>
                  <TableCell>
                    <Badge variant={c.active ? "default" : "secondary"}>
                      {c.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        remove.mutate(c.id, {
                          onSuccess: () => toast.success("Coupon deleted"),
                          onError: () => toast.error("Delete failed"),
                        })
                      }
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{COUPONS_COPY.newCoupon}</DialogTitle>
          </DialogHeader>
          <AutoForm
            schema={couponSchema}
            onSubmit={onSubmit}
            submitText={COUPONS_COPY.create}
            defaultValues={{ type: "percent", active: "Active", minSubtotal: 0 }}
            fieldConfig={{
              code: { label: COUPONS_COPY.code, placeholder: "WELCOME10" },
              type: {
                type: "select",
                options: [
                  { label: COUPONS_COPY.percent, value: "percent" },
                  { label: COUPONS_COPY.fixed, value: "fixed" },
                ],
              },
              value: { label: COUPONS_COPY.value, type: "number" },
              minSubtotal: { label: COUPONS_COPY.minSubtotal, type: "number" },
              active: {
                type: "select",
                options: [
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ],
              },
            }}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

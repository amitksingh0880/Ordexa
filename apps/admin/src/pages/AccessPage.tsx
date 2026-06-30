import { useState } from "react";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw, Plus, Trash2, ShieldCheck, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/components/ui/card";
import { Button } from "@ui/components/ui/button";
import { Badge } from "@ui/components/ui/badge";
import { Checkbox } from "@ui/components/ui/checkbox";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/components/ui/dialog";
import { AutoForm } from "@ui/components/ui/auto-form";
import { accessApi } from "../lib/access";
import { ACCESS_COPY } from "../constants/app";
import type { AccessRole, AccessUser } from "../types/domain";

const roleSchema = z.object({
  roleName: z.string().min(1),
  description: z.string().optional(),
  isSuperAdmin: z.enum(["Yes", "No"]),
});

function useAccessQueries() {
  const permissions = useQuery({ queryKey: ["access", "permissions"], queryFn: accessApi.permissions });
  const roles = useQuery({ queryKey: ["access", "roles"], queryFn: accessApi.roles });
  const users = useQuery({ queryKey: ["access", "users"], queryFn: accessApi.users });
  return { permissions, roles, users };
}

export default function AccessPage() {
  const qc = useQueryClient();
  const { permissions, roles, users } = useAccessQueries();
  const [creatingRole, setCreatingRole] = useState(false);
  const [permRole, setPermRole] = useState<AccessRole | null>(null);
  const [roleUser, setRoleUser] = useState<AccessUser | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["access"] });

  const sync = useMutation({
    mutationFn: accessApi.sync,
    onSuccess: (n) => { toast.success(`${n} permissions synced`); invalidate(); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">{ACCESS_COPY.title}</h1>
        <Button variant="outline" size="sm" onClick={() => sync.mutate()} disabled={sync.isPending}>
          <RefreshCw className="size-4" /> {ACCESS_COPY.sync}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">{ACCESS_COPY.roles}</CardTitle>
          <Button size="sm" onClick={() => setCreatingRole(true)}>
            <Plus className="size-4" /> {ACCESS_COPY.newRole}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>ARNs</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(roles.data ?? []).map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    {role.roleName}
                    {role.isSuperAdmin ? (
                      <Badge className="ml-2"><ShieldCheck className="size-3" /> {ACCESS_COPY.superAdmin}</Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {role.isSuperAdmin ? "All" : role.assignedArns.length}
                  </TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setPermRole(role)} disabled={role.isSuperAdmin}>
                      <KeyRound className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => accessApi.deleteRole(role.id).then(() => { toast.success("Role deleted"); invalidate(); })}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{ACCESS_COPY.users}</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users.data ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-muted-foreground">{u.roleIds.length}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => setRoleUser(u)}>
                      {ACCESS_COPY.assignRoles}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={creatingRole} onOpenChange={setCreatingRole}>
        <DialogContent>
          <DialogHeader><DialogTitle>{ACCESS_COPY.newRole}</DialogTitle></DialogHeader>
          <AutoForm
            schema={roleSchema}
            submitText={ACCESS_COPY.save}
            defaultValues={{ isSuperAdmin: "No" }}
            fieldConfig={{
              isSuperAdmin: {
                type: "select",
                options: [
                  { label: "No", value: "No" },
                  { label: "Yes", value: "Yes" },
                ],
              },
            }}
            onSubmit={async (v) => {
              await accessApi.saveRole({
                roleName: v.roleName,
                description: v.description,
                isSuperAdmin: v.isSuperAdmin === "Yes",
              });
              toast.success("Role saved");
              setCreatingRole(false);
              invalidate();
            }}
          />
        </DialogContent>
      </Dialog>

      {permRole ? (
        <AssignDialog
          title={`${permRole.roleName} · ${ACCESS_COPY.permissions}`}
          items={(permissions.data ?? []).map((p) => ({
            id: p.id,
            label: p.permissionName,
            hint: p.resourceArn,
            checked: permRole.assignedArns.includes(p.resourceArn),
          }))}
          onClose={() => setPermRole(null)}
          onSave={async (ids) => {
            await accessApi.assignRolePermissions(permRole.id, ids);
            toast.success("Permissions updated");
            setPermRole(null);
            invalidate();
          }}
        />
      ) : null}

      {roleUser ? (
        <AssignDialog
          title={`${roleUser.name} · ${ACCESS_COPY.roles}`}
          items={(roles.data ?? []).map((r) => ({
            id: r.id,
            label: r.roleName,
            hint: r.isSuperAdmin ? ACCESS_COPY.superAdmin : "",
            checked: roleUser.roleIds.includes(r.id),
          }))}
          onClose={() => setRoleUser(null)}
          onSave={async (ids) => {
            await accessApi.assignUserRoles(roleUser.id, ids);
            toast.success("Roles updated");
            setRoleUser(null);
            invalidate();
          }}
        />
      ) : null}
    </div>
  );
}

function AssignDialog({
  title,
  items,
  onClose,
  onSave,
}: {
  title: string;
  items: { id: string; label: string; hint: string; checked: boolean }[];
  onClose: () => void;
  onSave: (ids: string[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(items.filter((i) => i.checked).map((i) => i.id)),
  );
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="space-y-2">
          {items.map((item) => (
            <label key={item.id} className="flex items-center gap-3 rounded-md border p-2">
              <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggle(item.id)} />
              <span className="flex-1">
                <span className="text-sm font-medium">{item.label}</span>
                {item.hint ? <span className="block text-xs text-muted-foreground">{item.hint}</span> : null}
              </span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave([...selected])}>{ACCESS_COPY.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

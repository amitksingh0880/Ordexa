import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/ui/select";
import { tenantsApi } from "../lib/tenants";
import { getTenantId, setTenantId } from "../lib/http";
import { useAuth } from "../context/auth-context";

export function TenantPicker() {
  const { isGlobalSuper } = useAuth();
  const qc = useQueryClient();
  const [selected, setSelected] = useState(getTenantId() ?? "");
  const { data } = useQuery({
    queryKey: ["tenants"],
    queryFn: tenantsApi.list,
    enabled: isGlobalSuper,
  });

  if (!isGlobalSuper || !data || data.length <= 1) return null;

  return (
    <Select
      value={selected}
      onValueChange={(value) => {
        setSelected(value);
        setTenantId(value);
        qc.invalidateQueries();
      }}
    >
      <SelectTrigger className="h-8 w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {data.map((tenant) => (
          <SelectItem key={tenant.id} value={tenant.id}>
            {tenant.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@ui/components/ui/card";
import { Badge } from "@ui/components/ui/badge";
import { Skeleton } from "@ui/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/components/ui/table";
import { accessApi } from "../lib/access";
import { CUSTOMERS_COPY } from "../constants/app";

export default function CustomersPage() {
  const { data, isLoading } = useQuery({ queryKey: ["access", "users"], queryFn: accessApi.users });

  return (
    <Card>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-muted-foreground text-sm">{CUSTOMERS_COPY.empty}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{CUSTOMERS_COPY.name}</TableHead>
                <TableHead>{CUSTOMERS_COPY.email}</TableHead>
                <TableHead>{CUSTOMERS_COPY.role}</TableHead>
                <TableHead className="text-right">{CUSTOMERS_COPY.orders}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{c.orderCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

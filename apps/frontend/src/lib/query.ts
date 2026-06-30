import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { createCrudClient, type CrudClient, type ListParams } from "./crud";

type QueryOpts<TData> = Omit<
  UseQueryOptions<TData, Error>,
  "queryKey" | "queryFn"
>;

export interface ResourceHooks<T> {
  client: CrudClient<T>;
  keys: {
    all: readonly unknown[];
    list: (params?: ListParams) => readonly unknown[];
    detail: (id: string) => readonly unknown[];
  };
  useList: (params?: ListParams, options?: QueryOpts<T[]>) => ReturnType<typeof useQuery<T[], Error>>;
  useGet: (id: string | undefined, options?: QueryOpts<T>) => ReturnType<typeof useQuery<T, Error>>;
  useCreate: () => ReturnType<typeof useMutation<T, Error, Partial<T>>>;
  useUpdate: () => ReturnType<typeof useMutation<T, Error, { id: string; input: Partial<T> }>>;
  useRemove: () => ReturnType<typeof useMutation<void, Error, string>>;
}

export function createResource<T extends { id: string }>(
  resource: string,
): ResourceHooks<T> {
  const client = createCrudClient<T>(resource);

  const keys = {
    all: [resource] as const,
    list: (params?: ListParams) => [resource, "list", params ?? {}] as const,
    detail: (id: string) => [resource, "detail", id] as const,
  };

  const useList = (params?: ListParams, options?: QueryOpts<T[]>) =>
    useQuery<T[], Error>({
      queryKey: keys.list(params),
      queryFn: () => client.list(params),
      ...options,
    });

  const useGet = (id: string | undefined, options?: QueryOpts<T>) =>
    useQuery<T, Error>({
      queryKey: keys.detail(id ?? ""),
      queryFn: () => client.get(id as string),
      enabled: Boolean(id),
      ...options,
    });

  const useCreate = () => {
    const qc = useQueryClient();
    return useMutation<T, Error, Partial<T>>({
      mutationFn: (input) => client.create(input),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
  };

  const useUpdate = () => {
    const qc = useQueryClient();
    return useMutation<T, Error, { id: string; input: Partial<T> }>({
      mutationFn: ({ id, input }) => client.update(id, input),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
  };

  const useRemove = () => {
    const qc = useQueryClient();
    return useMutation<void, Error, string>({
      mutationFn: (id) => client.remove(id),
      onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
    });
  };

  return { client, keys, useList, useGet, useCreate, useUpdate, useRemove };
}

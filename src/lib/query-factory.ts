import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'

export function createUseDetailQuery<T>(getKey: (id: string) => QueryKey, fetchFn: (id: string) => Promise<T>) {
  return function useDetailQuery(id: string | undefined) {
    return useQuery({
      queryKey: getKey(id ?? ''),
      queryFn: () => fetchFn(id as string),
      enabled: Boolean(id),
    })
  }
}

interface CreateUseDeleteMutationOptions {
  deleteFn: (id: string) => Promise<void>
  detailKey: (id: string) => QueryKey
  invalidateKeys: QueryKey[]
}

export function createUseDeleteMutation({ deleteFn, detailKey, invalidateKeys }: CreateUseDeleteMutationOptions) {
  return function useDeleteMutation() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: deleteFn,
      onSuccess: (_, id) => {
        queryClient.removeQueries({ queryKey: detailKey(id) })
        invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
      },
    })
  }
}

interface CreateUseCreateMutationOptions<TInput, TOutput> {
  createFn: (input: TInput) => Promise<TOutput>
  invalidateKeys: QueryKey[]
}

export function createUseCreateMutation<TInput, TOutput>({
  createFn,
  invalidateKeys,
}: CreateUseCreateMutationOptions<TInput, TOutput>) {
  return function useCreateMutation() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: createFn,
      onSuccess: () => {
        invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
      },
    })
  }
}

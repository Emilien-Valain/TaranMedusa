import { FetchError } from "@medusajs/js-sdk";
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { queryKeysFactory } from "../../lib/query-key-factory";
import { sdk } from "../../lib/client";

export type ShippingWeightTier = {
  id: string;
  min_weight: number;
  max_weight: number;
  price: number | string;
};

export type ShippingWeightProfile = {
  id: string;
  name: string;
  description?: string | null;
  free_shipping_threshold?: number | string | null;
  currency_code: string;
  is_active: boolean;
  tiers?: ShippingWeightTier[];
};

export type ShippingWeightProfilesResponse = {
  profiles: ShippingWeightProfile[];
};

export type ShippingWeightProfileResponse = {
  profile: ShippingWeightProfile;
};

export type ShippingWeightTierResponse = {
  tier: ShippingWeightTier;
};

export type CreateProfilePayload = {
  name: string;
  description?: string | null;
  free_shipping_threshold?: number | null;
  currency_code?: string;
  is_active?: boolean;
};

export type UpdateProfilePayload = Partial<CreateProfilePayload>;

export type CreateTierPayload = {
  min_weight: number;
  max_weight: number;
  price: number;
};

export type UpdateTierPayload = Partial<CreateTierPayload>;

export const shippingWeightQueryKey = queryKeysFactory("shipping-weight");

const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({
    queryKey: shippingWeightQueryKey.all,
    refetchType: "all",
  });
};

export const useShippingWeightProfiles = (
  options?: UseQueryOptions<
    ShippingWeightProfilesResponse,
    FetchError,
    ShippingWeightProfilesResponse,
    QueryKey
  >
) => {
  return useQuery({
    queryKey: shippingWeightQueryKey.lists(),
    queryFn: () =>
      sdk.client.fetch<ShippingWeightProfilesResponse>(
        "/admin/shipping-weight/profiles",
        { method: "GET" }
      ),
    staleTime: 0,
    ...options,
  });
};

export const useShippingWeightProfile = (
  id: string,
  options?: UseQueryOptions<
    ShippingWeightProfileResponse,
    FetchError,
    ShippingWeightProfileResponse,
    QueryKey
  >
) => {
  return useQuery({
    queryKey: shippingWeightQueryKey.detail(id),
    queryFn: () =>
      sdk.client.fetch<ShippingWeightProfileResponse>(
        `/admin/shipping-weight/profiles/${id}`,
        { method: "GET" }
      ),
    staleTime: 0,
    ...options,
  });
};

export const useCreateShippingWeightProfile = (
  options?: UseMutationOptions<
    ShippingWeightProfileResponse,
    FetchError,
    CreateProfilePayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      sdk.client.fetch<ShippingWeightProfileResponse>(
        "/admin/shipping-weight/profiles",
        {
          method: "POST",
          body: payload,
        }
      ),
    ...options,
    onSuccess: (data, variables, context) => {
      invalidateAll(queryClient);
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useUpdateShippingWeightProfile = (
  id: string,
  options?: UseMutationOptions<
    ShippingWeightProfileResponse,
    FetchError,
    UpdateProfilePayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      sdk.client.fetch<ShippingWeightProfileResponse>(
        `/admin/shipping-weight/profiles/${id}`,
        {
          method: "POST",
          body: payload,
        }
      ),
    ...options,
    onSuccess: (data, variables, context) => {
      invalidateAll(queryClient);
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useDeleteShippingWeightProfile = (
  options?: UseMutationOptions<unknown, FetchError, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) =>
      sdk.client.fetch(`/admin/shipping-weight/profiles/${id}`, {
        method: "DELETE",
      }),
    ...options,
    onSuccess: (data, variables, context) => {
      invalidateAll(queryClient);
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useCreateShippingWeightTier = (
  profileId: string,
  options?: UseMutationOptions<
    ShippingWeightTierResponse,
    FetchError,
    CreateTierPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      sdk.client.fetch<ShippingWeightTierResponse>(
        `/admin/shipping-weight/profiles/${profileId}/tiers`,
        {
          method: "POST",
          body: payload,
        }
      ),
    ...options,
    onSuccess: (data, variables, context) => {
      invalidateAll(queryClient);
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useUpdateShippingWeightTier = (
  profileId: string,
  tierId: string,
  options?: UseMutationOptions<
    ShippingWeightTierResponse,
    FetchError,
    UpdateTierPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      sdk.client.fetch<ShippingWeightTierResponse>(
        `/admin/shipping-weight/profiles/${profileId}/tiers/${tierId}`,
        {
          method: "POST",
          body: payload,
        }
      ),
    ...options,
    onSuccess: (data, variables, context) => {
      invalidateAll(queryClient);
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export const useDeleteShippingWeightTier = (
  profileId: string,
  options?: UseMutationOptions<unknown, FetchError, string>
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tierId) =>
      sdk.client.fetch(
        `/admin/shipping-weight/profiles/${profileId}/tiers/${tierId}`,
        {
          method: "DELETE",
        }
      ),
    ...options,
    onSuccess: (data, variables, context) => {
      invalidateAll(queryClient);
      options?.onSuccess?.(data, variables, context);
    },
  });
};

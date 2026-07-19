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

export type ColissimoProductCode = "DOM" | "DOS";

export type ShippingWeightProfile = {
  id: string;
  name: string;
  description?: string | null;
  free_shipping_threshold?: number | string | null;
  currency_code: string;
  is_active: boolean;
  colissimo_product_code?: ColissimoProductCode | null;
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
  colissimo_product_code?: ColissimoProductCode | null;
};

export type UpdateProfilePayload = Partial<CreateProfilePayload>;

export type CreateTierPayload = {
  min_weight: number;
  max_weight: number;
  price: number;
};

export type UpdateTierPayload = Partial<CreateTierPayload>;

export type ColissimoConfig = {
  id: string;
  enabled: boolean;
  api_key_set?: boolean;
  password_set?: boolean;
  contract_number?: string | null;
  label_format?: string | null;
  sender_name?: string | null;
  sender_street?: string | null;
  sender_street2?: string | null;
  sender_zip?: string | null;
  sender_city?: string | null;
  sender_country?: string | null;
  sender_phone?: string | null;
  sender_email?: string | null;
};

export type ColissimoConfigResponse = { colissimo_config: ColissimoConfig };

export type UpdateColissimoConfigPayload = Partial<{
  enabled: boolean;
  api_key: string | null;
  contract_number: string | null;
  password: string | null;
  // Effacement explicite d'un secret (un champ vide, lui, conserve l'existant).
  clear_api_key: boolean;
  clear_password: boolean;
  label_format: string | null;
  sender_name: string | null;
  sender_street: string | null;
  sender_street2: string | null;
  sender_zip: string | null;
  sender_city: string | null;
  sender_country: string | null;
  sender_phone: string | null;
  sender_email: string | null;
}>;

export const shippingWeightQueryKey = queryKeysFactory("shipping-weight");
export const colissimoConfigQueryKey = queryKeysFactory("colissimo-config");

export const useColissimoConfig = (
  options?: UseQueryOptions<
    ColissimoConfigResponse,
    FetchError,
    ColissimoConfigResponse,
    QueryKey
  >
) => {
  return useQuery({
    queryKey: colissimoConfigQueryKey.details(),
    queryFn: () =>
      sdk.client.fetch<ColissimoConfigResponse>("/admin/colissimo-config", {
        method: "GET",
      }),
    staleTime: 0,
    ...options,
  });
};

export const useUpdateColissimoConfig = (
  options?: UseMutationOptions<
    ColissimoConfigResponse,
    FetchError,
    UpdateColissimoConfigPayload
  >
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) =>
      sdk.client.fetch<ColissimoConfigResponse>("/admin/colissimo-config", {
        method: "POST",
        body: payload,
      }),
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: colissimoConfigQueryKey.all,
        refetchType: "all",
      });
      options?.onSuccess?.(data, variables, context);
    },
  });
};

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

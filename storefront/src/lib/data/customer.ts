"use server"

import { sdk } from "@/lib/config"
import medusaError from "@/lib/util/medusa-error"
import { B2BCustomer } from "@/types/global"
import { HttpTypes } from "@medusajs/types"
import { track } from "@vercel/analytics/server"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { retrieveCart, updateCart } from "./cart"
import { createCompany, createEmployee } from "./companies"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"

export const retrieveCustomer = async (): Promise<B2BCustomer | null> => {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders) return null

  const headers = {
    ...authHeaders,
  }

  const next = {
    ...(await getCacheOptions("customers")),
  }

  return await sdk.client
    .fetch<{ customer: B2BCustomer }>(`/store/customers/me`, {
      method: "GET",
      query: {
        fields: "*employee, *orders",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ customer }) => customer as B2BCustomer)
    .catch(() => null)
}

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const isCompany = formData.get("is_company") === "true"
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
    company_name: isCompany ? (formData.get("company_name") as string) : undefined,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    const customHeaders = { authorization: `Bearer ${token}` }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      customHeaders
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    const sessionHeaders = { authorization: `Bearer ${loginToken}` }

    if (isCompany) {
      const companyForm = {
        name: formData.get("company_name") as string,
        email: formData.get("email") as string,
        phone: formData.get("company_phone") as string,
        address: formData.get("company_address") as string,
        city: formData.get("company_city") as string,
        state: formData.get("company_state") as string,
        zip: formData.get("company_zip") as string,
        country: formData.get("company_country") as string,
        currency_code: formData.get("currency_code") as string,
      }

      const createdCompany = await createCompany(companyForm)

      await createEmployee({
        company_id: createdCompany?.id as string,
        customer_id: createdCustomer.id,
        is_admin: true,
        spending_limit: 0,
      }).catch((err) => {
        console.log("error creating employee", err)
      })

      // Auto-save company address as customer default address
      if (companyForm.address && companyForm.city && companyForm.zip && companyForm.country) {
        await sdk.store.customer
          .createAddress(
            {
              first_name: customerForm.first_name,
              last_name: customerForm.last_name,
              company: companyForm.name,
              address_1: companyForm.address,
              city: companyForm.city,
              postal_code: companyForm.zip,
              province: companyForm.state || undefined,
              country_code: companyForm.country,
              phone: companyForm.phone || undefined,
            },
            {},
            sessionHeaders
          )
          .then(() => console.log("company address saved successfully"))
          .catch((err) => {
            console.error("error saving company address:", err)
          })
      }
    }

    const cacheTag = await getCacheTag("customers")
    revalidateTag(cacheTag)

    await transferCart()

    return { customer: createdCustomer }
  } catch (error: any) {
    console.log("error", error)
    return error.toString()
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        track("customer_logged_in")
        await setAuthToken(token as string)

        const [customerCacheTag, productsCacheTag, cartsCacheTag] =
          await Promise.all([
            getCacheTag("customers"),
            getCacheTag("products"),
            getCacheTag("carts"),
          ])

        revalidateTag(customerCacheTag)

        const customer = await retrieveCustomer()
        const cart = await retrieveCart()

        if (customer?.employee?.company_id) {
          await updateCart({
            metadata: {
              ...cart?.metadata,
              company_id: customer.employee.company_id,
            },
          })
        }

        revalidateTag(productsCacheTag)
        revalidateTag(cartsCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }

  try {
    await transferCart()
  } catch (error: any) {
    return error.toString()
  }
}

export async function signout(countryCode: string, customerId: string) {
  await sdk.auth.logout()
  await removeAuthToken()
  track("customer_logged_out")

  // remove next line if want the cart to persist after logout
  await removeCartId()

  const [authCacheTag, customerCacheTag, productsCacheTag, cartsCacheTag] =
    await Promise.all([
      getCacheTag("auth"),
      getCacheTag("customers"),
      getCacheTag("products"),
      getCacheTag("carts"),
    ])

  revalidateTag(authCacheTag)
  revalidateTag(customerCacheTag)
  revalidateTag(productsCacheTag)
  revalidateTag(cartsCacheTag)

  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")

  revalidateTag(cartCacheTag)
}

export const updatePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  const customer = await retrieveCustomer()

  if (!customer?.email) {
    return { success: false, error: "Client introuvable" }
  }

  // Login with current password to get a fresh token for the update endpoint
  let loginToken: string
  try {
    loginToken = (await sdk.auth.login("customer", "emailpass", {
      email: customer.email,
      password: currentPassword,
    })) as string
  } catch {
    return { success: false, error: "Mot de passe actuel incorrect" }
  }

  // Use the login token (not the session cookie) for the update call
  try {
    await sdk.client.fetch(`/auth/customer/emailpass/update`, {
      method: "POST",
      body: { password: newPassword },
      headers: { authorization: `Bearer ${loginToken}` },
    })
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Impossible de modifier le mot de passe",
    }
  }
}

export const saveShippingAddressAsCustomerAddress = async (
  formData: FormData
): Promise<void> => {
  const headers = await getAuthHeaders()
  if (!headers || !("authorization" in headers)) return

  const address = {
    first_name: formData.get("shipping_address.first_name") as string,
    last_name: formData.get("shipping_address.last_name") as string,
    company: (formData.get("shipping_address.company") as string) || undefined,
    address_1: formData.get("shipping_address.address_1") as string,
    city: formData.get("shipping_address.city") as string,
    postal_code: formData.get("shipping_address.postal_code") as string,
    province: (formData.get("shipping_address.province") as string) || undefined,
    country_code: formData.get("shipping_address.country_code") as string,
    phone: (formData.get("shipping_address.phone") as string) || undefined,
  }

  await sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async () => {
      const cacheTag = await getCacheTag("customers")
      revalidateTag(cacheTag)
    })
    .catch((err) => {
      console.log("error saving shipping address to book", err)
    })
}

export const addCustomerAddress = async (
  _currentState: unknown,
  formData: FormData
): Promise<any> => {
  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async () => {
      const cacheTag = await getCacheTag("customers")
      revalidateTag(cacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const cacheTag = await getCacheTag("customers")
      revalidateTag(cacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId = currentState.addressId as string

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const cacheTag = await getCacheTag("customers")
      revalidateTag(cacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

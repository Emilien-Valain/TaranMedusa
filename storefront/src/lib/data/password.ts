"use server"

import { sdk } from "@/lib/config"

export const requestPasswordReset = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await sdk.client.fetch(`/auth/customer/emailpass/reset-password`, {
      method: "POST",
      body: { identifier: email },
    })
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Impossible d'envoyer l'email de réinitialisation",
    }
  }
}

export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await sdk.client.fetch(`/auth/customer/emailpass/update`, {
      method: "POST",
      body: { password: newPassword },
      headers: { authorization: `Bearer ${token}` },
    })
    return { success: true }
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Impossible de réinitialiser le mot de passe",
    }
  }
}

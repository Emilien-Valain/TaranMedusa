"use server"

import { sdk } from "@/lib/config"

export const requestPasswordReset = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const res = await fetch(`${backendUrl}/auth/customer/emailpass/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email }),
    })
    if (!res.ok) {
      throw new Error("Impossible d'envoyer l'email de réinitialisation")
    }
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

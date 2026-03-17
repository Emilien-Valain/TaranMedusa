"use client"

import { useState } from "react"
import { getOrderInvoice } from "@/lib/data/orders"
import Button from "@/modules/common/components/button"

type DownloadInvoiceButtonProps = {
  orderId: string
}

const DownloadInvoiceButton: React.FC<DownloadInvoiceButtonProps> = ({
  orderId,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data, filename } = await getOrderInvoice(orderId)

      const byteCharacters = atob(data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: "application/pdf" })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement de la facture"
      setError(message)
      console.error("Failed to download invoice:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant="secondary"
        onClick={handleDownload}
        disabled={isLoading}
        data-testid="download-invoice-button"
      >
        {isLoading ? "Chargement..." : "Télécharger la facture"}
      </Button>
      {error && (
        <p className="text-ui-fg-error text-small-regular">{error}</p>
      )}
    </div>
  )
}

export default DownloadInvoiceButton

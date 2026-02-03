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

  const handleDownload = async () => {
    setIsLoading(true)
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
    } catch (error) {
      console.error("Failed to download invoice:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="secondary"
      onClick={handleDownload}
      disabled={isLoading}
      data-testid="download-invoice-button"
    >
      {isLoading ? "Chargement..." : "Télécharger la facture"}
    </Button>
  )
}

export default DownloadInvoiceButton

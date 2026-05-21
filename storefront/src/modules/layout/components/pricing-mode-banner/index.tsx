import { CheckCircleSolid } from "@medusajs/icons"

const PricingModeBanner = ({ mode }: { mode: "HT" | "TTC" }) => {
  if (mode !== "HT") return null
  return (
    <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-sm flex items-center justify-center gap-2 py-2 px-4">
      <CheckCircleSolid className="inline" />
      <span>
        SIRET validé — les prix affichés sont en <strong>HT</strong>. La TVA
        reste collectée au paiement et vous la récupérez via votre déclaration.
      </span>
    </div>
  )
}

export default PricingModeBanner

import InteractiveLink from "@/modules/common/components/interactive-link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-2xl-semi text-ui-fg-base">Page not found</h1>
      <p className="text-small-regular text-ui-fg-base">
        Le panier auqel vous essayez d'accéder n'existe pas. Supprimer vos cookies et essayer encore.
      </p>
      <InteractiveLink href="/">Vers la page d'Accueil</InteractiveLink>
    </div>
  )
}

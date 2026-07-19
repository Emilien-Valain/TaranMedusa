import LocalizedClientLink from "@/modules/common/components/localized-client-link"

type LegalLayoutProps = {
  title: string
  /** Date de dernière mise à jour, format libre (ex : "8 juillet 2026") */
  lastUpdated?: string
  children: React.ReactNode
}

const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "Conditions générales de vente" },
  { href: "/cgu", label: "Conditions générales d'utilisation" },
  { href: "/confidentialite", label: "Politique de confidentialité" },
  { href: "/cookies", label: "Gestion des cookies" },
]

/**
 * Gabarit commun aux pages légales (mentions légales, CGV, CGU,
 * confidentialité, cookies). Fournit un style de lecture homogène et une
 * navigation latérale entre les documents légaux.
 */
const LegalLayout = ({ title, lastUpdated, children }: LegalLayoutProps) => {
  return (
    <div className="content-container py-12">
      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Navigation latérale */}
        <aside className="lg:w-64 lg:flex-shrink-0">
          <nav className="lg:sticky lg:top-24 flex flex-col gap-1 text-sm">
            <span className="text-[#0099d6] font-semibold uppercase text-xs tracking-wider mb-2">
              Informations légales
            </span>
            {LEGAL_LINKS.map((link) => (
              <LocalizedClientLink
                key={link.href}
                href={link.href}
                className="py-1.5 text-neutral-600 hover:text-[#0d2b5e] transition-colors"
              >
                {link.label}
              </LocalizedClientLink>
            ))}
          </nav>
        </aside>

        {/* Contenu du document */}
        <article className="flex-1 max-w-3xl">
          <h1 className="text-2xl small:text-3xl font-semibold text-[#0d2b5e] mb-2">
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-sm text-neutral-500 mb-8">
              Dernière mise à jour : {lastUpdated}
            </p>
          )}
          <div className="legal-prose flex flex-col gap-4 text-neutral-700 leading-relaxed [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-[#0d2b5e] [&_h2]:mt-8 [&_h2]:mb-1 [&_h3]:font-semibold [&_h3]:text-neutral-900 [&_h3]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_a]:text-[#0099d6] [&_a]:underline [&_strong]:text-neutral-900">
            {children}
          </div>
        </article>
      </div>
    </div>
  )
}

export default LegalLayout

"use client"

import { signout } from "@/lib/data/customer"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import ChevronDown from "@/modules/common/icons/chevron-down"
import FilePlus from "@/modules/common/icons/file-plus"
import MapPin from "@/modules/common/icons/map-pin"
import Package from "@/modules/common/icons/package"
import User from "@/modules/common/icons/user"
import { B2BCustomer } from "@/types/global"
import { ArrowRightOnRectangle, BuildingStorefront } from "@medusajs/icons"
import { useParams, usePathname } from "next/navigation"

const AccountNav = ({
  customer,
  numPendingApprovals,
}: {
  customer: B2BCustomer | null
  numPendingApprovals: number
}) => {
  const route = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode, customer?.id as string)
  }

  return (
    <div>
      {/* Mobile: back link or menu */}
      <div className="small:hidden" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account"
            className="flex items-center gap-x-2 text-sm py-2"
            style={{ color: "var(--color-cyan)" }}
            data-testid="account-main-link"
          >
            <ChevronDown className="transform rotate-90" />
            <span>Compte</span>
          </LocalizedClientLink>
        ) : (
          <>
            <div className="text-xl font-bold mb-4 px-4" style={{ color: "var(--color-navy)" }}>
              Bonjour {customer?.first_name}
            </div>
            <div className="text-sm">
              <ul>
                {[
                  { href: "/account/profile", label: "Profil", icon: <User size={18} /> },
                  { href: "/account/company", label: "Société", icon: <BuildingStorefront width={18} /> },
                  { href: "/account/addresses", label: "Adresses", icon: <MapPin size={18} /> },
                  { href: "/account/orders", label: "Commandes", icon: <Package size={18} /> },
                  ...(customer?.employee?.is_admin
                    ? [{ href: "/account/approvals", label: "Validations", icon: <FilePlus size={16} /> }]
                    : []),
                  { href: "/account/quotes", label: "Devis", icon: <FilePlus size={16} /> },
                ].map(({ href, label, icon }) => (
                  <li key={href}>
                    <LocalizedClientLink
                      href={href}
                      className="flex items-center justify-between py-3 px-4 border-b transition-colors"
                      style={{ borderColor: "#e8edf4", color: "#374151" }}
                      data-testid={`${label.toLowerCase()}-link`}
                    >
                      <div className="flex items-center gap-x-2">
                        {icon}
                        <span>{label}</span>
                      </div>
                      <ChevronDown className="transform -rotate-90 opacity-40" />
                    </LocalizedClientLink>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    className="flex items-center justify-between py-3 px-4 w-full transition-colors"
                    style={{ color: "#9ca3af" }}
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <div className="flex items-center gap-x-2">
                      <ArrowRightOnRectangle />
                      <span>Déconnexion</span>
                    </div>
                    <ChevronDown className="transform -rotate-90 opacity-40" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden small:block" data-testid="account-nav">
        <ul className="flex flex-col gap-y-1">
          {[
            { href: "/account", label: "Aperçu", testId: "overview-link" },
            { href: "/account/profile", label: "Profil", testId: "profile-link" },
            { href: "/account/company", label: "Société", testId: "company-link" },
            { href: "/account/addresses", label: "Adresses", testId: "addresses-link" },
            { href: "/account/orders", label: "Commandes", testId: "orders-link" },
            ...(customer?.employee?.is_admin
              ? [{ href: "/account/approvals", label: "Approbations", testId: "approvals-link", badge: numPendingApprovals }]
              : []),
            { href: "/account/quotes", label: "Devis", testId: "quotes-link" },
          ].map(({ href, label, testId, badge }: any) => (
            <li key={href}>
              <AccountNavLink href={href} route={route} data-testid={testId}>
                <span>{label}</span>
                {badge > 0 && (
                  <span
                    className="text-white text-xs font-semibold rounded-full px-1.5 py-0.5"
                    style={{ background: "var(--color-cyan)", fontSize: "11px" }}
                  >
                    {badge}
                  </span>
                )}
              </AccountNavLink>
            </li>
          ))}

          <li className="mt-4 pt-4" style={{ borderTop: "1px solid #e8edf4" }}>
            <button
              type="button"
              className="account-nav-link w-full text-left text-gray-400 hover:text-red-500"
              onClick={handleLogout}
              data-testid="logout-button"
            >
              <ArrowRightOnRectangle />
              <span>Déconnexion</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()
  const active = route.split(countryCode)[1] === href

  return (
    <LocalizedClientLink
      href={href}
      className={`account-nav-link flex items-center gap-x-2 ${active ? "account-nav-link--active" : ""}`}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav

import { listApprovals } from "@/lib/data/approvals"
import AccountNav from "@/modules/account/components/account-nav"
import { B2BCustomer } from "@/types"
import { ApprovalStatusType, ApprovalType } from "@/types/approval"
import React from "react"

interface AccountLayoutProps {
  customer: B2BCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = async ({
  customer,
  children,
}) => {
  const { carts_with_approvals } = await listApprovals({
    type: ApprovalType.ADMIN,
    status: ApprovalStatusType.PENDING,
  })

  const numPendingApprovals = carts_with_approvals?.length || 0

  return (
    <div
      data-testid="account-page"
      style={{ background: "var(--color-bg-light)", minHeight: "100vh" }}
    >
      {/* Narrow top accent bar */}
      <div style={{ height: "3px", background: "var(--color-cyan)" }} />

      <div
        className="mx-auto px-6 py-10"
        style={{ maxWidth: "1100px" }}
      >
        <div className="grid grid-cols-1 small:grid-cols-[220px_1fr] gap-8">
          {/* Sidebar */}
          <aside>
            {customer && (
              <div
                className="bg-white rounded-xl p-5 sticky top-[90px]"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
              >
                <div className="mb-5 pb-4" style={{ borderBottom: "1px solid #e8edf4" }}>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1">
                    Connecté en tant que
                  </p>
                  <p
                    className="font-semibold text-sm truncate"
                    style={{ color: "var(--color-navy)" }}
                  >
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{customer.email}</p>
                </div>
                <AccountNav
                  customer={customer}
                  numPendingApprovals={numPendingApprovals}
                />
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout

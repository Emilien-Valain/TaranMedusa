import OrderCard from "@/modules/account/components/order-card"
import PreviouslyPurchasedProducts from "@/modules/account/components/previously-purchased"
import { B2BCustomer } from "@/types/global"
import { HttpTypes } from "@medusajs/types"

type OverviewProps = {
  customer: B2BCustomer | null
  orders: HttpTypes.StoreOrder[] | null
  region?: HttpTypes.StoreRegion | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  const completion = getProfileCompletion(customer)

  return (
    <div data-testid="overview-page-wrapper" className="flex flex-col gap-8">
      {/* Greeting */}
      <div className="hidden small:block">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ color: "var(--color-navy)" }}
          data-testid="welcome-message"
          data-value={customer?.first_name}
        >
          Bonjour, {customer?.first_name} 👋
        </h1>
        <p className="text-sm text-gray-400">
          Connecté en tant que{" "}
          <span className="font-medium text-gray-500" data-testid="customer-email">
            {customer?.email}
          </span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="hidden small:grid grid-cols-2 gap-4">
        {/* Profile completion */}
        <div className="stat-card">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">
            Profil
          </p>
          <div className="flex items-end gap-2 mb-3">
            <span
              className="text-4xl font-bold leading-none"
              style={{ color: "var(--color-cyan)" }}
              data-testid="customer-profile-completion"
              data-value={completion}
            >
              {completion}%
            </span>
            <span className="text-sm text-gray-400 mb-1">complété</span>
          </div>
          {/* Progress bar */}
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "#e8edf4" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${completion}%`,
                background: "var(--color-cyan)",
              }}
            />
          </div>
        </div>

        {/* Addresses */}
        <div className="stat-card">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3">
            Adresses
          </p>
          <div className="flex items-end gap-2">
            <span
              className="text-4xl font-bold leading-none"
              style={{ color: "var(--color-cyan)" }}
              data-testid="addresses-count"
              data-value={customer?.addresses?.length || 0}
            >
              {customer?.addresses?.length || 0}
            </span>
            <span className="text-sm text-gray-400 mb-1">sauvegardées</span>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <section className="hidden small:block">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-navy)" }}
        >
          Commandes récentes
        </h2>
        <div className="flex flex-col gap-3" data-testid="orders-wrapper">
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order) => (
              <OrderCard order={order} key={order.id} />
            ))
          ) : (
            <div
              className="taran-card text-center py-10 text-gray-400 text-sm"
              data-testid="no-orders-message"
            >
              Pas de commandes récentes
            </div>
          )}
        </div>
      </section>

      {/* Previously purchased */}
      <section className="hidden small:block">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-navy)" }}
        >
          Articles déjà achetés
        </h2>
        <div
          className="flex flex-col gap-3"
          data-testid="previously-purchased-items-wrapper"
        >
          {orders && orders.length > 0 ? (
            <PreviouslyPurchasedProducts orders={orders} />
          ) : (
            <div
              className="taran-card text-center py-10 text-gray-400 text-sm"
              data-testid="no-previously-purchased-items-message"
            >
              Pas d'articles déjà achetés
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

const getProfileCompletion = (customer: B2BCustomer | null) => {
  let count = 0
  if (!customer) return 0
  if (customer.email) count++
  if (customer.first_name && customer.last_name) count++
  if (customer.phone) count++
  const billingAddress = customer.addresses?.find((addr) => addr.is_default_billing)
  if (billingAddress) count++
  return Math.round((count / 4) * 100)
}

export default Overview

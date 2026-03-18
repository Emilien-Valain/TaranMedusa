import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import User from "@/modules/common/icons/user"
import { B2BCustomer } from "@/types/global"

export default async function AccountButton({
  customer,
}: {
  customer: B2BCustomer | null
}) {
  return (
    <LocalizedClientLink className="text-white" href="/account">
      <button className="nav-ghost-btn">
        <User />
        <span className="hidden small:inline-block">
          {customer ? customer.first_name : "Se connecter"}
        </span>
      </button>
    </LocalizedClientLink>
  )
}

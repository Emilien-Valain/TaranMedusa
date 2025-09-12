import { retrieveCustomer } from "@/lib/data/customer"
import { getRegion } from "@/lib/data/regions"
import AddressBook from "@/modules/account/components/address-book"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Addresses",
  description: "View your addresses",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Shipping Addresses</h1>
        <p className="text-base-regular">
          Voir et mettre à jour vos adresses de livraisons, vous pouvez en ajouter autant que vous le souhaiter.
          Enregistrer vos adresses les rendra disponible lors de la vérification de la commande.
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}

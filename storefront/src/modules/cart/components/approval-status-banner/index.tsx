import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { B2BCart } from "@/types"
import { ApprovalStatusType } from "@/types/approval"
import { CheckMini, LockClosedSolid, XMarkMini } from "@medusajs/icons"
import { Container, Text } from "@medusajs/ui"

const ApprovalStatusBanner = ({ cart }: { cart: B2BCart }) => {
  const cartApprovalStatus = cart.approval_status?.status

  if (!cartApprovalStatus) {
    return null
  }

  return (
    <Container className="flex gap-2 self-stretch relative w-full h-fit overflow-hidden items-center">
      {cartApprovalStatus === ApprovalStatusType.PENDING && (
        <>
          <LockClosedSolid className="w-4 h-4" />
          <Text className="text-left">Ce panier attend la validation</Text>
        </>
      )}

      {cartApprovalStatus === ApprovalStatusType.REJECTED && (
        <>
          <XMarkMini className="w-4 h-4" />
          <Text className="text-left">
            Ce panier a été rejeté. Vous pouvez de nouveau demander la validation auprès de{" "}
            <LocalizedClientLink
              href="/checkout"
              className="text-ui-bg-interactive hover:text-ui-fg-interactive-hover"
            >
              page de paiement
            </LocalizedClientLink>
            .
          </Text>
        </>
      )}

      {cartApprovalStatus === ApprovalStatusType.APPROVED && (
        <>
          <CheckMini className="w-4 h-4" />
          <Text className="text-left">
            Ce panier est validé et prêt à être terminé.
          </Text>
        </>
      )}
    </Container>
  )
}

export default ApprovalStatusBanner

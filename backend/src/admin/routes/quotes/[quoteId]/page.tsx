import { CheckCircleSolid } from "@medusajs/icons";
import {
  Button,
  Container,
  Heading,
  Text,
  toast,
  Toaster,
  usePrompt,
} from "@medusajs/ui";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { JsonViewSection } from "../../../components/common/json-view-section";
import { useOrderPreview } from "../../../hooks/api";
import {
  useQuote,
  useRejectQuote,
  useSendQuote,
} from "../../../hooks/api/quotes";
import { formatAmount } from "../../../utils";
import {
  CostBreakdown,
  QuoteDetailsHeader,
  QuoteItems,
  QuoteTotal,
} from "../components/quote-details";
import { QuoteMessages } from "../components/quote-messages";

const QuoteDetails = () => {
  const { quoteId } = useParams();
  const [showSendQuote, setShowSendQuote] = useState(false);
  const [showRejectQuote, setShowRejectQuote] = useState(false);
  const prompt = usePrompt();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { quote, isLoading } = useQuote(quoteId!, {
    fields:
      "*draft_order.customer,*draft_order.customer.employee,*draft_order.customer.employee.company",
  });

  const { order: preview, isLoading: isPreviewLoading } = useOrderPreview(
    quote?.draft_order_id!,
    {},
    { enabled: !!quote?.draft_order_id }
  );

  const { mutateAsync: sendQuote, isPending: isSendingQuote } = useSendQuote(
    quoteId!
  );

  const { mutateAsync: rejectQuote, isPending: isRejectingQuote } =
    useRejectQuote(quoteId!);

  useEffect(() => {
    if (["pending_merchant", "customer_rejected"].includes(quote?.status!)) {
      setShowSendQuote(true);
    } else {
      setShowSendQuote(false);
    }

    if (
      ["customer_rejected", "merchant_rejected", "accepted"].includes(
        quote?.status!
      )
    ) {
      setShowRejectQuote(false);
    } else {
      setShowRejectQuote(true);
    }
  }, [quote]);

  const handleSendQuote = async () => {
    const res = await prompt({
      title: "Envoyer le Devis ?",
      description:
        "Vous êtes sur le point d'envoyer le devis au client. Voulez-vous continuer ?",
      confirmText: t("actions.continue"),
      cancelText: t("actions.cancel"),
      variant: "confirmation",
    });

    if (res) {
      await sendQuote(
        {},
        {
          onSuccess: () => toast.success("Devis envoyé avec succès"),
          onError: (e) => toast.error(e.message),
        }
      );
    }
  };

  const handleRejectQuote = async () => {
    const res = await prompt({
      title: "Rejeté le devis ?",
      description:
        "Vous êtes sur le point de rejeté le devis du client. Voulez-vous continuer ?",
      confirmText: t("actions.continue"),
      cancelText: t("actions.cancel"),
      variant: "confirmation",
    });

    if (res) {
      await rejectQuote(void 0, {
        onSuccess: () =>
          toast.success("Devis rejeté avec succès"),
        onError: (e) => toast.error(e.message),
      });
    }
  };

  if (isLoading || !quote) {
    return <></>;
  }

  if (isPreviewLoading) {
    return <></>;
  }

  if (!isPreviewLoading && !preview) {
    throw "preview not found";
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-col gap-x-4 lg:flex-row xl:items-start">
        <div className="flex w-full flex-col gap-y-3">
          {quote.status === "accepted" && (
            <Container className="divide-y divide-dashed p-0">
              <div className="flex items-center justify-between px-6 py-4">
                <Text className="txt-compact-small">
                  <CheckCircleSolid className="inline-block mr-2 text-green-500 text-lg" />
                  Devis accepté par le client. La commande est prête à être préparée.
                </Text>

                <Button
                  size="small"
                  onClick={() => navigate(`/orders/${quote.draft_order_id}`)}
                >
                  Voir la Commande
                </Button>
              </div>
            </Container>
          )}

          <Container className="divide-y divide-dashed p-0">
            <QuoteDetailsHeader quote={quote} />
            <QuoteItems order={quote.draft_order} preview={preview!} />
            <CostBreakdown order={quote.draft_order} />
            <QuoteTotal order={quote.draft_order} preview={preview!} />

            {(showRejectQuote || showSendQuote) && (
              <div className="bg-ui-bg-subtle flex items-center justify-end gap-x-2 rounded-b-xl px-4 py-4">
                {showRejectQuote && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleRejectQuote()}
                    disabled={isSendingQuote}
                  >
                    Rejeter le Devis
                  </Button>
                )}

                {showSendQuote && (
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleSendQuote()}
                    disabled={isSendingQuote}
                  >
                    Envoyer le Devis
                  </Button>
                )}
              </div>
            )}
          </Container>

          <QuoteMessages quote={quote} preview={preview!} />

          <JsonViewSection data={quote} />
        </div>

        <div className="mt-2 flex w-full max-w-[100%] flex-col gap-y-3 xl:mt-0 xl:max-w-[400px]">
          <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">Client</Heading>
            </div>

            <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
              <Text size="small" weight="plus" leading="compact">
                Email
              </Text>

              <Link
                className="text-sm text-pretty text-blue-500"
                to={`/customers/${quote.draft_order?.customer?.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                {quote.draft_order?.customer?.email}
              </Link>
            </div>

            <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
              <Text size="small" weight="plus" leading="compact">
                Téléphone
              </Text>

              <Text size="small" leading="compact" className="text-pretty">
                {quote.draft_order?.customer?.phone}
              </Text>
            </div>

            <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
              <Text size="small" weight="plus" leading="compact">
                Limite de Dépense
              </Text>

              <Text size="small" leading="compact" className="text-pretty">
                {formatAmount(
                  quote?.customer?.employee?.spending_limit,
                  (quote?.customer?.employee?.company
                    ?.currency_code as string) || "USD"
                )}
              </Text>
            </div>
          </Container>

          <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">Société</Heading>
            </div>

            <div className="text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4">
              <Text size="small" weight="plus" leading="compact">
                Nom
              </Text>

              <Link
                className="text-sm text-pretty text-blue-500"
                to={`/companies/${quote?.customer?.employee?.company.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                {quote?.customer?.employee?.company?.name}
              </Link>
            </div>
          </Container>
        </div>
      </div>

      <Toaster />
    </div>
  );
};

export default QuoteDetails;

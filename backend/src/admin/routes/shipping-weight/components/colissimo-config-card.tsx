import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Select,
  Switch,
  Text,
  toast,
  usePrompt,
} from "@medusajs/ui";
import { useEffect, useState } from "react";
import {
  UpdateColissimoConfigPayload,
  useColissimoConfig,
  useUpdateColissimoConfig,
} from "../../../hooks/api/shipping-weight";

type FormState = {
  enabled: boolean;
  api_key: string;
  contract_number: string;
  password: string;
  label_format: string;
  sender_name: string;
  sender_street: string;
  sender_street2: string;
  sender_zip: string;
  sender_city: string;
  sender_country: string;
  sender_phone: string;
  sender_email: string;
};

const emptyForm: FormState = {
  enabled: true,
  api_key: "",
  contract_number: "",
  password: "",
  label_format: "PDF_A4_300dpi",
  sender_name: "",
  sender_street: "",
  sender_street2: "",
  sender_zip: "",
  sender_city: "",
  sender_country: "FR",
  sender_phone: "",
  sender_email: "",
};

export function ColissimoConfigCard() {
  const { data, isPending } = useColissimoConfig();
  const { mutateAsync, isPending: saving } = useUpdateColissimoConfig();
  const prompt = usePrompt();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false);

  useEffect(() => {
    const c = data?.colissimo_config;
    if (!c) return;
    setForm({
      enabled: c.enabled ?? true,
      api_key: "",
      contract_number: c.contract_number ?? "",
      password: "",
      label_format: c.label_format ?? "PDF_A4_300dpi",
      sender_name: c.sender_name ?? "",
      sender_street: c.sender_street ?? "",
      sender_street2: c.sender_street2 ?? "",
      sender_zip: c.sender_zip ?? "",
      sender_city: c.sender_city ?? "",
      sender_country: c.sender_country ?? "FR",
      sender_phone: c.sender_phone ?? "",
      sender_email: c.sender_email ?? "",
    });
    setApiKeySet(Boolean(c.api_key_set));
    setPasswordSet(Boolean(c.password_set));
  }, [data]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Efface réellement un secret en base. Nécessaire car un champ vide, côté
  // API, « conserve » l'existant (protection anti-écrasement).
  const clearSecret = async (which: "api_key" | "password") => {
    const isKey = which === "api_key";
    const confirmed = await prompt({
      title: isKey ? "Effacer l'apiKey ?" : "Effacer le mot de passe ?",
      description: isKey
        ? "L'apiKey sera définitivement supprimée de la base. Le code retombera alors sur le numéro de contrat + mot de passe."
        : "Le mot de passe sera définitivement supprimé de la base.",
      confirmText: "Effacer",
      cancelText: "Annuler",
    });
    if (!confirmed) return;

    try {
      await mutateAsync(isKey ? { clear_api_key: true } : { clear_password: true });
      toast.success(isKey ? "apiKey effacée" : "Mot de passe effacé");
    } catch (err: any) {
      toast.error(err?.message ?? "Une erreur est survenue");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // On n'envoie les secrets que s'ils ont été modifiés (champ non vide).
    const payload: UpdateColissimoConfigPayload = {
      enabled: form.enabled,
      contract_number: form.contract_number || null,
      label_format: form.label_format || null,
      sender_name: form.sender_name || null,
      sender_street: form.sender_street || null,
      sender_street2: form.sender_street2 || null,
      sender_zip: form.sender_zip || null,
      sender_city: form.sender_city || null,
      sender_country: form.sender_country || null,
      sender_phone: form.sender_phone || null,
      sender_email: form.sender_email || null,
    };
    if (form.api_key.trim()) payload.api_key = form.api_key.trim();
    if (form.password.trim()) payload.password = form.password.trim();

    try {
      await mutateAsync(payload);
      toast.success("Configuration Colissimo enregistrée");
    } catch (err: any) {
      toast.error(err?.message ?? "Une erreur est survenue");
    }
  };

  return (
    <Container className="flex flex-col p-0 overflow-hidden">
      <div className="p-6 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Heading level="h2">Configuration Colissimo</Heading>
            {form.enabled ? (
              <Badge size="small" color="green">
                Activé
              </Badge>
            ) : (
              <Badge size="small" color="orange">
                Manuel
              </Badge>
            )}
          </div>
          <Text className="text-ui-fg-subtle txt-small">
            Identifiants du Web Service « Affranchissement » (offre Colissimo
            Facilité) et adresse expéditeur de repli. Désactivez « Activé » pour
            expédier 100 % manuellement (aucune étiquette générée
            automatiquement).
          </Text>
        </div>
      </div>

      {isPending ? (
        <div className="px-6 pb-6">
          <Text>Chargement...</Text>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="px-6 pb-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Label size="xsmall">Génération automatique des étiquettes</Label>
              <Switch
                checked={form.enabled}
                onCheckedChange={(v) => set("enabled", v)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between min-h-6">
                  <Label size="xsmall">
                    apiKey {apiKeySet && <span className="text-ui-fg-muted">(définie — laisser vide pour conserver)</span>}
                  </Label>
                  {apiKeySet && (
                    <Button
                      type="button"
                      variant="transparent"
                      size="small"
                      className="text-ui-fg-error"
                      onClick={() => clearSecret("api_key")}
                    >
                      Effacer
                    </Button>
                  )}
                </div>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.api_key}
                  onChange={(e) => set("api_key", e.target.value)}
                  placeholder={apiKeySet ? "••••••••" : "apiKey Colissimo"}
                />
              </div>
              <div>
                <Label size="xsmall">Format d'étiquette</Label>
                <Select
                  value={form.label_format}
                  onValueChange={(v) => set("label_format", v)}
                >
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="PDF_A4_300dpi">PDF A4</Select.Item>
                    <Select.Item value="PDF_10x15_300dpi">
                      PDF 10×15 (thermique)
                    </Select.Item>
                    <Select.Item value="ZPL_10x15_300dpi">
                      ZPL 10×15 (Zebra)
                    </Select.Item>
                  </Select.Content>
                </Select>
              </div>
            </div>

            <Text className="txt-compact-xsmall text-ui-fg-muted">
              Alternative (déprécié) : contrat + mot de passe, utilisés
              uniquement si l'apiKey est vide.
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label size="xsmall">Numéro de contrat</Label>
                <Input
                  value={form.contract_number}
                  onChange={(e) => set("contract_number", e.target.value)}
                  placeholder="N° de contrat Colissimo"
                />
              </div>
              <div>
                <div className="flex items-center justify-between min-h-6">
                  <Label size="xsmall">
                    Mot de passe {passwordSet && <span className="text-ui-fg-muted">(défini — laisser vide pour conserver)</span>}
                  </Label>
                  {passwordSet && (
                    <Button
                      type="button"
                      variant="transparent"
                      size="small"
                      className="text-ui-fg-error"
                      onClick={() => clearSecret("password")}
                    >
                      Effacer
                    </Button>
                  )}
                </div>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder={passwordSet ? "••••••••" : "Mot de passe"}
                />
              </div>
            </div>

            <Text className="txt-compact-small font-medium mt-2">
              Adresse expéditeur de repli
            </Text>
            <Text className="txt-compact-xsmall text-ui-fg-muted">
              Utilisée si l'emplacement de stock (stock location) n'a pas
              d'adresse complète.
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label size="xsmall">Raison sociale</Label>
                <Input
                  value={form.sender_name}
                  onChange={(e) => set("sender_name", e.target.value)}
                />
              </div>
              <div>
                <Label size="xsmall">Téléphone</Label>
                <Input
                  value={form.sender_phone}
                  onChange={(e) => set("sender_phone", e.target.value)}
                />
              </div>
              <div>
                <Label size="xsmall">Adresse (n° et voie)</Label>
                <Input
                  value={form.sender_street}
                  onChange={(e) => set("sender_street", e.target.value)}
                />
              </div>
              <div>
                <Label size="xsmall">Complément d'adresse</Label>
                <Input
                  value={form.sender_street2}
                  onChange={(e) => set("sender_street2", e.target.value)}
                />
              </div>
              <div>
                <Label size="xsmall">Code postal</Label>
                <Input
                  value={form.sender_zip}
                  onChange={(e) => set("sender_zip", e.target.value)}
                />
              </div>
              <div>
                <Label size="xsmall">Ville</Label>
                <Input
                  value={form.sender_city}
                  onChange={(e) => set("sender_city", e.target.value)}
                />
              </div>
              <div>
                <Label size="xsmall">Pays (code ISO 2 lettres)</Label>
                <Input
                  value={form.sender_country}
                  onChange={(e) =>
                    set("sender_country", e.target.value.toUpperCase())
                  }
                />
              </div>
              <div>
                <Label size="xsmall">E-mail expéditeur</Label>
                <Input
                  value={form.sender_email}
                  onChange={(e) => set("sender_email", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <Button type="submit" isLoading={saving}>
                Enregistrer
              </Button>
            </div>
          </div>
        </form>
      )}
    </Container>
  );
}

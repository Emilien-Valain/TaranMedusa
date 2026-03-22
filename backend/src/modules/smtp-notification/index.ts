import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import nodemailer from "nodemailer"
import { renderTemplate } from "./templates"

type SmtpOptions = {
  host: string
  port: number
  secure: boolean
  user: string
  password: string
  from: string
}

type ProviderSendNotificationDTO = {
  to: string
  channel: string
  template: string
  data?: Record<string, unknown>
  from?: string | null
}

type ProviderSendNotificationResultsDTO = {
  id: string
}

class SmtpNotificationService extends AbstractNotificationProviderService {
  static identifier = "smtp"
  static channels = ["email"]

  private transporter: nodemailer.Transporter
  private from: string

  constructor(_container: Record<string, any>, options: SmtpOptions) {
    super()
    this.from = options.from
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: Number(options.port),
      secure: options.secure !== false,
      auth: {
        user: options.user,
        pass: options.password,
      },
    })
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const { to, template, data = {} } = notification

    const { subject, html } = renderTemplate(template, data as Record<string, any>)

    const result = await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      html,
    })

    return { id: result.messageId }
  }
}

const services = [SmtpNotificationService]

export default ModuleProvider(Modules.NOTIFICATION, { services })

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendWelcomeEmail(to: string, firstName: string) {
    try {
      await this.transporter.sendMail({
        from: `"Foytain" <${this.configService.get('MAIL_FROM')}>`,
        to,
        subject: 'Bienvenue sur Foytain!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Bienvenue sur Foytain, ${firstName}!</h1>
            <p>Votre compte a été créé avec succès. Vous pouvez maintenant rejoindre des tontines médicales et aider votre communauté.</p>
            <a href="${this.configService.get('FRONTEND_URL')}/login" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
              Se connecter
            </a>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error('Failed to send welcome email', error);
    }
  }

  async sendTontineInvitation(to: string, tontineName: string, inviteUrl: string) {
    try {
      await this.transporter.sendMail({
        from: `"Foytain" <${this.configService.get('MAIL_FROM')}>`,
        to,
        subject: `Invitation à rejoindre "${tontineName}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Invitation à une tontine médicale</h1>
            <p>Vous avez été invité(e) à rejoindre la tontine <strong>"${tontineName}"</strong>.</p>
            <a href="${inviteUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
              Accepter l'invitation
            </a>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error('Failed to send invitation email', error);
    }
  }

  async sendContributionReminder(to: string, firstName: string, tontineName: string, amount: number, dueDate: Date) {
    try {
      await this.transporter.sendMail({
        from: `"Foytain" <${this.configService.get('MAIL_FROM')}>`,
        to,
        subject: `Rappel de cotisation — ${tontineName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">Rappel de cotisation</h1>
            <p>Bonjour ${firstName},</p>
            <p>Votre cotisation de <strong>${amount} XOF</strong> pour la tontine <strong>"${tontineName}"</strong> est due le <strong>${dueDate.toLocaleDateString('fr-FR')}</strong>.</p>
            <a href="${this.configService.get('FRONTEND_URL')}/dashboard/contributions" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">
              Payer maintenant
            </a>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error('Failed to send contribution reminder', error);
    }
  }
}

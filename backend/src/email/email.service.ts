import { Injectable, BadRequestException } from '@nestjs/common';
import { prisma } from 'src/lib/prisma';
import * as nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  applicationId?: string; // The application ID to fetch SMTP config from
}

@Injectable()
export class EmailService {
  constructor() {}

  /**
   * Send email using the application's SMTP configuration
   * Falls back to default MailerService if no applicationId is provided
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!options.applicationId) {
      throw new BadRequestException(
        'Application ID is required to send email with application SMTP configuration',
      );
    }

    await this.sendEmailWithApplicationConfig(options);
  }

  /**
   * Send email using the SMTP configuration linked to the application
   */
  private async sendEmailWithApplicationConfig(
    options: SendEmailOptions,
  ): Promise<void> {
    const { applicationId, to, subject, text, html, from } = options;

    if (!applicationId) {
      throw new BadRequestException('Application ID is required');
    }

    // Fetch the application with its email configuration
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { email: true },
    });

    if (!application) {
      throw new BadRequestException('Application not found');
    }

    if (!application.email) {
      throw new BadRequestException(
        'No email configuration linked to this application',
      );
    }

    const smtpConfig = application.email;

    // Create a transporter with the application's SMTP config
    const transporter = nodemailer.createTransport({
      host: smtpConfig.smtpService,
      port: smtpConfig.smtpPort,
      secure: smtpConfig.smtpPort === 465, // Use TLS for port 465
      auth: {
        user: smtpConfig.smtpUser,
        pass: smtpConfig.smtpPassword,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: from || smtpConfig.smtpUser,
      to,
      subject,
      text,
      html,
    });
  }
}

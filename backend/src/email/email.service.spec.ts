jest.mock('src/lib/prisma');
jest.mock('nodemailer', () => ({ createTransport: jest.fn() }));

import { BadRequestException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Test, TestingModule } from '@nestjs/testing';
import { prisma } from 'src/lib/prisma';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let sendMail: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();
    sendMail = jest.fn().mockResolvedValue({ messageId: 'message-id' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();
    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    const smtpConfig = {
      smtpService: 'smtp.example.com',
      smtpPort: 587,
      smtpUser: 'mailer@example.com',
      smtpPassword: 'smtp-password',
    };

    it('should require an application ID', async () => {
      await expect(
        service.sendEmail({ to: 'user@example.com', subject: 'Hello' }),
      ).rejects.toThrow(
        new BadRequestException(
          'Application ID is required to send email with application SMTP configuration',
        ),
      );
      expect(prisma.application.findUnique).not.toHaveBeenCalled();
      expect(nodemailer.createTransport).not.toHaveBeenCalled();
    });

    it('should throw when the application does not exist', async () => {
      jest.mocked(prisma.application.findUnique).mockResolvedValue(null);

      await expect(
        service.sendEmail({
          to: 'user@example.com',
          subject: 'Hello',
          applicationId: 'missing-app-id',
        }),
      ).rejects.toThrow(new BadRequestException('Application not found'));

      expect(prisma.application.findUnique).toHaveBeenCalledWith({
        where: { id: 'missing-app-id' },
        include: { email: true },
      });
      expect(nodemailer.createTransport).not.toHaveBeenCalled();
    });

    it('should throw when no SMTP configuration is linked to the application', async () => {
      jest
        .mocked(prisma.application.findUnique)
        .mockResolvedValue({ id: 'application-id', email: null } as never);

      await expect(
        service.sendEmail({
          to: 'user@example.com',
          subject: 'Hello',
          applicationId: 'application-id',
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'No email configuration linked to this application',
        ),
      );
      expect(nodemailer.createTransport).not.toHaveBeenCalled();
    });

    it('should send mail using the linked SMTP configuration', async () => {
      jest.mocked(prisma.application.findUnique).mockResolvedValue({
        id: 'application-id',
        email: smtpConfig,
      } as never);
      const options = {
        to: 'user@example.com',
        subject: 'Welcome',
        text: 'Welcome text',
        html: '<p>Welcome</p>',
        applicationId: 'application-id',
      };

      await expect(service.sendEmail(options)).resolves.toBeUndefined();

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: smtpConfig.smtpService,
        port: smtpConfig.smtpPort,
        secure: false,
        auth: { user: smtpConfig.smtpUser, pass: smtpConfig.smtpPassword },
      });
      expect(sendMail).toHaveBeenCalledWith({
        from: smtpConfig.smtpUser,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    });

    it('should use TLS on port 465 and respect a provided from address', async () => {
      jest.mocked(prisma.application.findUnique).mockResolvedValue({
        id: 'application-id',
        email: { ...smtpConfig, smtpPort: 465 },
      } as never);

      await service.sendEmail({
        to: 'user@example.com',
        subject: 'Welcome',
        from: 'custom@example.com',
        applicationId: 'application-id',
      });

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ port: 465, secure: true }),
      );
      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'custom@example.com' }),
      );
    });

    it('should propagate mail transport errors', async () => {
      jest.mocked(prisma.application.findUnique).mockResolvedValue({
        id: 'application-id',
        email: smtpConfig,
      } as never);
      sendMail.mockRejectedValue(new Error('SMTP connection failed'));

      await expect(
        service.sendEmail({
          to: 'user@example.com',
          subject: 'Hello',
          applicationId: 'application-id',
        }),
      ).rejects.toThrow('SMTP connection failed');
    });
  });
});

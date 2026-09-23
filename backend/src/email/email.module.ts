import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

/**
 * EmailModule - Handles email sending with application-backed SMTP configuration
 *
 * The service fetches SMTP credentials from the application's linked email config in the database.
 *
 * Example:
 * await emailService.sendEmail({
 *   to: 'user@example.com',
 *   subject: 'OTP Code',
 *   html: 'Your OTP is...',
 *   applicationId: 'app-123', // This will use the app's SMTP config
 * });
 */
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

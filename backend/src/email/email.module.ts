import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const port = Number(config.get<string>('SMTP_PORT', '587'));
        const secure =
          config.get<string>('SMTP_SECURE', port === 465 ? 'true' : 'false') ===
          'true';

        return {
          transport: {
            host: config.get<string>('SMTP_HOST'),
            port,
            secure,
            auth: {
              user: config.get<string>('SMTP_USER'),
              pass: config.get<string>('SMTP_PASS'),
            },
          },
          defaults: {
            from: config.get<string>('SMTP_FROM'),
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

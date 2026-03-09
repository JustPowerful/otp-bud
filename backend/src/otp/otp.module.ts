import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { EmailModule } from '../email/email.module';
import { TemplateService } from 'src/template/template.service';

@Module({
  imports: [EmailModule],
  providers: [OtpService, TemplateService],
  controllers: [OtpController],
})
export class OtpModule {}

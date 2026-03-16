import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { EmailModule } from '../email/email.module';
import { TemplateModule } from '../template/template.module';

@Module({
  imports: [EmailModule, TemplateModule],
  providers: [OtpService],
  controllers: [OtpController],
})
export class OtpModule {}

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { OtpService } from './otp.service';
import { CreateOtpDto } from './dto/create-otp.dto';
import { EmailService } from 'src/email/email.service';
import { TemplateService } from 'src/template/template.service';
import { ValidateTokenKeyGuard } from 'src/common/guards/validate-token-key/validate-token-key.guard';
import { ApiHeader, ApiSecurity } from '@nestjs/swagger';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
  ) {}
  // This endpoint is not secure yet and should be protected using Guards
  // Plus you have to validate that the application belongs to the user having the API key (token)
  @Post('send')
  @UseGuards(ValidateTokenKeyGuard)
  async sendOtp(@Body() { email, applicationId }: CreateOtpDto) {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
    const otpRecord = await this.otpService.generateOtp(
      expiresAt,
      email,
      applicationId,
    );
    const template =
      await this.templateService.getActiveTemplate(applicationId);
    const formattedEmail = template?.body
      .replace('{{otp}}', otpRecord.otp)
      .replace('{{appname}}', template.application.name)
      .replace('{{expiry}}', expiresAt.toLocaleTimeString())
      .replace('{{email}}', email);
    await this.emailService.sendEmail({
      to: email,
      subject: template?.subject || 'Your OTP Code',
      text:
        formattedEmail ||
        `Your OTP code is ${otpRecord.otp}. It expires at ${expiresAt.toLocaleTimeString()}.`,
    });
  }
}

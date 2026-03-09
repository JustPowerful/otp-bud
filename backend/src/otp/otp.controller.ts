import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { CreateOtpDto } from './dto/create-otp.dto';
import { EmailService } from 'src/email/email.service';
import { TemplateService } from 'src/template/template.service';
import { ValidateTokenKeyGuard } from 'src/common/guards/validate-token-key/validate-token-key.guard';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
  ) {}
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
    return new SuccessResponseDto({
      message: 'OTP sent successfully',
    });
  }

  @Post('validate')
  @UseGuards(ValidateTokenKeyGuard)
  async validateOtp(@Body() { email, otp, applicationId }: VerifyOtpDto) {
    const isValid = await this.otpService.verifyOtp(email, otp, applicationId);
    // if the OTP is valid, you can remove the token as it is validated and should not be used again
    if (!isValid) throw new UnauthorizedException('Invalid OTP');
    await this.otpService.deleteOtp(email, applicationId);
    return new SuccessResponseDto({
      message: 'OTP is valid',
      data: {
        valid: isValid,
      },
    });
  }
}

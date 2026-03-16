import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
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
import { RedisService } from 'src/redis/redis.service';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
    private readonly templateService: TemplateService,
    private readonly redis: RedisService,
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
    const failedAttemptsKey = `failed_attempts:${email}:${applicationId}`;
    const blockKey = `block:${email}:${applicationId}`;

    const isBlocked = await this.redis.get(blockKey);
    if (isBlocked === 'blocked') {
      throw new HttpException(
        'Too many failed attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const isValid = await this.otpService.verifyOtp(email, otp, applicationId);
    // if the OTP is valid, you can remove the token as it is validated and should not be used again
    if (!isValid) {
      // Count the number of failed attempts for this email and application
      const failedAttempts = await this.redis.get(failedAttemptsKey);
      const attempts = failedAttempts ? parseInt(failedAttempts, 10) + 1 : 1;

      await this.redis.set(failedAttemptsKey, attempts.toString(), 300); // TTL of 5 minutes
      if (attempts >= 5) {
        await this.redis.set(blockKey, 'blocked', 900); // Block for 15 minutes
        await this.redis.del(failedAttemptsKey); // Reset failed attempts after block
      }
      throw new UnauthorizedException('Invalid OTP');
    }
    await this.otpService.deleteOtp(email, applicationId);
    await this.redis.del(failedAttemptsKey);
    return new SuccessResponseDto({
      message: 'OTP is valid',
      data: {
        valid: isValid,
      },
    });
  }
}

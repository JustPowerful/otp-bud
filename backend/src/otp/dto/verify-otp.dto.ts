import { IsEmail, IsString, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'OTP must be at least 6 characters long' })
  otp: string;

  @IsString()
  @MinLength(1, { message: 'Application ID is required' })
  applicationId: string;

  @IsString()
  @MinLength(1)
  token: string;
}

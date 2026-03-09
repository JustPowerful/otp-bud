import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateOtpDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  applicationId: string;

  @IsString()
  @MinLength(1)
  token: string;
}

import { IsEmail, IsNumber, IsString } from 'class-validator';

export class SmtpDto {
  @IsString()
  smtpService: string; // host smtp url

  @IsString()
  smtpPort: string;

  @IsString()
  @IsEmail()
  smtpUser: string;

  @IsString()
  smtpPassword: string;
}

import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginAuthDto {
  @IsEmail()
  @MaxLength(100)
  readonly email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  readonly password: string;
}

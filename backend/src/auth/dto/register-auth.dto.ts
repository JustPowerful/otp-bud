import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterAuthDto {
  @IsString()
  @MaxLength(50)
  readonly firstname: string;

  @IsString()
  @MaxLength(50)
  readonly lastname: string;

  @IsEmail()
  @MaxLength(100)
  readonly email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  readonly password: string;
}

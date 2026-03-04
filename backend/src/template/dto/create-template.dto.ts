import { IsString, MinLength } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  subject: string;

  @IsString()
  @MinLength(10)
  body: string;
}

import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @MinLength(3, {
    message: 'Application name must be at least 3 characters long',
  })
  name: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

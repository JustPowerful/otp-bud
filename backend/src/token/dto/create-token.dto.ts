import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateTokenDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expirationTime?: number;
}

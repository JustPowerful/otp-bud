import { IsInt, IsOptional, IsString, Min } from "class-validator";
import { Type } from "class-transformer";
export class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
    
    @IsOptional()
    @IsString()
    query?: string;

    get skip() {
        return ((this.page || 1) - 1) * (this.limit || 10);
    }
}
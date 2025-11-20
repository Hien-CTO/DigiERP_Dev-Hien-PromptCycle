import { Transform, Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional } from "class-validator";
import { PaginationQueryDto } from "./pagination-query.dto";

export class GetFormulaProductsQueryDto extends PaginationQueryDto {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  brandId?: number;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true") {
        return true;
      }
      if (normalized === "false") {
        return false;
      }
    }
    if (typeof value === "boolean") {
      return value;
    }
    return undefined;
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";
import { PaginationQueryDto } from "./pagination-query.dto";

export class GetPackagingTypesQueryDto extends PaginationQueryDto {
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


import { IsOptional, IsString, IsBoolean, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MediaCategory } from './upload-image.dto';

export class MediaQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(MediaCategory)
  category?: MediaCategory;

  @IsOptional()
  @IsString()
  fileType?: 'IMAGE' | 'VIDEO' | 'DOCUMENT';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  // Entity association filters
  @IsOptional()
  @IsString()
  bloodCampId?: string;

  @IsOptional()
  @IsString()
  medicalCampId?: string;

  @IsOptional()
  @IsString()
  teamMemberId?: string;

  @IsOptional()
  @IsString()
  eventId?: string;
}

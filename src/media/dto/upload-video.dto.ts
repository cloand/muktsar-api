import { IsString, IsOptional, IsArray, IsBoolean, IsEnum, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { MediaCategory } from './upload-image.dto';

export class UploadVideoDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(MediaCategory)
  category?: MediaCategory = MediaCategory.GALLERY;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    return value;
  })
  tags?: string[];

  @IsOptional()
  @IsIn(['public', 'unlisted', 'private'])
  privacyStatus?: 'public' | 'unlisted' | 'private' = 'public';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean = false;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean = true;

  // Entity associations
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

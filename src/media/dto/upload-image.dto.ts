import { IsString, IsOptional, IsArray, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum MediaCategory {
  GALLERY = 'GALLERY',
  HERO = 'HERO',
  ABOUT = 'ABOUT',
  TEAM = 'TEAM',
  EVENTS = 'EVENTS',
  TESTIMONIALS = 'TESTIMONIALS',
  BLOOD_CAMPS = 'BLOOD_CAMPS',
  MEDICAL_CAMPS = 'MEDICAL_CAMPS',
  TEAM_MEMBERS = 'TEAM_MEMBERS',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  COMMUNITY_WORK = 'COMMUNITY_WORK',
  FUNDRAISING = 'FUNDRAISING',
  AWARENESS_CAMPAIGNS = 'AWARENESS_CAMPAIGNS',
  OTHER = 'OTHER',
}

export class UploadImageDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  altText?: string;

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

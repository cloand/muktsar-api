import { IsString, IsOptional, IsDateString, IsEnum, IsBoolean, IsUrl, IsJSON } from 'class-validator';
import { Transform } from 'class-transformer';

export enum EventCategory {
  BLOOD_CAMP = 'BLOOD_CAMP',
  MEDICAL_CAMP = 'MEDICAL_CAMP',
  AWARENESS = 'AWARENESS',
  FUNDRAISING = 'FUNDRAISING',
  COMMUNITY = 'COMMUNITY',
}

export enum EventStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  UPCOMING = 'UPCOMING',
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  eventDate: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  location: string;

  @IsString()
  address: string;

  @IsEnum(EventCategory)
  category: EventCategory;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus = EventStatus.UPCOMING;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean = false;

  @IsOptional()
  @IsJSON()
  highlights?: any;

  @IsOptional()
  @IsUrl()
  registrationLink?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  // Additional fields for comprehensive event management
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  maxParticipants?: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : 0)
  registeredParticipants?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  registrationRequired?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  registrationFee?: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  targetAmount?: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : 0)
  raisedAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  // Impact metrics
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  bloodUnitsCollected?: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  peopleServed?: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  volunteersParticipated?: number;
}

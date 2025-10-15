import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsInt, IsEnum, IsOptional, IsUrl, Min } from 'class-validator';
import { Status } from '@prisma/client';

export class CreateBloodCampDto {
  @ApiProperty({ example: 'Blood Donation Camp - Community Center' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Join us for a blood donation drive to help save lives in our community.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2024-12-25T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  campDate: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 'Community Center' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: '123 Main Street, Sri Muktsar Sahib, Punjab, India' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  @IsOptional()
  targetUnits?: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  collectedUnits?: number;

  @ApiProperty({ enum: Status, example: Status.UPCOMING })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiProperty({ example: 'Dr. John Doe' })
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @ApiProperty({ example: '+91 9876543210' })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @ApiProperty({ example: 'https://forms.google.com/blood-camp-registration' })
  @IsUrl()
  @IsOptional()
  registrationLink?: string;
}

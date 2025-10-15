import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsInt, IsEnum, IsOptional, IsJSON, Min } from 'class-validator';
import { Status } from '@prisma/client';

export class CreateMedicalCampDto {
  @ApiProperty({ example: 'Free Medical Camp - Rural Health Initiative' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Comprehensive health checkup and treatment for rural communities.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2024-12-25T00:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  campDate: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '16:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 'Village Community Center' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ example: 'Village Khokhar, Sri Muktsar Sahib, Punjab, India' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ 
    example: ['General Checkup', 'Blood Pressure', 'Diabetes Screening', 'Eye Checkup'],
    description: 'Array of medical services offered'
  })
  @IsOptional()
  services?: any;

  @ApiProperty({ example: 200 })
  @IsInt()
  @Min(0)
  @IsOptional()
  capacity?: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  registeredCount?: number;

  @ApiProperty({ enum: Status, example: Status.UPCOMING })
  @IsEnum(Status)
  @IsOptional()
  status?: Status;

  @ApiProperty({ example: 'Dr. Sarah Johnson' })
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @ApiProperty({ example: '+91 9876543210' })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;
}

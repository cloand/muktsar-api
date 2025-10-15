import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsInt, IsOptional, IsDateString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { BloodGroup, AlertUrgency } from '@prisma/client';

export class CreateAlertDto {
  @ApiProperty({ example: 'Urgent Blood Needed' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Patient needs immediate blood transfusion' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'City Hospital' })
  @IsString()
  @IsNotEmpty()
  hospitalName: string;

  @ApiProperty({ example: '123 Main Street, Muktsar, Punjab' })
  @IsString()
  @IsNotEmpty()
  hospitalAddress: string;

  @ApiProperty({ example: 'Dr. John Doe' })
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @ApiProperty({ example: '+91-9876543210' })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @ApiProperty({ enum: BloodGroup, example: BloodGroup.A_POSITIVE })
  @IsEnum(BloodGroup)
  bloodGroup: BloodGroup;

  @ApiProperty({ example: 3, description: 'Number of blood units required' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  unitsRequired: number;

  @ApiProperty({ enum: AlertUrgency, example: AlertUrgency.HIGH })
  @IsEnum(AlertUrgency)
  urgency: AlertUrgency;

  @ApiProperty({ 
    example: '2025-10-14T12:00:00Z', 
    description: 'Alert expiration date (optional, defaults to 24 hours from now)',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({ 
    example: 'Patient is in critical condition', 
    description: 'Additional notes (optional)',
    required: false 
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

import { IsEmail, IsString, IsOptional, IsEnum, IsDateString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum BloodGroup {
  A_POSITIVE = 'A_POSITIVE',
  A_NEGATIVE = 'A_NEGATIVE',
  B_POSITIVE = 'B_POSITIVE',
  B_NEGATIVE = 'B_NEGATIVE',
  AB_POSITIVE = 'AB_POSITIVE',
  AB_NEGATIVE = 'AB_NEGATIVE',
  O_POSITIVE = 'O_POSITIVE',
  O_NEGATIVE = 'O_NEGATIVE',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class RegisterDonorDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be a valid format' })
  phone: string;

  @ApiProperty({ enum: BloodGroup, example: BloodGroup.O_POSITIVE })
  @IsEnum(BloodGroup)
  bloodGroup: BloodGroup;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: '1990-01-01' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: '123 Main St' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'New York' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'NY' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '10001' })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;
}

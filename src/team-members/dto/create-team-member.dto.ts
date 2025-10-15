import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsBoolean, IsInt, IsUrl } from 'class-validator';

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'Sanam Batra' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Founder & President' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: 'Chief Executive Officer' })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({ example: 'sanam@muktsarngo.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+91 9876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Passionate leader dedicated to community service and social change.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/images/sanam-batra.jpg' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

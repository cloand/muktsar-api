import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class UpdateLastDonationDto {
  @ApiProperty({
    description: 'Last donation date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)',
    example: '2024-01-15T10:30:00.000Z',
    type: String,
  })
  @IsNotEmpty({ message: 'Last donation date is required' })
  @IsDateString({}, { message: 'Last donation date must be a valid date string' })
  lastDonationDate: string;
}

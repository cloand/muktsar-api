import { PartialType } from '@nestjs/swagger';
import { CreateBloodCampDto } from './create-blood-camp.dto';

export class UpdateBloodCampDto extends PartialType(CreateBloodCampDto) {}

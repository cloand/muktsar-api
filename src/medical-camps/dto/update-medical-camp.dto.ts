import { PartialType } from '@nestjs/swagger';
import { CreateMedicalCampDto } from './create-medical-camp.dto';

export class UpdateMedicalCampDto extends PartialType(CreateMedicalCampDto) {}

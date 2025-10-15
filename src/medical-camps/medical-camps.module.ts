import { Module } from '@nestjs/common';
import { MedicalCampsService } from './medical-camps.service';
import { MedicalCampsController } from './medical-camps.controller';

@Module({
  controllers: [MedicalCampsController],
  providers: [MedicalCampsService],
  exports: [MedicalCampsService],
})
export class MedicalCampsModule {}

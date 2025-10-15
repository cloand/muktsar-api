import { Module } from '@nestjs/common';
import { BloodCampsService } from './blood-camps.service';
import { BloodCampsController } from './blood-camps.controller';

@Module({
  controllers: [BloodCampsController],
  providers: [BloodCampsService],
  exports: [BloodCampsService],
})
export class BloodCampsModule {}

import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { BloodCampsModule } from '../blood-camps/blood-camps.module';
import { MedicalCampsModule } from '../medical-camps/medical-camps.module';
import { TeamMembersModule } from '../team-members/team-members.module';

@Module({
  imports: [BloodCampsModule, MedicalCampsModule, TeamMembersModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

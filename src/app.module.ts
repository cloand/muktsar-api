import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BloodCampsModule } from './blood-camps/blood-camps.module';
import { MedicalCampsModule } from './medical-camps/medical-camps.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MediaModule } from './media/media.module';
import { EventsModule } from './events/events.module';
import { DonorsModule } from './donors/donors.module';
import { AlertsModule } from './alerts/alerts.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BloodCampsModule,
    MedicalCampsModule,
    TeamMembersModule,
    DashboardModule,
    MediaModule,
    EventsModule,
    DonorsModule,
    AlertsModule,
    NotificationsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

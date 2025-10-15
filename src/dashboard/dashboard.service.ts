import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BloodCampsService } from '../blood-camps/blood-camps.service';
import { MedicalCampsService } from '../medical-camps/medical-camps.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private bloodCampsService: BloodCampsService,
    private medicalCampsService: MedicalCampsService,
  ) {}

  async getOverviewStats() {
    const [
      bloodCampStats,
      medicalCampStats,
      totalTeamMembers,
      totalUsers,
    ] = await Promise.all([
      this.bloodCampsService.getStatistics(),
      this.medicalCampsService.getStatistics(),
      this.prisma.teamMember.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: true } }),
    ]);

    return {
      bloodCamps: bloodCampStats,
      medicalCamps: medicalCampStats,
      teamMembers: totalTeamMembers,
      users: totalUsers,
      totalBloodUnitsCollected: bloodCampStats.totalUnitsCollected,
      totalPeopleServed: medicalCampStats.totalPeopleServed,
    };
  }

  async getRecentActivities() {
    const [recentBloodCamps, recentMedicalCamps] = await Promise.all([
      this.prisma.bloodCamp.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.medicalCamp.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    ]);

    const activities = [
      ...recentBloodCamps.map(camp => ({
        id: camp.id,
        type: 'blood_camp',
        title: camp.title,
        date: camp.campDate,
        createdBy: `${camp.creator.firstName} ${camp.creator.lastName}`,
        createdAt: camp.createdAt,
      })),
      ...recentMedicalCamps.map(camp => ({
        id: camp.id,
        type: 'medical_camp',
        title: camp.title,
        date: camp.campDate,
        createdBy: `${camp.creator.firstName} ${camp.creator.lastName}`,
        createdAt: camp.createdAt,
      })),
    ];

    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }

  async getUpcomingEvents() {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const [upcomingBloodCamps, upcomingMedicalCamps] = await Promise.all([
      this.prisma.bloodCamp.findMany({
        where: {
          campDate: {
            gte: today,
            lte: nextMonth,
          },
          status: 'UPCOMING',
        },
        orderBy: { campDate: 'asc' },
        take: 5,
      }),
      this.prisma.medicalCamp.findMany({
        where: {
          campDate: {
            gte: today,
            lte: nextMonth,
          },
          status: 'UPCOMING',
        },
        orderBy: { campDate: 'asc' },
        take: 5,
      }),
    ]);

    const events = [
      ...upcomingBloodCamps.map(camp => ({
        id: camp.id,
        type: 'blood_camp',
        title: camp.title,
        date: camp.campDate,
        location: camp.location,
        startTime: camp.startTime,
        endTime: camp.endTime,
      })),
      ...upcomingMedicalCamps.map(camp => ({
        id: camp.id,
        type: 'medical_camp',
        title: camp.title,
        date: camp.campDate,
        location: camp.location,
        startTime: camp.startTime,
        endTime: camp.endTime,
      })),
    ];

    return events
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);
  }

  async getMonthlyStats() {
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const monthlyData = await Promise.all(
      months.map(async (month) => {
        const startDate = new Date(currentYear, month - 1, 1);
        const endDate = new Date(currentYear, month, 0);

        const [bloodCamps, medicalCamps] = await Promise.all([
          this.prisma.bloodCamp.count({
            where: {
              campDate: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
          this.prisma.medicalCamp.count({
            where: {
              campDate: {
                gte: startDate,
                lte: endDate,
              },
            },
          }),
        ]);

        return {
          month,
          bloodCamps,
          medicalCamps,
          total: bloodCamps + medicalCamps,
        };
      })
    );

    return monthlyData;
  }
}

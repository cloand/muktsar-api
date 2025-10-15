import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    try {
      const [
        totalDonors,
        activeDonors,
        alertsThisMonth,
        totalDonations,
        bloodCampsThisYear,
        medicalCampsThisYear,
      ] = await Promise.all([
        // Total donors
        this.prisma.donor.count({ where: { isActive: true } }),
        
        // Active donors (eligible after 3 months)
        this.prisma.donor.count({
          where: {
            isActive: true,
            OR: [
              { lastDonationDate: null },
              { lastDonationDate: { lt: threeMonthsAgo } },
            ],
          },
        }),
        
        // Alerts this month
        this.prisma.alert.count({
          where: { createdAt: { gte: startOfMonth } },
        }),
        
        // Total donations
        this.prisma.donor.aggregate({
          _sum: { totalDonations: true },
        }),
        
        // Blood camps this year
        this.prisma.bloodCamp.count({
          where: { campDate: { gte: startOfYear } },
        }).catch(() => 0),
        
        // Medical camps this year
        this.prisma.medicalCamp.count({
          where: { campDate: { gte: startOfYear } },
        }).catch(() => 0),
      ]);

      return {
        summary: {
          totalDonors,
          activeDonors,
          alertsThisMonth,
          totalDonations: totalDonations._sum.totalDonations || 0,
          bloodCampsThisYear,
          medicalCampsThisYear,
        },
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating reports summary:', error);
      
      return {
        summary: {
          totalDonors: 0,
          activeDonors: 0,
          alertsThisMonth: 0,
          totalDonations: 0,
          bloodCampsThisYear: 0,
          medicalCampsThisYear: 0,
        },
        generatedAt: new Date().toISOString(),
        error: 'Some data may be unavailable',
      };
    }
  }
}

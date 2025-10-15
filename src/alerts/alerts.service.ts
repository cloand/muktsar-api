import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertStatus } from '@prisma/client';
import { CreateAlertDto } from './dto/create-alert.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AlertsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createAlertDto: CreateAlertDto & { createdBy: string }) {
    // Set default expiration to 24 hours from now if not provided
    const expiresAt = createAlertDto.expiresAt
      ? new Date(createAlertDto.expiresAt)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const alert = await this.prisma.alert.create({
      data: {
        ...createAlertDto,
        expiresAt,
        status: AlertStatus.ACTIVE,
        createdAt: new Date(),
      },
    });

    // Send FCM notifications to all donors
    console.log('Alert created, sending FCM notifications...');

    try {
      const notificationData = {
        alertId: alert.id,
        urgency: alert.urgency,
        bloodGroup: alert.bloodGroup || '',
        hospitalName: alert.hospitalName || '',
        hospitalAddress: alert.hospitalAddress || '',
        unitsRequired: alert.unitsRequired.toString(),
      };

      const notificationResult = await this.notificationsService.sendNotificationToDonors(
        `🚨 Emergency Blood Alert - ${alert.bloodGroup || 'All Groups'}`,
        `Urgent: ${alert.message}. Hospital: ${alert.hospitalName || 'Not specified'}`,
        notificationData,
      );

      console.log('FCM notification result:', notificationResult);
    } catch (error) {
      console.error('Failed to send FCM notifications:', error.message);
      // Don't throw error here - alert creation should succeed even if notifications fail
    }

    return alert;
  }

  async findAll() {
    return this.prisma.alert.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    const alerts = await this.prisma.alert.findMany({
      where: {
        status: AlertStatus.ACTIVE,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        _count: {
          select: { acceptances: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to include acceptedDonorsCount
    return alerts.map((alert) => ({
      ...alert,
      acceptedDonorsCount: (alert as any)._count.acceptances,
      _count: undefined,
    }));
  }

  async findPast() {
    const alerts = await this.prisma.alert.findMany({
      where: {
        OR: [
          { status: AlertStatus.RESOLVED },
          { status: AlertStatus.CANCELLED },
          {
            status: AlertStatus.ACTIVE,
            expiresAt: {
              lte: new Date(),
            },
          },
        ],
      },
      include: {
        _count: {
          select: { acceptances: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to include acceptedDonorsCount
    return alerts.map((alert) => ({
      ...alert,
      acceptedDonorsCount: (alert as any)._count.acceptances,
      _count: undefined,
    }));
  }

  async findOne(id: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    return alert;
  }

  async update(id: string, updateAlertDto: any) {
    const alert = await this.findOne(id);
    
    return this.prisma.alert.update({
      where: { id },
      data: updateAlertDto,
    });
  }

  async remove(id: string) {
    const alert = await this.findOne(id);

    return this.prisma.alert.update({
      where: { id },
      data: { status: AlertStatus.CANCELLED },
    });
  }

  async acceptAlert(alertId: string, userId: string, donorId?: string) {
    // Check if alert exists and is active
    const alert = await this.findOne(alertId);

    if (alert.status !== AlertStatus.ACTIVE) {
      throw new Error('Alert is not active');
    }

    if (new Date() > alert.expiresAt) {
      throw new Error('Alert has expired');
    }

    let actualDonorId: string;

    // If donorId is provided, use it directly (more efficient)
    if (donorId) {
      // Verify the donor exists
      const donor = await this.prisma.donor.findUnique({
        where: { id: donorId },
      });

      if (!donor) {
        throw new Error('Donor profile not found');
      }

      actualDonorId = donorId;
    } else {
      // Fallback: Find the user to get their email, then find donor
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.phone) {
        throw new Error('User phone number not found');
      }

      // Find the donor record by phone
      const donor = await this.prisma.donor.findFirst({
        where: { phone: user.phone },
      });

      if (!donor) {
        throw new Error('Donor profile not found');
      }

      actualDonorId = donor.id;
    }

    // Check if donor already accepted
    const existing = await this.prisma.alertAcceptance.findUnique({
      where: {
        alertId_donorId: {
          alertId,
          donorId: actualDonorId,
        },
      },
    });

    if (existing) {
      return { success: true, message: 'Already accepted this alert' };
    }

    // Create acceptance record
    await this.prisma.alertAcceptance.create({
      data: {
        alertId,
        donorId: actualDonorId,
      },
    });

    return { success: true, message: 'Alert accepted successfully' };
  }

  async getAcceptedDonors(alertId: string) {
    // Check if alert exists
    await this.findOne(alertId);

    const acceptances = await this.prisma.alertAcceptance.findMany({
      where: { alertId },
      include: {
        donor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(acceptances,'acceptances8')

    return {
      data: acceptances.map((acceptance) => ({
        ...acceptance.donor,
        acceptedAt: acceptance.createdAt,
      })),
    };
  }

  async markComplete(alertId: string) {
    const alert = await this.findOne(alertId);

    return this.prisma.alert.update({
      where: { id: alertId },
      data: { status: AlertStatus.RESOLVED },
    });
  }

  async findActiveForDonor(userId: string, donorId?: string) {
    const alerts = await this.findActive();

    let actualDonorId: string | null = null;

    // Get donor ID if not provided
    if (donorId) {
      actualDonorId = donorId;
    } else if (userId) {
      // Find the user to get their email, then find donor
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user && user.phone) {
        const donor = await this.prisma.donor.findFirst({
          where: { phone: user.phone },
        });
        actualDonorId = donor?.id || null;
      }
    }

    // If no donor ID found, return alerts without acceptance status
    if (!actualDonorId) {
      return alerts.map(alert => ({
        ...alert,
        hasAccepted: false,
      }));
    }

    // Check acceptance status for each alert
    const alertsWithAcceptance = await Promise.all(
      alerts.map(async (alert) => {
        const acceptance = await this.prisma.alertAcceptance.findUnique({
          where: {
            alertId_donorId: {
              alertId: alert.id,
              donorId: actualDonorId,
            },
          },
        });

        return {
          ...alert,
          hasAccepted: !!acceptance,
        };
      })
    );

    return alertsWithAcceptance;
  }
}

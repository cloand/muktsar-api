import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseService, FCMNotificationPayload } from '../firebase/firebase.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService,
  ) {}

  async registerFCMToken(userId: string, token: string, deviceId?: string) {
    // Check if token already exists
    const existingToken = await this.prisma.fCMToken.findFirst({
      where: { userId, token },
    });

    if (existingToken) {
      return existingToken;
    }

    // Create new FCM token
    return this.prisma.fCMToken.create({
      data: {
        userId,
        token,
        deviceId: deviceId || 'unknown',
        platform: 'mobile',
        isActive: true,
      },
    });
  }

  async unregisterFCMToken(userId: string, token: string) {
    return this.prisma.fCMToken.updateMany({
      where: { userId, token },
      data: { isActive: false },
    });
  }

  async getUserTokens(userId: string) {
    return this.prisma.fCMToken.findMany({
      where: { userId, isActive: true },
    });
  }

  async getAllActiveTokens() {
    return this.prisma.fCMToken.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });
  }

  async sendNotificationToAll(title: string, body: string, data?: any) {
    this.logger.log('Sending notification to all users:', { title, body, data });

    const tokens = await this.getAllActiveTokens();
    this.logger.log(`Found ${tokens.length} active FCM tokens`);

    if (tokens.length === 0) {
      return {
        success: true,
        tokensCount: 0,
        successCount: 0,
        failureCount: 0,
        message: 'No active FCM tokens found',
      };
    }

    // Extract just the token strings
    const tokenStrings = tokens.map(tokenRecord => tokenRecord.token);

    // Prepare FCM payload
    const payload: FCMNotificationPayload = {
      title,
      body,
      data: data ? this.convertDataToStringMap(data) : undefined,
    };

    // Send notifications using Firebase
    const result = await this.firebaseService.sendToMultipleTokens(tokenStrings, payload);

    this.logger.log(`Notification sent. Success: ${result.successCount}, Failure: ${result.failureCount}`);

    return {
      success: result.success,
      tokensCount: tokens.length,
      successCount: result.successCount,
      failureCount: result.failureCount,
      message: result.success ? 'Notification sent successfully' : 'Some notifications failed to send',
      errors: result.errors,
    };
  }

  async sendNotificationToUser(userId: string, title: string, body: string, data?: any) {
    this.logger.log(`Sending notification to user ${userId}:`, { title, body, data });

    const tokens = await this.getUserTokens(userId);
    this.logger.log(`Found ${tokens.length} active FCM tokens for user ${userId}`);

    if (tokens.length === 0) {
      return {
        success: true,
        tokensCount: 0,
        successCount: 0,
        failureCount: 0,
        message: 'No active FCM tokens found for user',
      };
    }

    // Extract just the token strings
    const tokenStrings = tokens.map(tokenRecord => tokenRecord.token);

    // Prepare FCM payload
    const payload: FCMNotificationPayload = {
      title,
      body,
      data: data ? this.convertDataToStringMap(data) : undefined,
    };

    // Send notifications using Firebase
    const result = await this.firebaseService.sendToMultipleTokens(tokenStrings, payload);

    this.logger.log(`Notification sent to user ${userId}. Success: ${result.successCount}, Failure: ${result.failureCount}`);

    return {
      success: result.success,
      tokensCount: tokens.length,
      successCount: result.successCount,
      failureCount: result.failureCount,
      message: result.success ? 'Notification sent successfully' : 'Some notifications failed to send',
      errors: result.errors,
    };
  }

  async sendNotificationToDonors(title: string, body: string, data?: any) {
    this.logger.log('Sending notification to all donors:', { title, body, data });

    // Get all active tokens for users with DONOR role
    const tokens = await this.prisma.fCMToken.findMany({
      where: {
        isActive: true,
        user: {
          role: 'DONOR',
        },
      },
      include: {
        user: {
          select: { id: true, phone: true, role: true },
        },
      },
    });

    this.logger.log(`Found ${tokens.length} active FCM tokens for donors`);

    if (tokens.length === 0) {
      return {
        success: true,
        tokensCount: 0,
        successCount: 0,
        failureCount: 0,
        message: 'No active FCM tokens found for donors',
      };
    }

    // Extract just the token strings
    const tokenStrings = tokens.map(tokenRecord => tokenRecord.token);

    // Prepare FCM payload
    const payload: FCMNotificationPayload = {
      title,
      body,
      data: data ? this.convertDataToStringMap(data) : undefined,
    };

    // Send notifications using Firebase
    const result = await this.firebaseService.sendToMultipleTokens(tokenStrings, payload);

    this.logger.log(`Notification sent to donors. Success: ${result.successCount}, Failure: ${result.failureCount}`);

    return {
      success: result.success,
      tokensCount: tokens.length,
      successCount: result.successCount,
      failureCount: result.failureCount,
      message: result.success ? 'Notification sent successfully to donors' : 'Some notifications failed to send',
      errors: result.errors,
    };
  }

  /**
   * Convert data object to string map as required by FCM
   */
  private convertDataToStringMap(data: any): { [key: string]: string } {
    const stringMap: { [key: string]: string } = {};

    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        stringMap[key] = String(value);
      }
    }

    return stringMap;
  }
}

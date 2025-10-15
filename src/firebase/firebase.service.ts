import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import * as admin from 'firebase-admin';

export interface FCMNotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
  imageUrl?: string;
}

export interface FCMSendResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors?: string[];
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private app: any; // admin.app.App;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.logger.warn('Firebase FCM is temporarily disabled due to compatibility issues');
    this.logger.warn('Please update firebase-admin package or fix sendMulticast method');
  }

  /**
   * Send notification to a single FCM token
   */
  async sendToToken(token: string, payload: FCMNotificationPayload): Promise<boolean> {
    this.logger.warn('FCM sendToToken called but Firebase is disabled');
    return false;
  }

  /**
   * Send notification to multiple FCM tokens
   */
  async sendToMultipleTokens(tokens: string[], payload: FCMNotificationPayload): Promise<FCMSendResult> {
    this.logger.warn(`FCM sendToMultipleTokens called for ${tokens.length} tokens but Firebase is disabled`);
    return {
      success: false,
      successCount: 0,
      failureCount: tokens.length,
      errors: ['Firebase FCM is temporarily disabled'],
    };
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(topic: string, payload: FCMNotificationPayload): Promise<boolean> {
    this.logger.warn('FCM sendToTopic called but Firebase is disabled');
    return false;
  }

  /**
   * Subscribe tokens to a topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    this.logger.warn('FCM subscribeToTopic called but Firebase is disabled');
  }

  /**
   * Unsubscribe tokens from a topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    this.logger.warn('FCM unsubscribeFromTopic called but Firebase is disabled');
  }
}

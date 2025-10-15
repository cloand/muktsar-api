import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register FCM token for push notifications' })
  @ApiResponse({ status: 201, description: 'FCM token registered successfully' })
  async registerToken(@Body() body: { token: string; deviceId?: string }, @Request() req: any) {
    return this.notificationsService.registerFCMToken(
      req.user.sub,
      body.token,
      body.deviceId,
    );
  }

  @Post('unregister-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unregister FCM token' })
  @ApiResponse({ status: 200, description: 'FCM token unregistered successfully' })
  async unregisterToken(@Body() body: { token: string }, @Request() req: any) {
    return this.notificationsService.unregisterFCMToken(req.user.sub, body.token);
  }

  @Post('test-notification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send test notification to all donors (Admin only)' })
  @ApiResponse({ status: 200, description: 'Test notification sent successfully' })
  async sendTestNotification(@Body() body: { title?: string; message?: string }, @Request() req: any) {
    const title = body.title || '🧪 Test Notification';
    const message = body.message || 'This is a test notification from Muktsar NGO app.';

    return this.notificationsService.sendNotificationToDonors(title, message, {
      type: 'test',
      timestamp: new Date().toISOString(),
    });
  }

  @Get('tokens/count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get count of active FCM tokens' })
  @ApiResponse({ status: 200, description: 'Active FCM tokens count retrieved successfully' })
  async getActiveTokensCount() {
    const tokens = await this.notificationsService.getAllActiveTokens();
    return {
      totalTokens: tokens.length,
      donorTokens: tokens.filter(t => t.user?.role === 'DONOR').length,
      adminTokens: tokens.filter(t => t.user?.role === 'ADMIN' || t.user?.role === 'SUPER_ADMIN').length,
    };
  }
}

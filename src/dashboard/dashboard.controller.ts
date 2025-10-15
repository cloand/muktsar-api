import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview statistics (Public)' })
  @ApiResponse({ status: 200, description: 'Overview statistics retrieved successfully' })
  getOverviewStats() {
    return this.dashboardService.getOverviewStats();
  }

  @Get('recent-activities')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent activities (Admin only)' })
  @ApiResponse({ status: 200, description: 'Recent activities retrieved successfully' })
  getRecentActivities() {
    return this.dashboardService.getRecentActivities();
  }

  @Get('upcoming-events')
  @ApiOperation({ summary: 'Get upcoming events (Public)' })
  @ApiResponse({ status: 200, description: 'Upcoming events retrieved successfully' })
  getUpcomingEvents() {
    return this.dashboardService.getUpcomingEvents();
  }

  @Get('monthly-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get monthly statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Monthly statistics retrieved successfully' })
  getMonthlyStats() {
    return this.dashboardService.getMonthlyStats();
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create emergency alert (Admin only)' })
  @ApiResponse({ status: 201, description: 'Alert created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  create(@Body() createAlertDto: CreateAlertDto, @Request() req: any) {
    return this.alertsService.create({
      ...createAlertDto,
      createdBy: req.user.userId,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all alerts (All authenticated users)' })
  @ApiResponse({ status: 200, description: 'Alerts retrieved successfully' })
  findAll() {
    return this.alertsService.findAll();
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active alerts (All authenticated users)' })
  @ApiResponse({ status: 200, description: 'Active alerts retrieved successfully' })
  findActive() {
    return this.alertsService.findActive();
  }

  @Get('active/for-donor')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active alerts with donor acceptance status (Donors)' })
  @ApiResponse({ status: 200, description: 'Active alerts with acceptance status retrieved successfully' })
  findActiveForDonor(@Request() req: any) {
    return this.alertsService.findActiveForDonor(req.user.userId, req.user.donorId);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current alerts with acceptance status (All authenticated users)' })
  @ApiResponse({ status: 200, description: 'Current alerts with acceptance status retrieved successfully' })
  findCurrent(@Request() req: any) {
    // Always include acceptance status for the authenticated user
    return this.alertsService.findActiveForDonor(req.user.userId, req.user.donorId);
  }

  @Get('past')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get past/completed alerts (All authenticated users)' })
  @ApiResponse({ status: 200, description: 'Past alerts retrieved successfully' })
  findPast() {
    return this.alertsService.findPast();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get alert by ID (All authenticated users)' })
  @ApiResponse({ status: 200, description: 'Alert retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update alert (Admin only)' })
  @ApiResponse({ status: 200, description: 'Alert updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  update(@Param('id') id: string, @Body() updateAlertDto: any) {
    return this.alertsService.update(id, updateAlertDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete alert (Admin only)' })
  @ApiResponse({ status: 200, description: 'Alert deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  remove(@Param('id') id: string) {
    return this.alertsService.remove(id);
  }

  @Post(':id/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept an alert (Donor)' })
  @ApiResponse({ status: 200, description: 'Alert accepted successfully' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  acceptAlert(@Param('id') id: string, @Request() req: any) {
    // Pass both userId and donorId (donorId will be used if available for better performance)
    return this.alertsService.acceptAlert(id, req.user.userId, req.user.donorId);
  }

  @Get(':id/accepted-donors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get donors who accepted the alert (Admin only)' })
  @ApiResponse({ status: 200, description: 'Accepted donors retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  getAcceptedDonors(@Param('id') id: string) {
    return this.alertsService.getAcceptedDonors(id);
  }

  @Post(':id/mark-complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark alert as complete (Admin only)' })
  @ApiResponse({ status: 200, description: 'Alert marked as complete' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  markComplete(@Param('id') id: string) {
    return this.alertsService.markComplete(id);
  }
}

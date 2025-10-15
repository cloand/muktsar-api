import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MedicalCampsService } from './medical-camps.service';
import { CreateMedicalCampDto } from './dto/create-medical-camp.dto';
import { UpdateMedicalCampDto } from './dto/update-medical-camp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Medical Camps')
@Controller('medical-camps')
export class MedicalCampsController {
  constructor(private readonly medicalCampsService: MedicalCampsService) {}

  @Post()
  // @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
  // @ApiBearerAuth() // Uncomment when auth is ready
  @ApiOperation({ summary: 'Create a new medical camp' })
  @ApiResponse({ status: 201, description: 'Medical camp created successfully' })
  create(@Body() createMedicalCampDto: CreateMedicalCampDto, @Request() req) {
    // For now, use a default user ID. Replace with req.user.userId when auth is ready
    const userId = req.user?.userId || 'default-user-id';
    return this.medicalCampsService.create(createMedicalCampDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medical camps' })
  @ApiResponse({ status: 200, description: 'Medical camps retrieved successfully' })
  findAll() {
    return this.medicalCampsService.findAll();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming medical camps' })
  @ApiResponse({ status: 200, description: 'Upcoming medical camps retrieved successfully' })
  getUpcoming() {
    return this.medicalCampsService.getUpcoming();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get medical camps statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics() {
    return this.medicalCampsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medical camp by ID' })
  @ApiResponse({ status: 200, description: 'Medical camp retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Medical camp not found' })
  findOne(@Param('id') id: string) {
    return this.medicalCampsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update medical camp' })
  @ApiResponse({ status: 200, description: 'Medical camp updated successfully' })
  @ApiResponse({ status: 404, description: 'Medical camp not found' })
  update(@Param('id') id: string, @Body() updateMedicalCampDto: UpdateMedicalCampDto) {
    return this.medicalCampsService.update(id, updateMedicalCampDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete medical camp' })
  @ApiResponse({ status: 200, description: 'Medical camp deleted successfully' })
  @ApiResponse({ status: 404, description: 'Medical camp not found' })
  remove(@Param('id') id: string) {
    return this.medicalCampsService.remove(id);
  }
}

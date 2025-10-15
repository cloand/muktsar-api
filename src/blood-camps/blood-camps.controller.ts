import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BloodCampsService } from './blood-camps.service';
import { CreateBloodCampDto } from './dto/create-blood-camp.dto';
import { UpdateBloodCampDto } from './dto/update-blood-camp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Blood Camps')
@Controller('blood-camps')
export class BloodCampsController {
  constructor(private readonly bloodCampsService: BloodCampsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blood camp' })
  @ApiResponse({ status: 201, description: 'Blood camp created successfully' })
  create(@Body() createBloodCampDto: CreateBloodCampDto, @Request() req) {
    return this.bloodCampsService.create(createBloodCampDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all blood camps' })
  @ApiResponse({ status: 200, description: 'Blood camps retrieved successfully' })
  findAll() {
    return this.bloodCampsService.findAll();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming blood camps' })
  @ApiResponse({ status: 200, description: 'Upcoming blood camps retrieved successfully' })
  getUpcoming() {
    return this.bloodCampsService.getUpcoming();
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get blood camps statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStatistics() {
    return this.bloodCampsService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get blood camp by ID' })
  @ApiResponse({ status: 200, description: 'Blood camp retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Blood camp not found' })
  findOne(@Param('id') id: string) {
    return this.bloodCampsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update blood camp' })
  @ApiResponse({ status: 200, description: 'Blood camp updated successfully' })
  @ApiResponse({ status: 404, description: 'Blood camp not found' })
  update(@Param('id') id: string, @Body() updateBloodCampDto: UpdateBloodCampDto) {
    return this.bloodCampsService.update(id, updateBloodCampDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blood camp' })
  @ApiResponse({ status: 200, description: 'Blood camp deleted successfully' })
  @ApiResponse({ status: 404, description: 'Blood camp not found' })
  remove(@Param('id') id: string) {
    return this.bloodCampsService.remove(id);
  }
}

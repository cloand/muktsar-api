import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DonorsService } from './donors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateLastDonationDto } from './dto/update-last-donation.dto';

@ApiTags('donors')
@Controller('donors')
export class DonorsController {
  constructor(private readonly donorsService: DonorsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all donors (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of donors retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  findAll(@Query() query: any) {
    return this.donorsService.findAll(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current donor profile (Donor only)' })
  @ApiResponse({ status: 200, description: 'Donor profile retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Donor access only' })
  @ApiResponse({ status: 404, description: 'Donor profile not found' })
  async getMyProfile(@Request() req: any) {
    if (req.user.role !== 'DONOR') {
      throw new ForbiddenException('Only donors can access this endpoint');
    }
    console.log('getMyProfile', req.user);
    return this.donorsService.findByUserEmail(req.user.email);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get donor by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Donor retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Donor not found' })
  findOne(@Param('id') id: string) {
    return this.donorsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new donor (Admin only)' })
  @ApiResponse({ status: 201, description: 'Donor created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  create(@Body() createDonorDto: any) {
    return this.donorsService.create(createDonorDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update donor (Admin only)' })
  @ApiResponse({ status: 200, description: 'Donor updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Donor not found' })
  update(@Param('id') id: string, @Body() updateDonorDto: any) {
    return this.donorsService.update(id, updateDonorDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete donor (Admin only)' })
  @ApiResponse({ status: 200, description: 'Donor deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Donor not found' })
  remove(@Param('id') id: string) {
    return this.donorsService.remove(id);
  }

  @Patch(':id/last-donation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update donor last donation date (Admin only)' })
  @ApiResponse({ status: 200, description: 'Last donation date updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Donor not found' })
  @ApiResponse({ status: 400, description: 'Invalid date format' })
  updateLastDonationDate(
    @Param('id') id: string,
    @Body() updateLastDonationDto: UpdateLastDonationDto
  ) {
    const donationDate = new Date(updateLastDonationDto.lastDonationDate);

    // Validate the date
    if (isNaN(donationDate.getTime())) {
      throw new BadRequestException('Invalid date format. Please provide a valid date.');
    }

    // Ensure the date is not in the future
    if (donationDate > new Date()) {
      throw new BadRequestException('Last donation date cannot be in the future.');
    }

    return this.donorsService.updateLastDonationDate(id, donationDate);
  }

  @Patch('update-eligibility')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update all donors eligibility based on 3-month rule (Admin only)' })
  @ApiResponse({ status: 200, description: 'All donors eligibility updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  updateAllDonorsEligibility() {
    return this.donorsService.updateAllDonorsEligibility();
  }
}

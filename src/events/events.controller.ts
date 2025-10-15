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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Uncomment when auth is ready

@ApiTags('events')
@Controller('events')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
// @ApiBearerAuth() // Uncomment when auth is ready
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event created successfully' })
  async create(@Body() createEventDto: CreateEventDto, @Request() req: any) {
    // For now, use a default user ID. Replace with req.user.id when auth is ready
    const userId = req.user?.id || 'default-user-id';
    return this.eventsService.create(createEventDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  async findAll(@Query() queryDto: QueryEventDto) {
    return this.eventsService.findAll(queryDto);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured events' })
  @ApiResponse({ status: 200, description: 'Featured events retrieved successfully' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.eventsService.getFeatured(limit);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiResponse({ status: 200, description: 'Upcoming events retrieved successfully' })
  async getUpcoming(@Query('limit') limit?: number) {
    return this.eventsService.getUpcoming(limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get event statistics' })
  @ApiResponse({ status: 200, description: 'Event statistics retrieved successfully' })
  async getStats() {
    return this.eventsService.getStats();
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get events by category' })
  @ApiResponse({ status: 200, description: 'Events by category retrieved successfully' })
  async getByCategory(
    @Param('category') category: string,
    @Query('limit') limit?: number,
  ) {
    return this.eventsService.getByCategory(category, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({ status: 200, description: 'Event retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  @ApiResponse({ status: 200, description: 'Event updated successfully' })
  async update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}

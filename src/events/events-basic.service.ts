import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';

@Injectable()
export class EventsBasicService {
  private readonly logger = new Logger(EventsBasicService.name);

  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, userId: string) {
    try {
      // Use only basic fields that definitely exist
      const basicEventData = {
        title: createEventDto.title,
        description: createEventDto.description,
        eventDate: createEventDto.eventDate,
        startTime: createEventDto.startTime,
        endTime: createEventDto.endTime,
        location: createEventDto.location,
        address: createEventDto.address,
        category: createEventDto.category,
        status: createEventDto.status || 'UPCOMING',
        isFeatured: createEventDto.isFeatured || false,
        registrationLink: createEventDto.registrationLink,
        imageUrl: createEventDto.imageUrl,
        createdBy: userId,
      };

      const event = await this.prisma.event.create({
        data: basicEventData as any,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(`Event created: ${event.id}`);
      return event;
    } catch (error) {
      this.logger.error('Failed to create event', error);
      throw error;
    }
  }

  async findAll(queryDto: QueryEventDto) {
    const {
      search,
      category,
      status,
      isFeatured,
      upcoming_only,
      event_type,
      page = 1,
      limit = 20,
      sortBy = 'eventDate',
      sortOrder = 'desc',
      sort,
    } = queryDto;

    const where: any = {};

    // Search functionality
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by category
    if (category) where.category = category;
    if (event_type) where.category = event_type;

    // Filter by status
    if (status) where.status = status;

    // Filter by featured
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    // Filter upcoming events only
    if (upcoming_only) {
      where.eventDate = {
        gte: new Date(),
      };
      where.status = {
        in: ['UPCOMING' as any, 'ACTIVE' as any],
      };
    }

    // Handle sort parameter
    let finalSortBy = sortBy;
    let finalSortOrder = sortOrder;
    
    if (sort) {
      if (sort.startsWith('-')) {
        finalSortBy = sort.substring(1);
        finalSortOrder = 'desc';
      } else {
        finalSortBy = sort;
        finalSortOrder = 'asc';
      }
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [finalSortBy]: finalSortOrder },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        has_next_page: page < Math.ceil(total / limit),
        has_prev_page: page > 1,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto) {
    const existingEvent = await this.findOne(id);

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: updateEventDto as any,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    this.logger.log(`Event updated: ${id}`);
    return updatedEvent;
  }

  async remove(id: string) {
    const existingEvent = await this.findOne(id);

    await this.prisma.event.delete({
      where: { id },
    });

    this.logger.log(`Event deleted: ${id}`);
    return { message: 'Event deleted successfully' };
  }

  async getFeatured(limit: number = 10) {
    return this.prisma.event.findMany({
      where: { isFeatured: true },
      take: limit,
      orderBy: { eventDate: 'asc' },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getUpcoming(limit?: number) {
    const where = {
      eventDate: {
        gte: new Date(),
      },
      status: {
        in: ['UPCOMING' as any, 'ACTIVE' as any],
      },
    };

    return this.prisma.event.findMany({
      where,
      take: limit,
      orderBy: { eventDate: 'asc' },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getByCategory(category: string, limit?: number) {
    return this.prisma.event.findMany({
      where: { category: category as any },
      take: limit,
      orderBy: { eventDate: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getStats() {
    try {
      const [
        totalEvents,
        upcomingEvents,
        completedEvents,
        featuredEvents,
        bloodCamps,
        medicalCamps,
      ] = await Promise.all([
        this.prisma.event.count(),
        this.prisma.event.count({
          where: {
            eventDate: { gte: new Date() },
            status: { in: ['UPCOMING' as any, 'ACTIVE' as any] },
          },
        }),
        this.prisma.event.count({ where: { status: 'COMPLETED' as any } }),
        this.prisma.event.count({ where: { isFeatured: true } }),
        this.prisma.event.count({ where: { category: 'BLOOD_CAMP' as any } }),
        this.prisma.event.count({ where: { category: 'MEDICAL_CAMP' as any } }),
      ]);

      // Use basic estimates for impact metrics
      return {
        totalEvents,
        upcomingEvents,
        completedEvents,
        featuredEvents,
        bloodCamps,
        medicalCamps,
        totalParticipants: totalEvents * 50, // Estimate
        totalBloodUnits: bloodCamps * 25, // Estimate
        totalPeopleServed: medicalCamps * 100, // Estimate
        totalFundsRaised: totalEvents * 10000, // Estimate
      };
    } catch (error) {
      this.logger.error('Failed to get event statistics', error);
      return {
        totalEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        featuredEvents: 0,
        bloodCamps: 0,
        medicalCamps: 0,
        totalParticipants: 0,
        totalBloodUnits: 0,
        totalPeopleServed: 0,
        totalFundsRaised: 0,
      };
    }
  }
}

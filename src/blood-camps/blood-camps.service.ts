import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBloodCampDto } from './dto/create-blood-camp.dto';
import { UpdateBloodCampDto } from './dto/update-blood-camp.dto';

@Injectable()
export class BloodCampsService {
  constructor(private prisma: PrismaService) {}

  async create(createBloodCampDto: CreateBloodCampDto, userId: string) {
    // Convert campDate string to proper DateTime
    const campDate = new Date(createBloodCampDto.campDate);

    return this.prisma.bloodCamp.create({
      data: {
        ...createBloodCampDto,
        campDate: campDate,
        createdBy: userId,
      },
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
  }

  async findAll() {
    return this.prisma.bloodCamp.findMany({
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
      orderBy: {
        campDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const bloodCamp = await this.prisma.bloodCamp.findUnique({
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

    if (!bloodCamp) {
      throw new NotFoundException('Blood camp not found');
    }

    return bloodCamp;
  }

  async update(id: string, updateBloodCampDto: UpdateBloodCampDto) {
    const bloodCamp = await this.findOne(id);

    // Convert campDate string to proper DateTime if provided
    const updateData = { ...updateBloodCampDto };
    if (updateData.campDate) {
      updateData.campDate = new Date(updateData.campDate) as any;
    }

    return this.prisma.bloodCamp.update({
      where: { id },
      data: updateData,
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
  }

  async remove(id: string) {
    const bloodCamp = await this.findOne(id);

    return this.prisma.bloodCamp.delete({
      where: { id },
    });
  }

  async getUpcoming() {
    return this.prisma.bloodCamp.findMany({
      where: {
        campDate: {
          gte: new Date(),
        },
        status: 'UPCOMING',
      },
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
      orderBy: {
        campDate: 'asc',
      },
    });
  }

  async getStatistics() {
    const total = await this.prisma.bloodCamp.count();
    const upcoming = await this.prisma.bloodCamp.count({
      where: {
        campDate: {
          gte: new Date(),
        },
        status: 'UPCOMING',
      },
    });
    const completed = await this.prisma.bloodCamp.count({
      where: {
        status: 'COMPLETED',
      },
    });

    const totalUnitsCollected = await this.prisma.bloodCamp.aggregate({
      _sum: {
        collectedUnits: true,
      },
      where: {
        status: 'COMPLETED',
      },
    });

    return {
      total,
      upcoming,
      completed,
      totalUnitsCollected: totalUnitsCollected._sum.collectedUnits || 0,
    };
  }
}

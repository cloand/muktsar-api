import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalCampDto } from './dto/create-medical-camp.dto';
import { UpdateMedicalCampDto } from './dto/update-medical-camp.dto';

@Injectable()
export class MedicalCampsService {
  constructor(private prisma: PrismaService) {}

  async create(createMedicalCampDto: CreateMedicalCampDto, userId: string) {
    // Convert campDate string to proper DateTime
    const campDate = new Date(createMedicalCampDto.campDate);

    return this.prisma.medicalCamp.create({
      data: {
        ...createMedicalCampDto,
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
    return this.prisma.medicalCamp.findMany({
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
    const medicalCamp = await this.prisma.medicalCamp.findUnique({
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

    if (!medicalCamp) {
      throw new NotFoundException('Medical camp not found');
    }

    return medicalCamp;
  }

  async update(id: string, updateMedicalCampDto: UpdateMedicalCampDto) {
    const medicalCamp = await this.findOne(id);

    // Convert campDate string to proper DateTime if provided
    const updateData = { ...updateMedicalCampDto };
    if (updateData.campDate) {
      updateData.campDate = new Date(updateData.campDate) as any;
    }

    return this.prisma.medicalCamp.update({
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
    const medicalCamp = await this.findOne(id);

    return this.prisma.medicalCamp.delete({
      where: { id },
    });
  }

  async getUpcoming() {
    return this.prisma.medicalCamp.findMany({
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
    const total = await this.prisma.medicalCamp.count();
    const upcoming = await this.prisma.medicalCamp.count({
      where: {
        campDate: {
          gte: new Date(),
        },
        status: 'UPCOMING',
      },
    });
    const completed = await this.prisma.medicalCamp.count({
      where: {
        status: 'COMPLETED',
      },
    });

    const totalPeopleServed = await this.prisma.medicalCamp.aggregate({
      _sum: {
        registeredCount: true,
      },
      where: {
        status: 'COMPLETED',
      },
    });

    return {
      total,
      upcoming,
      completed,
      totalPeopleServed: totalPeopleServed._sum.registeredCount || 0,
    };
  }
}

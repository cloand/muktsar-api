import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Donor, Prisma } from '@prisma/client';

@Injectable()
export class DonorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any = {}) {
    const { bloodGroup, gender, isEligible, search, page = 1, limit = 10 } = query;
    
    const where: any = {
      isActive: true,
    };

    if (bloodGroup) {
      where.bloodGroup = bloodGroup;
    }

    if (gender) {
      where.gender = gender;
    }

    if (isEligible !== undefined) {
      where.isEligible = isEligible === 'true';
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const take = parseInt(limit);

    const [donors, total] = await Promise.all([
      this.prisma.donor.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.donor.count({ where }),
    ]);

    // Update eligibility for all donors based on current date and last donation
    const donorsWithUpdatedEligibility = donors.map(donor => ({
      ...donor,
      isEligible: this.calculateEligibility(donor.lastDonationDate)
    }));

    return {
      data: donorsWithUpdatedEligibility,
      meta: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const donor = await this.prisma.donor.findUnique({
      where: { id },
    });

    if (!donor) {
      throw new NotFoundException('Donor not found');
    }

    // Update eligibility based on current date and last donation
    return {
      ...donor,
      isEligible: this.calculateEligibility(donor.lastDonationDate)
    };
  }

  async findByUserId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const donor = await this.prisma.donor.findUnique({
      where: { phone: user.phone },
    });
    
    if (!donor) {
      throw new NotFoundException('Donor profile not found');
    }
    
    return donor;
  }

  async findByUserEmail(userEmail: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: userEmail },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.phone) {
      throw new NotFoundException('User phone not found');
    }

    const donor = await this.prisma.donor.findUnique({
      where: { phone: user.phone },
    });

    if (!donor) {
      throw new NotFoundException('Donor profile not found');
    }

    return donor;
  }

  async findByUserPhone(userPhone: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone: userPhone },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const donor = await this.prisma.donor.findUnique({
      where: { phone: userPhone },
    });

    if (!donor) {
      throw new NotFoundException('Donor profile not found');
    }

    return donor;
  }

  async create(createDonorDto: any) {
    return this.prisma.donor.create({
      data: createDonorDto,
    });
  }

  async createDonorWithUser(data: {
    user: Prisma.UserCreateInput;
    donor: Prisma.DonorCreateInput;
  }): Promise<{ user: User; donor: Donor }> {
    // Use Prisma transaction to ensure both user and donor are created together
    // If either fails, both operations are rolled back
    return this.prisma.$transaction(async (prisma) => {
      // Create user first
      const user = await prisma.user.create({
        data: data.user,
      });

      // Create donor with the same email
      const donor = await prisma.donor.create({
        data: data.donor,
      });

      return { user, donor };
    });
  }

  async update(id: string, updateDonorDto: any) {
    const donor = await this.findOne(id);
    
    return this.prisma.donor.update({
      where: { id },
      data: updateDonorDto,
    });
  }

  async remove(id: string) {
    const donor = await this.findOne(id);

    return this.prisma.donor.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateLastDonationDate(id: string, lastDonationDate: Date) {
    const donor = await this.findOne(id);

    // Calculate new eligibility based on 3-month rule
    const isEligible = this.calculateEligibility(lastDonationDate);

    return this.prisma.donor.update({
      where: { id },
      data: {
        lastDonationDate,
        isEligible,
        // Optionally increment total donations count
        totalDonations: { increment: 1 }
      },
    });
  }

  /**
   * Calculate donor eligibility based on 3-month rule
   * A donor is eligible if their last donation was more than 3 months ago
   * or if they have never donated before
   */
  private calculateEligibility(lastDonationDate: Date | null): boolean {
    if (!lastDonationDate) {
      // If no previous donation, donor is eligible
      return true;
    }

    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    // Donor is eligible if last donation was more than 3 months ago
    return lastDonationDate <= threeMonthsAgo;
  }

  /**
   * Update all donors' eligibility status based on their last donation dates
   * This can be called periodically to refresh eligibility status
   */
  async updateAllDonorsEligibility() {
    const donors = await this.prisma.donor.findMany({
      where: { isActive: true },
      select: { id: true, lastDonationDate: true }
    });

    const updates = donors.map(donor => {
      const isEligible = this.calculateEligibility(donor.lastDonationDate);
      return this.prisma.donor.update({
        where: { id: donor.id },
        data: { isEligible }
      });
    });

    await Promise.all(updates);
    return { updated: donors.length };
  }
}

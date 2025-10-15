import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Injectable()
export class TeamMembersService {
  constructor(private prisma: PrismaService) {}

  async create(createTeamMemberDto: CreateTeamMemberDto) {
    return this.prisma.teamMember.create({
      data: createTeamMemberDto,
    });
  }

  async findAll() {
    return this.prisma.teamMember.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const teamMember = await this.prisma.teamMember.findUnique({
      where: { id },
    });

    if (!teamMember) {
      throw new NotFoundException('Team member not found');
    }

    return teamMember;
  }

  async update(id: string, updateTeamMemberDto: UpdateTeamMemberDto) {
    const teamMember = await this.findOne(id);

    return this.prisma.teamMember.update({
      where: { id },
      data: updateTeamMemberDto,
    });
  }

  async remove(id: string) {
    const teamMember = await this.findOne(id);

    return this.prisma.teamMember.delete({
      where: { id },
    });
  }

  async updateSortOrder(id: string, sortOrder: number) {
    const teamMember = await this.findOne(id);

    return this.prisma.teamMember.update({
      where: { id },
      data: { sortOrder },
    });
  }
}

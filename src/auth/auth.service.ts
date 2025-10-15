import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { DonorsService } from '../donors/donors.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterDonorDto } from './dto/register-donor.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private donorsService: DonorsService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.usersService.findByPhone(phone);
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.phone, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // For donors, find their donor profile to get donorId
    let donorId: string | null = null;
    if (user.role === 'DONOR') {
      try {
        const donor = await this.donorsService.findByUserPhone(user.phone);
        donorId = donor?.id || null;
      } catch (error) {
        console.log('Donor profile not found for user:', user.phone);
      }
    }

    const payload = {
      phone: user.phone,
      sub: user.id,
      role: user.role,
      donorId: donorId // Include donorId in JWT payload
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        donorId: donorId, // Include donorId in response
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    
    const user = await this.usersService.create({
      ...registerDto,
      passwordHash: hashedPassword,
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async registerDonor(registerDonorDto: RegisterDonorDto) {
    try {
      // Check if user with phone already exists
      const existingUser = await this.usersService.findByPhone(registerDonorDto.phone);
      if (existingUser) {
        throw new BadRequestException('User with this phone number already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerDonorDto.password, 12);

      // Create both user and donor in a transaction to ensure atomicity
      const { password, firstName, lastName, ...donorData } = registerDonorDto;

      const result = await this.donorsService.createDonorWithUser({
        user: {
          email: registerDonorDto.email,
          phone: registerDonorDto.phone,
          passwordHash: hashedPassword,
          firstName: registerDonorDto.firstName,
          lastName: registerDonorDto.lastName,
          role: 'DONOR',
        },
        donor: {
          ...donorData,
          name: `${firstName} ${lastName}`,
          dateOfBirth: new Date(registerDonorDto.dateOfBirth),
        },
      });

      // Generate JWT token
      const payload = {
        phone: result.user.phone,
        sub: result.user.id,
        role: result.user.role,
        donorId: result.donor.id, // Include donorId in JWT payload
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: result.user.id,
          email: result.user.email,
          phone: result.user.phone,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          donorId: result.donor.id, // Include donorId in response
        },
        donor: result.donor,
        message: 'Donor registered successfully',
      };
    } catch (error) {
      console.log('Registration error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to register donor');
    }
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...result } = user;
    return result;
  }
}

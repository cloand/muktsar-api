import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterDonorDto } from './dto/register-donor.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login (Public endpoint)' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    console.log('Login DTO:', loginDto);
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Donor registration (Public endpoint)' })
  @ApiResponse({ status: 201, description: 'Donor registered successfully' })
  @ApiResponse({ status: 400, description: 'Registration failed' })
  async register(@Body() registerDonorDto: RegisterDonorDto) {
    console.log('=== REGISTER ENDPOINT HIT ===');
    console.log('Register Donor DTO:', JSON.stringify(registerDonorDto, null, 2));
    console.log('DTO Keys:', Object.keys(registerDonorDto));
    try {
      const result = await this.authService.registerDonor(registerDonorDto);
      console.log('Registration successful');
      return result;
    } catch (error) {
      console.error('Registration error:', error.message);
      throw error;
    }
  }

  @Post('register-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin registration (Admin only)' })
  @ApiResponse({ status: 201, description: 'Admin registered successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async registerAdmin(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile (All authenticated users)' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User logout (All authenticated users)' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@Request() req: any) {
    // In a real implementation, you might want to blacklist the token
    return { message: 'Logout successful' };
  }
}

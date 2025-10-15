import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  Res,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { YoutubeService } from './youtube.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { UploadVideoDto } from './dto/upload-video.dto';
import { MediaQueryDto } from './dto/media-query.dto';
import { PrismaService } from '../prisma/prisma.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Uncomment when auth is ready

@ApiTags('media')
@Controller('media')
// @UseGuards(JwtAuthGuard) // Uncomment when auth is ready
// @ApiBearerAuth() // Uncomment when auth is ready
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(
    private readonly mediaService: MediaService,
    private readonly youtubeService: YoutubeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('upload/image')
  @ApiOperation({ summary: 'Upload image to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadImageDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // For now, use the admin user ID from seeded data. Replace with req.user.id when auth is ready
    // The admin user phone is '+919876543210' from the seed file
    const userId = req.user?.id || await this.getDefaultUserId();

    return this.mediaService.uploadImage(file, uploadDto, userId);
  }

  @Post('upload/video')
  @ApiOperation({ summary: 'Upload video to YouTube' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Video uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadVideoDto,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // For now, use the admin user ID from seeded data. Replace with req.user.id when auth is ready
    const userId = req.user?.id || await this.getDefaultUserId();

    return this.mediaService.uploadVideo(file, uploadDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all media files with filtering' })
  @ApiResponse({ status: 200, description: 'Media files retrieved successfully' })
  async findAll(@Query() queryDto: MediaQueryDto) {
    const result = await this.mediaService.findAll(queryDto);

    // Debug logging for image URLs
    if (result.data && result.data.length > 0) {
      const imageFiles = result.data.filter(item => item.fileType === 'IMAGE');
      if (imageFiles.length > 0) {
        this.logger.log(`Returning ${imageFiles.length} image files:`);
        imageFiles.forEach(img => {
          this.logger.log(`- ${img.title || img.filename}: ${img.fileUrl}`);
        });
      }
    }

    return result;
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured media files' })
  @ApiResponse({ status: 200, description: 'Featured media files retrieved successfully' })
  async getFeatured(
    @Query('category') category?: string,
    @Query('limit') limit?: number,
  ) {
    return this.mediaService.getFeatured(category, limit);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get media files by category' })
  @ApiResponse({ status: 200, description: 'Media files by category retrieved successfully' })
  async getByCategory(
    @Param('category') category: string,
    @Query('limit') limit?: number,
  ) {
    return this.mediaService.getByCategory(category, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get media statistics' })
  @ApiResponse({ status: 200, description: 'Media statistics retrieved successfully' })
  async getStats() {
    return this.mediaService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media file by ID' })
  @ApiResponse({ status: 200, description: 'Media file retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update media file' })
  @ApiResponse({ status: 200, description: 'Media file updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: Partial<UploadImageDto & UploadVideoDto>,
  ) {
    return this.mediaService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media file' })
  @ApiResponse({ status: 200, description: 'Media file deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }

  // YouTube OAuth endpoints
  @Get('youtube/auth-url')
  @ApiOperation({ summary: 'Get YouTube OAuth URL' })
  @ApiResponse({ status: 200, description: 'YouTube OAuth URL retrieved successfully' })
  async getYouTubeAuthUrl() {
    const authUrl = this.youtubeService.getAuthUrl();
    return { authUrl };
  }

  @Get('youtube/auth-status')
  @ApiOperation({ summary: 'Check YouTube authorization status' })
  @ApiResponse({ status: 200, description: 'Authorization status retrieved successfully' })
  async getYouTubeAuthStatus() {
    return this.youtubeService.getAuthStatus();
  }

  @Get('youtube/auth-callback')
  @ApiOperation({ summary: 'Handle YouTube OAuth callback' })
  @ApiResponse({ status: 200, description: 'OAuth callback handled successfully' })
  async handleYouTubeCallback(@Query('code') code: string, @Res() res: any) {
    try {
      if (!code) {
        const errorHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>YouTube Authorization Error</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
              .error { color: #e74c3c; }
              .icon { font-size: 48px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h2 class="error">Authorization Failed</h2>
              <p>No authorization code was provided. Please try the authorization process again.</p>
              <button onclick="window.close()">Close Window</button>
            </div>
          </body>
          </html>
        `;
        return res.status(400).send(errorHtml);
      }

      const tokens = await this.youtubeService.exchangeCodeForTokens(code);

      // Return success HTML page
      const successHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>YouTube Authorization Successful</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
            .success { color: #27ae60; }
            .icon { font-size: 48px; margin-bottom: 20px; }
            .button { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
            .button:hover { background: #2980b9; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✅</div>
            <h2 class="success">YouTube Authorization Successful!</h2>
            <p>Your YouTube account has been successfully connected to the NGO Management System.</p>
            <p>You can now upload videos to YouTube through the admin panel.</p>
            <button class="button" onclick="window.close()">Close Window</button>
          </div>
          <script>
            // Auto-close after 5 seconds
            setTimeout(() => {
              window.close();
            }, 5000);
          </script>
        </body>
        </html>
      `;

      return res.status(200).send(successHtml);
    } catch (error) {
      console.error('YouTube OAuth callback error:', error);

      const errorHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>YouTube Authorization Error</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
            .error { color: #e74c3c; }
            .icon { font-size: 48px; margin-bottom: 20px; }
            .button { background: #e74c3c; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <h2 class="error">Authorization Failed</h2>
            <p>Failed to exchange authorization code for tokens.</p>
            <p><strong>Error:</strong> ${error.message || 'Unknown error occurred'}</p>
            <button class="button" onclick="window.close()">Close Window</button>
          </div>
        </body>
        </html>
      `;

      return res.status(500).send(errorHtml);
    }
  }

  @Post('youtube/exchange-code')
  @ApiOperation({ summary: 'Exchange OAuth code for tokens' })
  @ApiResponse({ status: 200, description: 'OAuth tokens exchanged successfully' })
  async exchangeYouTubeCode(@Body('code') code: string) {
    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    const tokens = await this.youtubeService.exchangeCodeForTokens(code);
    return {
      success: true,
      message: 'YouTube authorization successful',
      tokens
    };
  }

  @Get('youtube/video/:videoId')
  @ApiOperation({ summary: 'Get YouTube video details' })
  @ApiResponse({ status: 200, description: 'Video details retrieved successfully' })
  async getVideoDetails(@Param('videoId') videoId: string) {
    return this.youtubeService.getVideoDetails(videoId);
  }

  private async getDefaultUserId(): Promise<string> {
    // Get the admin user created by the seed script
    const adminUser = await this.prisma.user.findUnique({
      where: { phone: '+919876543210' }
    });

    if (!adminUser) {
      throw new Error('Default admin user not found. Please run the database seed script.');
    }

    return adminUser.id;
  }

  // Entity-specific media endpoints
  @Get('blood-camp/:id')
  @ApiOperation({ summary: 'Get media files for a specific blood camp' })
  @ApiResponse({ status: 200, description: 'Blood camp media files retrieved successfully' })
  async getBloodCampMedia(@Param('id') bloodCampId: string) {
    return this.mediaService.getBloodCampMedia(bloodCampId);
  }

  @Get('medical-camp/:id')
  @ApiOperation({ summary: 'Get media files for a specific medical camp' })
  @ApiResponse({ status: 200, description: 'Medical camp media files retrieved successfully' })
  async getMedicalCampMedia(@Param('id') medicalCampId: string) {
    return this.mediaService.getMedicalCampMedia(medicalCampId);
  }

  @Get('team-member/:id')
  @ApiOperation({ summary: 'Get media files for a specific team member' })
  @ApiResponse({ status: 200, description: 'Team member media files retrieved successfully' })
  async getTeamMemberMedia(@Param('id') teamMemberId: string) {
    return this.mediaService.getTeamMemberMedia(teamMemberId);
  }

  @Get('event/:id')
  @ApiOperation({ summary: 'Get media files for a specific event' })
  @ApiResponse({ status: 200, description: 'Event media files retrieved successfully' })
  async getEventMedia(@Param('id') eventId: string) {
    return this.mediaService.getEventMedia(eventId);
  }
}

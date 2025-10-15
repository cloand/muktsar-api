import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);
  private oauth2Client: OAuth2Client;
  private youtube: any;
  private storedTokens: any = null; // Store tokens in memory (you might want to use database/redis in production)

  constructor(private configService: ConfigService) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get('YOUTUBE_CLIENT_ID'),
      this.configService.get('YOUTUBE_CLIENT_SECRET'),
      this.configService.get('YOUTUBE_REDIRECT_URI'),
    );

    this.youtube = google.youtube({
      version: 'v3',
      auth: this.oauth2Client,
    });

    // Load stored tokens if available
    this.loadStoredTokens();
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  private loadStoredTokens() {
    // In production, you might want to load from database or Redis
    // For now, we'll check if tokens are already set
    if (this.storedTokens) {
      this.oauth2Client.setCredentials(this.storedTokens);
      this.logger.log('Loaded stored YouTube tokens');
    }
  }

  private storeTokens(tokens: any) {
    this.storedTokens = tokens;
    this.oauth2Client.setCredentials(tokens);
    this.logger.log('Stored YouTube tokens');
    // In production, you might want to save to database or Redis
  }

  async exchangeCodeForTokens(code: string) {
    try {
      // Use the getToken method instead of getAccessToken
      const { tokens } = await this.oauth2Client.getToken(code);

      // Store tokens for future use
      this.storeTokens(tokens);

      this.logger.log('YouTube OAuth tokens obtained and stored successfully');
      return tokens;
    } catch (error) {
      this.logger.error('Failed to exchange code for tokens', error);
      throw new Error(`OAuth exchange failed: ${error.message}`);
    }
  }

  isAuthorized(): boolean {
    return !!(this.storedTokens && this.storedTokens.access_token);
  }

  getAuthStatus() {
    return {
      isAuthorized: this.isAuthorized(),
      hasAccessToken: !!(this.storedTokens?.access_token),
      hasRefreshToken: !!(this.storedTokens?.refresh_token),
      tokenExpiry: this.storedTokens?.expiry_date || null,
    };
  }

  async setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  async uploadVideo(
    file: Express.Multer.File,
    metadata: {
      title: string;
      description?: string;
      tags?: string[];
      category?: string;
      privacyStatus?: 'public' | 'unlisted' | 'private';
    },
  ) {
    let tempFilePath: string | null = null;

    try {
      this.logger.log(`Starting YouTube upload for file: ${file.originalname}`);
      this.logger.log(`File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      this.logger.log(`File mimetype: ${file.mimetype}`);

      if (!this.storedTokens) {
        throw new Error('YouTube not authorized. Please complete OAuth flow first.');
      }

      this.oauth2Client.setCredentials(this.storedTokens);
      this.logger.log('YouTube OAuth credentials set successfully');

      const { title, description = '', tags = [], privacyStatus = 'public' } = metadata;

      const requestBody = {
        snippet: {
          title,
          description,
          tags,
          categoryId: '25', // News & Politics category, you can change this
        },
        status: {
          privacyStatus,
        },
      };

      // Create temporary file for YouTube API (more reliable than streams)
      this.logger.log('Creating temporary file for YouTube upload...');
      const tempDir = os.tmpdir();
      tempFilePath = path.join(tempDir, `youtube_upload_${Date.now()}_${file.originalname}`);

      // Write buffer to temporary file
      fs.writeFileSync(tempFilePath, file.buffer);
      this.logger.log(`Temporary file created: ${tempFilePath}`);

      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(tempFilePath),
      };

      this.logger.log('Calling YouTube API to upload video...');
      this.logger.log(`Request body: ${JSON.stringify({
        title,
        description: description.substring(0, 100) + '...',
        tags,
        privacyStatus
      })}`);

      const response = await this.youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody,
        media,
      });

      const videoId = response.data.id;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      // Use multiple thumbnail fallbacks for better reliability
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      this.logger.log(`Video uploaded successfully: ${videoId}`);

      // Clean up temporary file
      try {
        fs.unlinkSync(tempFilePath);
        this.logger.log('Temporary file cleaned up successfully');
      } catch (cleanupError) {
        this.logger.warn(`Failed to cleanup temporary file: ${cleanupError.message}`);
      }

      return {
        videoId,
        videoUrl,
        thumbnailUrl,
        title: response.data.snippet.title,
        description: response.data.snippet.description,
        publishedAt: response.data.snippet.publishedAt,
        privacyStatus: response.data.status.privacyStatus,
      };
    } catch (error) {
      this.logger.error('Failed to upload video to YouTube', error);

      // Clean up temporary file on error
      try {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          this.logger.log('Temporary file cleaned up after error');
        }
      } catch (cleanupError) {
        this.logger.warn(`Failed to cleanup temporary file after error: ${cleanupError.message}`);
      }

      throw new Error(`YouTube upload failed: ${error.message}`);
    }
  }

  async getVideoDetails(videoId: string) {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'statistics', 'status', 'contentDetails'],
        id: [videoId],
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = response.data.items[0];
      
      return {
        videoId,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnailUrl: video.snippet.thumbnails?.maxresdefault?.url || 
                     video.snippet.thumbnails?.high?.url ||
                     video.snippet.thumbnails?.medium?.url,
        publishedAt: video.snippet.publishedAt,
        viewCount: parseInt(video.statistics?.viewCount || '0'),
        likeCount: parseInt(video.statistics?.likeCount || '0'),
        duration: video.contentDetails?.duration,
        privacyStatus: video.status?.privacyStatus,
        tags: video.snippet.tags || [],
      };
    } catch (error) {
      this.logger.error(`Failed to get video details: ${videoId}`, error);
      throw new Error(`Failed to get video details: ${error.message}`);
    }
  }

  async updateVideo(
    videoId: string,
    updates: {
      title?: string;
      description?: string;
      tags?: string[];
      privacyStatus?: 'public' | 'unlisted' | 'private';
    },
  ) {
    try {
      const requestBody: any = {
        id: videoId,
      };

      if (updates.title || updates.description || updates.tags) {
        requestBody.snippet = {};
        if (updates.title) requestBody.snippet.title = updates.title;
        if (updates.description) requestBody.snippet.description = updates.description;
        if (updates.tags) requestBody.snippet.tags = updates.tags;
      }

      if (updates.privacyStatus) {
        requestBody.status = {
          privacyStatus: updates.privacyStatus,
        };
      }

      const response = await this.youtube.videos.update({
        part: Object.keys(requestBody).filter(key => key !== 'id'),
        requestBody,
      });

      this.logger.log(`Video updated successfully: ${videoId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update video: ${videoId}`, error);
      throw new Error(`Failed to update video: ${error.message}`);
    }
  }

  async deleteVideo(videoId: string) {
    try {
      await this.youtube.videos.delete({
        id: videoId,
      });

      this.logger.log(`Video deleted successfully: ${videoId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to delete video: ${videoId}`, error);
      throw new Error(`Failed to delete video: ${error.message}`);
    }
  }

  async searchVideos(query: string, maxResults: number = 25) {
    try {
      const response = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults,
        order: 'date',
      });

      return response.data.items.map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
      }));
    } catch (error) {
      this.logger.error('Failed to search videos', error);
      throw new Error(`Video search failed: ${error.message}`);
    }
  }

  // Helper methods
  getVideoEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  getVideoThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
    const qualityMap = {
      default: 'default',
      medium: 'mqdefault',
      high: 'hqdefault',
      maxres: 'maxresdefault',
    };
    
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
  }

  extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // Parse YouTube duration format (PT4M13S) to seconds
  parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }
}

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : ['error'],
      // Optimize for single connection
      errorFormat: 'minimal',
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Disconnected from database');
    } catch (error) {
      this.logger.error('Error disconnecting from database:', error);
    }
  }

  async enableShutdownHooks(app: any) {
    // Enable graceful shutdown
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return false;
    }
  }

  // Get connection info
  async getConnectionInfo(): Promise<any> {
    try {
      const result = await this.$queryRaw`
        SELECT
          count(*) as active_connections,
          current_database() as database_name,
          current_user as current_user
        FROM pg_stat_activity
        WHERE state = 'active'
      `;
      return result;
    } catch (error) {
      this.logger.error('Failed to get connection info:', error);
      return null;
    }
  }
}

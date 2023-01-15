import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthConfig } from './auth/auth.config';
import { CognitoStrategy } from './auth/cognito.strategy';
import { Customer } from './entity/customer.entity';
import { CustomerRepository } from './repository/customer.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env` }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('MYSQL_HOST'),
        port: configService.get<number>('MYSQL_PORT'),
        username: configService.get<string>('MYSQL_USERNAME'),
        password: configService.get<string>('MYSQL_PASSWORD'),
        database: configService.get<string>('MYSQL_DATABASE'),
        entities: [Customer],
        dateStrings: true,
        synchronize: true,
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'LoyaltyService',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_QUEUE_LOYALTY'),
            queueOptions: { durable: false },
            prefetchCount: 1,
          },
        }),
      },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'WalletService',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL')],
            queue: configService.get<string>('RABBITMQ_QUEUE_WALLET'),
            queueOptions: { durable: false },
            prefetchCount: 1,
          },
        }),
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AuthConfig, CognitoStrategy, AppService, CustomerRepository],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { envValidationSchema } from './config/env.validation';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerAddressesModule } from './modules/customer-addresses/customer-addresses.module';
import { OrdersModule } from './modules/orders/orders.module';

import { User } from './modules/users/entities/user.entity';
import { CustomerAddress } from './modules/customer-addresses/entities/customer-address.entity';
import { Order } from './modules/orders/entities/order.entity';
import { OrderItem } from './modules/orders/entities/order-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [User, CustomerAddress, Order, OrderItem],
        synchronize: true,
        logging: false,
      }),
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    CustomerAddressesModule,
    OrdersModule,
  ],
})
export class AppModule {}
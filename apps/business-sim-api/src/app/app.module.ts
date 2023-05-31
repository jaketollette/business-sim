import { ClassSerializerInterceptor, Module } from '@nestjs/common';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessModule } from '../business/business.module';
import { BusinessEntity } from '../business/entities/business.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    BusinessModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db',
      entities: [BusinessEntity],
      synchronize: true
    })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor }
  ],
})
export class AppModule { }

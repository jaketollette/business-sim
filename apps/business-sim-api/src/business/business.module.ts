import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BusinessController } from "./controllers/business.controller";
import { BusinessEntity } from "./entities/business.entity";
import { BusinessService } from "./service/business.service";

@Module({
  imports: [TypeOrmModule.forFeature([BusinessEntity])],
  providers: [BusinessService],
  controllers: [BusinessController]
})
export class BusinessModule { }

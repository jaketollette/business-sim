import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { DeleteResult, UpdateResult } from "typeorm";
import { BusinessDto } from "../dtos/business.dto";
import { BusinessService } from "../service/business.service";

@Controller('/business')
export class BusinessController {
  constructor(
    private readonly service: BusinessService
  ) { }

  @Get()
  async GetAll(): Promise<BusinessDto[]> {
    const results = await this.service.getAll();
    return results.map(r => this.service.mapEntity(r))
  }

  @Get(':id')
  async GetOne(@Param('id') id: string): Promise<BusinessDto> {
    const result = await this.service.getOne(id);
    return this.service.mapEntity(result);
  }

  @Post()
  async Create(@Body() request: BusinessDto): Promise<BusinessDto> {
    if (!request) {
      throw new BadRequestException('Request body cannot be null');
    }

    const result = await this.service.create(request);
    return this.service.mapEntity(result);
  }

  @Put()
  async Update(@Body() request: BusinessDto): Promise<UpdateResult> {
    return this.service.update(request);
  }

  @Delete(':id')
  async Delete(@Param('id') id: string): Promise<DeleteResult> {
    return this.service.delete(id);
  }
}

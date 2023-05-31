import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from 'class-transformer';
import { DataSource, DeleteResult, Repository, UpdateResult } from "typeorm";
import { BusinessDto } from "../dtos/business.dto";
import { BusinessEntity } from "../entities/business.entity";

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(BusinessEntity) private repo: Repository<BusinessEntity>,
    @InjectDataSource() private readonly dataSource: DataSource
  ) { }

  async getAll(): Promise<BusinessEntity[]> {
    return await this.repo.find({ order: { price: { direction: 'ASC' } } });
  }

  async getOne(id: string): Promise<BusinessEntity> {
    return await this.repo.findOneBy({ id });
  }

  async create(createDto: BusinessDto): Promise<BusinessEntity> {
    let business: BusinessEntity;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      business = await this.repo.create(this.mapDto(createDto));

      await this.repo.save(business);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error?.code);
    } finally {
      await queryRunner.release();
    }

    return plainToInstance(BusinessEntity, business);
  }

  async update(businessDto: BusinessDto): Promise<UpdateResult> {
    return await this.repo.update({ id: businessDto.id }, this.mapDto(businessDto))
  }

  async delete(id: string): Promise<DeleteResult> {
    return await this.repo.delete({ id });
  }

  public mapDto(itemDto: BusinessDto): Partial<BusinessEntity> {
    return {
      ...itemDto,
      ffe: itemDto.ffe.value,
      ffeIncluded: itemDto.ffe.included,
      inventory: itemDto.inventory.value,
      inventoryIncluded: itemDto.inventory.included
    }
  }

  public mapEntity(itemEntity: BusinessEntity): BusinessDto {
    return {
      ...itemEntity,
      ffe: {
        included: itemEntity.ffeIncluded,
        value: itemEntity.ffe
      },
      inventory: {
        included: itemEntity.inventoryIncluded,
        value: itemEntity.inventory
      }
    }
  }
}

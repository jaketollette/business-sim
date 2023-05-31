import { CreateDateColumn, Generated, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  @Generated('uuid')
  public id: string;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

import { Column, Entity } from "typeorm";
import { AbstractEntity } from "../../shared/entities/abstract.entity";

@Entity({ name: 'businesses' })
export class BusinessEntity extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ type: 'int', default: 0, nullable: true })
  employees?: number;

  @Column({ type: 'int', default: 0, nullable: true })
  established?: number;

  @Column({ type: 'double', default: 0 })
  price: number;

  @Column({ type: 'double', default: 0, nullable: true })
  cashFlow?: number;

  @Column({ type: 'double', default: 0, nullable: true })
  revenue?: number;

  @Column({ type: 'double', default: 0, nullable: true })
  rent?: number;

  @Column({ type: 'double', default: 0, nullable: true })
  ebitda?: number;

  @Column({ type: 'double', default: 0, nullable: true })
  ffe?: number;

  @Column({ type: 'double', default: 0, nullable: true })
  inventory?: number;

  @Column({ type: 'tinyint', default: false })
  ffeIncluded: boolean;

  @Column({ type: 'tinyint', default: false })
  inventoryIncluded: boolean;

  @Column({ type: 'tinyint', default: false })
  absentee: boolean;
}

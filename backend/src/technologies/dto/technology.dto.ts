import { ApiProperty } from '@nestjs/swagger';

export class TechnologyLevelDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  technologyId!: string;

  @ApiProperty({ example: 'junior', enum: ['junior', 'middle', 'senior'] })
  difficulty!: string;

  @ApiProperty()
  createdAt!: Date;
}

export class TechnologyDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: [TechnologyLevelDto] })
  levels!: TechnologyLevelDto[];
}

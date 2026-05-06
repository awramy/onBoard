import { ApiProperty } from '@nestjs/swagger';

export class SessionTechnologyDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true, type: String })
  description!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export class SessionTechnologyLevelDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  technologyId!: string;

  @ApiProperty({ example: 'junior', enum: ['junior', 'middle', 'senior'] })
  difficulty!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: SessionTechnologyDto })
  technology!: SessionTechnologyDto;
}

export class SessionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  technologyLevelId!: string;

  @ApiProperty({
    example: 'planned',
    enum: ['planned', 'in_progress', 'completed', 'abandoned'],
  })
  status!: string;

  @ApiProperty({ nullable: true, type: Number })
  totalQuestions!: number | null;

  @ApiProperty()
  currentOrder!: number;

  @ApiProperty({ nullable: true, type: String })
  startedAt!: Date | null;

  @ApiProperty({ nullable: true, type: String })
  finishedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: SessionTechnologyLevelDto })
  technologyLevel!: SessionTechnologyLevelDto;
}

export class SessionsListDto {
  @ApiProperty({ type: [SessionDto] })
  items!: SessionDto[];

  @ApiProperty()
  total!: number;
}

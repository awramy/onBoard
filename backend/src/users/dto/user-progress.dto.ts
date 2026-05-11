import { ApiProperty } from '@nestjs/swagger';

export class UserProgressTopicDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true, type: String })
  name!: string | null;

  @ApiProperty()
  score!: number;
}

export class UserProgressLevelDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'junior', enum: ['junior', 'middle', 'senior'] })
  difficulty!: string;

  @ApiProperty({ description: 'Средний % изученности уровня (0–100)' })
  score!: number;

  @ApiProperty({ type: [UserProgressTopicDto] })
  topics!: UserProgressTopicDto[];
}

export class UserProgressTechnologyDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ description: 'Средний % изученности технологии (0–100)' })
  score!: number;

  @ApiProperty({ type: [UserProgressLevelDto] })
  levels!: UserProgressLevelDto[];
}

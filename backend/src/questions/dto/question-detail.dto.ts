import { ApiProperty } from '@nestjs/swagger';

export class QuestionDetailDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ nullable: true, type: String })
  text!: string | null;

  @ApiProperty({ example: 'theory' })
  type!: string;

  @ApiProperty({ example: 1 })
  difficulty!: number;

  @ApiProperty({ nullable: true, type: String })
  explanation!: string | null;

  @ApiProperty({ nullable: true, type: Boolean })
  isDivide!: boolean | null;

  @ApiProperty()
  topicId!: string;

  @ApiProperty({ nullable: true, type: String })
  topicName!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

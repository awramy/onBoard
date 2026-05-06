import { ApiProperty } from '@nestjs/swagger';

export class UserLeaderboardItemDto {
  @ApiProperty({ example: 'clxxx...' })
  id!: string;

  @ApiProperty({ example: 'johndoe' })
  username!: string;

  @ApiProperty({ example: 0 })
  fullScore!: number;

  @ApiProperty({
    example: 'bronze',
    enum: ['bronze', 'silver', 'gold', 'platinum'],
  })
  league!: string;
}

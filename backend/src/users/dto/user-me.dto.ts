import { ApiProperty } from '@nestjs/swagger';

export class UserMeDto {
  @ApiProperty({ example: 'clxxx...' })
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'johndoe' })
  username!: string;

  @ApiProperty({ example: 0 })
  fullScore!: number;

  @ApiProperty({
    example: 'bronze',
    enum: ['bronze', 'silver', 'gold', 'platinum'],
  })
  league!: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;
}

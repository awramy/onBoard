import { ApiProperty } from '@nestjs/swagger';
import { UserPublicDto } from './user-public.dto';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;

  @ApiProperty({ type: UserPublicDto })
  user!: UserPublicDto;
}

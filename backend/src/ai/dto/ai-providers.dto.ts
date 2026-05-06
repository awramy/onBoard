import { ApiProperty } from '@nestjs/swagger';

export class AiProviderDto {
  @ApiProperty({ example: 'gemini' })
  name!: string;

  @ApiProperty({ example: 'gemini-2.0-flash' })
  modelId!: string;

  @ApiProperty({ type: [String], example: ['gemini', 'gemini-2.0-flash'] })
  aliases!: string[];

  @ApiProperty({ example: false })
  isDefault!: boolean;
}

export class AiProvidersDto {
  @ApiProperty({ example: true })
  hasProviders!: boolean;

  @ApiProperty({ type: [AiProviderDto] })
  providers!: AiProviderDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { LoyaltyActualDto } from '../loyalty-actual.dto';
import { BaseResponseDto } from './base.response.dto';

export class LoyaltyActualResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: LoyaltyActualDto) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({
    example: 'This is sample get data successfully',
  })
  message: string;

  @ApiProperty({ type: LoyaltyActualDto })
  data: LoyaltyActualDto;
}

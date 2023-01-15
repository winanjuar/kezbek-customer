import { ApiProperty } from '@nestjs/swagger';
import { WalletBalanceDto } from '../wallet-balance.dto';
import { BaseResponseDto } from './base.response.dto';

export class WalletBalanceResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: WalletBalanceDto) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({
    example: 'This is sample get data successfully',
  })
  message: string;

  @ApiProperty({ type: WalletBalanceDto })
  data: WalletBalanceDto;
}

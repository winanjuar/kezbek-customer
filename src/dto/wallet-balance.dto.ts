import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsUUID } from 'class-validator';

export class WalletBalanceDto {
  @ApiProperty()
  @IsUUID()
  customer_id: string;

  @ApiProperty()
  @IsNumber()
  current_balance: number;
}

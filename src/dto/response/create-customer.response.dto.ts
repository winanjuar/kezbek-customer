import { ApiProperty } from '@nestjs/swagger';
import { CustomerDto } from '../core/customer.dto';
import { BaseResponseDto } from './base.response.dto';

export class CreateCustomerResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: CustomerDto) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({ example: 'Create new partner successfully' })
  message: string;

  @ApiProperty({ type: CustomerDto })
  data: CustomerDto;
}

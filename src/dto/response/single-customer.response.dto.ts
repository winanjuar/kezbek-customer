import { ApiProperty } from '@nestjs/swagger';
import { CustomerDto } from '../customer.dto';
import { BaseResponseDto } from './base.response.dto';

export class SingleCustomerResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: CustomerDto) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({
    example:
      'Get data customer with ID 67746a2b-d693-47e1-99f5-f44572aee307 successfully',
  })
  message: string;

  @ApiProperty({ type: CustomerDto })
  data: CustomerDto;
}

import { PickType } from '@nestjs/swagger';
import { CustomerDto } from '../customer.dto';

export class IdCustomerRequestDto extends PickType(CustomerDto, ['id']) {}

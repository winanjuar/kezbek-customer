import { PickType } from '@nestjs/swagger';
import { CustomerDto } from '../core/customer.dto';

export class IdCustomerRequestDto extends PickType(CustomerDto, ['id']) {}

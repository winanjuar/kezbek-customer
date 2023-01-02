import { OmitType } from '@nestjs/swagger';
import { CustomerDto } from '../core/customer.dto';

export class CreateCustomerRequestDto extends OmitType(CustomerDto, ['id']) {}

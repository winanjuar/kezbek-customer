import { PickType } from '@nestjs/swagger';
import { CustomerDto } from '../customer.dto';

export class CognitoIdRequestDto extends PickType(CustomerDto, [
  'cognito_id',
]) {}

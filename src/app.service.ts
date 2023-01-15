import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Customer } from './entity/customer.entity';
import { CustomerRepository } from './repository/customer.repository';
import { CreateCustomerRequestDto } from './dto/request/create-customer.request.dto';
import { ClientProxy } from '@nestjs/microservices';
import { IResponseBalanceActual } from './core/response-info-balace-actual.interface';
import { firstValueFrom } from 'rxjs';
import { EPatternMessage } from './core/pattern-message.enum';
import { IRequestIdCustomer } from './core/request-id-customer.interface';
import { CognitoIdRequestDto } from './dto/request/cognito-id.request.dto';
import { IResponseInfoLoyalty } from './core/response-info-loyalty.interface';

@Injectable()
export class AppService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    @Inject('WalletService') private readonly walletClient: ClientProxy,
    @Inject('LoyaltyService') private readonly loyaltyClient: ClientProxy,
  ) {}

  async createCustomer(
    customerDto: CreateCustomerRequestDto,
  ): Promise<Customer> {
    return await this.customerRepository.createNewCustomer(customerDto);
  }

  async findCustomerById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOneByCustomerId(id);
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} doesn't exist`);
    }
    return customer;
  }

  async findCustomerByCognitoId(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOneByCognitoId(id);
    if (!customer) {
      throw new NotFoundException(
        `Customer with cognito id ${id} doesn't exist`,
      );
    }
    return customer;
  }

  async findCustomerByEmail(email: string): Promise<Customer> {
    const customer = await this.customerRepository.findOneByEmail(email);
    if (!customer) {
      throw new NotFoundException(`Customer with email ${email} doesn't exist`);
    }
    return customer;
  }

  async infoBalanceWallet(
    user: CognitoIdRequestDto,
  ): Promise<IResponseBalanceActual> {
    try {
      const customer = await this.findCustomerByCognitoId(user.cognito_id);
      const customer_id = customer.id;
      const dataReqCustomer: IRequestIdCustomer = { customer_id };
      const balance = await firstValueFrom(
        this.walletClient.send(
          EPatternMessage.INFO_BALANCE_WALLET,
          dataReqCustomer,
        ),
      );
      return balance as IResponseBalanceActual;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async infoLoyalty(user: CognitoIdRequestDto): Promise<IResponseInfoLoyalty> {
    try {
      const customer = await this.findCustomerByCognitoId(user.cognito_id);
      const customer_id = customer.id;
      const dataReqCustomer: IRequestIdCustomer = { customer_id };
      const loyalty = await firstValueFrom(
        this.loyaltyClient.send(EPatternMessage.INFO_LOYALTY, dataReqCustomer),
      );
      return loyalty as IResponseInfoLoyalty;
    } catch (error) {
      throw new InternalServerErrorException(error.response.message);
    }
  }
}

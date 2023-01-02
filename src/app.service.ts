import { Injectable, NotFoundException } from '@nestjs/common';
import { Customer } from './entity/customer.entity';
import { CustomerRepository } from './repository/customer.repository';
import { CreateCustomerRequestDto } from './dto/request/create-customer.request.dto';

@Injectable()
export class AppService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async createCustomer(
    customerDto: CreateCustomerRequestDto,
  ): Promise<Customer> {
    return await this.customerRepository.createNewCustomer(customerDto);
  }

  async findCustomerById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOneByIdCustomer(id);
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} doesn't exist`);
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
}

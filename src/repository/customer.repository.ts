import { Injectable } from '@nestjs/common';
import { CreateCustomerRequestDto } from 'src/dto/request/create-customer.request.dto';
import { DataSource, Repository } from 'typeorm';
import { Customer } from '../entity/customer.entity';

@Injectable()
export class CustomerRepository extends Repository<Customer> {
  constructor(private readonly dataSource: DataSource) {
    super(Customer, dataSource.createEntityManager());
  }

  async createNewCustomer(
    customer: CreateCustomerRequestDto,
  ): Promise<Customer> {
    return await this.save(customer);
  }

  async findOneByIdCustomer(id: string): Promise<Customer> {
    return await this.findOne({ where: { id } });
  }

  async findOneByEmail(email: string): Promise<Customer> {
    return await this.findOne({ where: { email } });
  }
}

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { pick } from 'lodash';
import { faker } from '@faker-js/faker';

import { AppService } from './app.service';
import { CreateCustomerRequestDto } from './dto/request/create-customer.request.dto';
import { IdCustomerRequestDto } from './dto/request/id-customer.request.dto';
import { Customer } from './entity/customer.entity';
import { CustomerRepository } from './repository/customer.repository';

describe('AppService', () => {
  let appService: AppService;
  let mockCustomer: Customer;

  const mockCustomerRepo = {
    createNewCustomer: jest.fn(),
    findOneByCustomerId: jest.fn(),
    findOneByCognitoId: jest.fn(),
    findOneByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: CustomerRepository, useValue: mockCustomerRepo },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
    mockCustomer = {
      id: faker.datatype.uuid(),
      cognito_id: faker.datatype.uuid(),
      name: faker.name.fullName(),
      username: faker.internet.userName(faker.name.firstName()),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      created_at: '2023-01-01T05:26:21.766Z',
      updated_at: '2023-01-01T05:26:21.766Z',
      deleted_at: null,
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe('createNewCustomer', () => {
    it('should return new customer just created', async () => {
      // arrange
      const customerDto: CreateCustomerRequestDto = pick(mockCustomer, [
        'cognito_id',
        'name',
        'username',
        'email',
        'phone',
      ]);
      const spyCreateNewCustomer = jest
        .spyOn(mockCustomerRepo, 'createNewCustomer')
        .mockResolvedValue(mockCustomer);

      // act
      const customer = await appService.createCustomer(customerDto);

      // assert
      expect(customer).toEqual(mockCustomer);
      expect(customer.id).toBeDefined();
      expect(spyCreateNewCustomer).toHaveBeenCalledTimes(1);
      expect(spyCreateNewCustomer).toHaveBeenCalledWith(customerDto);
    });
  });

  describe('findCustomerById', () => {
    it('should return a customer', async () => {
      // arrange
      const customerDto = plainToInstance(IdCustomerRequestDto, {
        id: mockCustomer.id,
      });
      const id = customerDto.id;
      const spyFindOneByIdCustomer = jest
        .spyOn(mockCustomerRepo, 'findOneByCustomerId')
        .mockResolvedValue(mockCustomer);

      // act
      const customer = await appService.findCustomerById(id);

      // assert
      expect(customer).toEqual(mockCustomer);
      expect(spyFindOneByIdCustomer).toHaveBeenCalledTimes(1);
      expect(spyFindOneByIdCustomer).toHaveBeenCalledWith(id);
    });

    it('should throw not found exception', async () => {
      // arrange
      const id = '67746a2b-d693-47e1-99f5-f44572aee309';
      const spyFindOneByIdCustomer = jest
        .spyOn(mockCustomerRepo, 'findOneByCustomerId')
        .mockReturnValue(null);

      // act
      const funFindCustomerById = appService.findCustomerById(id);

      // assert
      await expect(funFindCustomerById).rejects.toEqual(
        new NotFoundException(`Customer with id ${id} doesn't exist`),
      );
      expect(spyFindOneByIdCustomer).toHaveBeenCalledTimes(1);
      expect(spyFindOneByIdCustomer).toHaveBeenCalledWith(id);
    });
  });

  describe('findCustomerByCognitoId', () => {
    it('should return a customer', async () => {
      // arrange
      const id = mockCustomer.cognito_id;
      const spyFindOneByIdCustomer = jest
        .spyOn(mockCustomerRepo, 'findOneByCognitoId')
        .mockResolvedValue(mockCustomer);

      // act
      const customer = await appService.findCustomerByCognitoId(id);

      // assert
      expect(customer).toEqual(mockCustomer);
      expect(spyFindOneByIdCustomer).toHaveBeenCalledTimes(1);
      expect(spyFindOneByIdCustomer).toHaveBeenCalledWith(id);
    });

    it('should throw not found exception', async () => {
      // arrange
      const id = faker.datatype.uuid();
      const spyFindOneByIdCustomer = jest
        .spyOn(mockCustomerRepo, 'findOneByCognitoId')
        .mockReturnValue(null);

      // act
      const funFindCustomerById = appService.findCustomerByCognitoId(id);

      // assert
      await expect(funFindCustomerById).rejects.toEqual(
        new NotFoundException(`Customer with cognito id ${id} doesn't exist`),
      );
      expect(spyFindOneByIdCustomer).toHaveBeenCalledTimes(1);
      expect(spyFindOneByIdCustomer).toHaveBeenCalledWith(id);
    });
  });

  describe('findCustomerByEmail', () => {
    it('should return a customer', async () => {
      // arrange
      const email = mockCustomer.email;
      const spyFindOneByEmail = jest
        .spyOn(mockCustomerRepo, 'findOneByEmail')
        .mockResolvedValue(mockCustomer);

      // act
      const customer = await appService.findCustomerByEmail(email);

      // assert
      expect(customer).toEqual(mockCustomer);
      expect(spyFindOneByEmail).toHaveBeenCalledTimes(1);
      expect(spyFindOneByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw not found exception', async () => {
      // arrange
      const email = 'notexistmail@gmail.com';
      const spyFindOneByEmail = jest
        .spyOn(mockCustomerRepo, 'findOneByEmail')
        .mockResolvedValue(null);

      // act
      const findCustomerByEmail = appService.findCustomerByEmail(email);

      // assert
      await expect(findCustomerByEmail).rejects.toEqual(
        new NotFoundException(`Customer with email ${email} doesn't exist`),
      );
      expect(spyFindOneByEmail).toHaveBeenCalledTimes(1);
      expect(spyFindOneByEmail).toHaveBeenCalledWith(email);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { pick } from 'lodash';
import { faker } from '@faker-js/faker';
import { CustomerRepository } from './customer.repository';
import { Customer } from 'src/entity/customer.entity';

describe('CustomerRepository', () => {
  let customerRepository: CustomerRepository;
  let mockCustomer: Customer;

  const dataSource = {
    createEntityManager: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerRepository,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    customerRepository = module.get<CustomerRepository>(CustomerRepository);
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
    it('should return new customer', async () => {
      // arrange
      const customerDto = pick(mockCustomer, [
        'cognito_id',
        'name',
        'username',
        'email',
        'phone',
      ]);

      const spySave = jest
        .spyOn(customerRepository, 'save')
        .mockResolvedValue(mockCustomer);

      // act
      const newCustomer = await customerRepository.createNewCustomer(
        customerDto,
      );

      // assert
      expect(newCustomer).toEqual(mockCustomer);
      expect(newCustomer.id).toBeDefined();
      expect(spySave).toBeCalled();
      expect(spySave).toHaveBeenCalledWith(customerDto);
    });
  });

  describe('findOneByCustomerId', () => {
    it('should return found customer', async () => {
      // arrange
      const id = mockCustomer.id;

      const spyFindOne = jest
        .spyOn(customerRepository, 'findOne')
        .mockResolvedValue(mockCustomer);

      // act
      const foundCustomer = await customerRepository.findOneByCustomerId(id);

      // assert
      expect(foundCustomer).toEqual(mockCustomer);
      expect(spyFindOne).toHaveBeenCalledTimes(1);
      expect(spyFindOne).toHaveBeenCalledWith({ where: { id } });
    });
  });

  describe('findOneByCognitoId', () => {
    it('should return found customer', async () => {
      // arrange
      const id = mockCustomer.cognito_id;

      const spyFindOne = jest
        .spyOn(customerRepository, 'findOne')
        .mockResolvedValue(mockCustomer);

      // act
      const foundCustomer = await customerRepository.findOneByCognitoId(id);

      // assert
      expect(foundCustomer).toEqual(mockCustomer);
      expect(spyFindOne).toHaveBeenCalledTimes(1);
      expect(spyFindOne).toHaveBeenCalledWith({ where: { cognito_id: id } });
    });
  });

  describe('findOneByEmail', () => {
    it('should return found customer', async () => {
      // arrange
      const email = mockCustomer.email;
      const spyFindOne = jest
        .spyOn(customerRepository, 'findOne')
        .mockResolvedValue(mockCustomer);

      // act
      const foundCustomer = await customerRepository.findOneByEmail(email);

      // assert
      expect(foundCustomer).toEqual(mockCustomer);
      expect(spyFindOne).toBeCalledTimes(1);
      expect(spyFindOne).toHaveBeenCalledWith({ where: { email } });
    });
  });
});

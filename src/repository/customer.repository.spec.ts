import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { pick } from 'lodash';
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
      id: '67746a2b-d693-47e1-99f5-f44572aee307',
      cognito_id: '04e13954-c0a2-4499-9706-96201b537c4b',
      name: 'Sugeng Winanjuar',
      username: 'winanjuar',
      email: 'winanjuar@gmail.com',
      phone: '+6285712312332',
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

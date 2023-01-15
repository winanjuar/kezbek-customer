import {
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { pick } from 'lodash';
import { faker } from '@faker-js/faker';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IRequestInfoCustomer } from './core/request-info-customer.interface';
import { CreateCustomerRequestDto } from './dto/request/create-customer.request.dto';
import { IdCustomerRequestDto } from './dto/request/id-customer.request.dto';
import { CreateCustomerResponseDto } from './dto/response/create-customer.response.dto';
import { SingleCustomerResponseDto } from './dto/response/single-customer.response.dto';
import { Customer } from './entity/customer.entity';
import { IResponseInfoCustomer } from './core/response-info-customer.interface';
import { WalletBalanceResponseDto } from './dto/response/wallet-balance.response.dto';
import { IResponseBalanceActual } from './core/response-info-balace-actual.interface';
import { LoyaltyActualResponseDto } from './dto/response/loyalty-actual.response.dto';
import { IResponseInfoLoyalty } from './core/response-info-loyalty.interface';
import { ETierName } from './core/tier-name.enum';

describe('AppController', () => {
  let controller: AppController;
  let mockCustomer: Customer;
  let mockSingleResponse: SingleCustomerResponseDto;
  let mockCreateResponse: CreateCustomerResponseDto;
  let mockWalletBalanceResponse: WalletBalanceResponseDto;
  let mockLoyaltyActualResponse: LoyaltyActualResponseDto;

  const mockAppService = {
    infoBalanceWallet: jest.fn(),
    infoLoyalty: jest.fn(),
    createCustomer: jest.fn(),
    findCustomerByCognitoId: jest.fn(),
    findCustomerByEmail: jest.fn(),
    findCustomerById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile();

    controller = module.get<AppController>(AppController);

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

  describe('getWalletBalance', () => {
    it('should response wallet balance customer', async () => {
      // arrange
      const user = { cognito_id: mockCustomer.cognito_id };
      const mockWalletBalance: IResponseBalanceActual = {
        customer_id: mockCustomer.id,
        current_balance: faker.datatype.number(),
      };

      const spyInfoBalanceWallet = jest
        .spyOn(mockAppService, 'infoBalanceWallet')
        .mockResolvedValue(mockWalletBalance);

      mockWalletBalanceResponse = new WalletBalanceResponseDto(
        HttpStatus.OK,
        `Get current balance successfully`,
        mockWalletBalance,
      );

      // act
      const response = await controller.getWalletBalance(user);

      // assert
      expect(response).toEqual(mockWalletBalanceResponse);
      expect(spyInfoBalanceWallet).toHaveBeenCalledTimes(1);
      expect(spyInfoBalanceWallet).toHaveBeenCalledWith(user);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const user = { cognito_id: mockCustomer.cognito_id };
      const spyInfoBalanceWallet = jest
        .spyOn(mockAppService, 'infoBalanceWallet')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funGetWalletBalance = controller.getWalletBalance(user);

      // assert
      await expect(funGetWalletBalance).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyInfoBalanceWallet).toHaveBeenCalledTimes(1);
      expect(spyInfoBalanceWallet).toHaveBeenCalledWith(user);
    });
  });

  describe('getInfoLoyalty', () => {
    it('should response info loyalty customer', async () => {
      // arrange
      const user = { cognito_id: mockCustomer.cognito_id };
      const mockInfoLoyalty: IResponseInfoLoyalty = {
        customer_id: mockCustomer.id,
        total_trx: faker.datatype.number(),
        tier: faker.helpers.arrayElement(Object.values(ETierName)),
        max_trx: faker.datatype.number(),
      };

      const spyInfoLoyalty = jest
        .spyOn(mockAppService, 'infoLoyalty')
        .mockResolvedValue(mockInfoLoyalty);

      mockLoyaltyActualResponse = new LoyaltyActualResponseDto(
        HttpStatus.OK,
        `Get current loyalty successfully`,
        mockInfoLoyalty,
      );

      // act
      const response = await controller.getInfoLoyalty(user);

      // assert
      expect(response).toEqual(mockLoyaltyActualResponse);
      expect(spyInfoLoyalty).toHaveBeenCalledTimes(1);
      expect(spyInfoLoyalty).toHaveBeenCalledWith(user);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const user = { cognito_id: mockCustomer.cognito_id };
      const spyInfoLoyalty = jest
        .spyOn(mockAppService, 'infoLoyalty')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funGetInfoLoyalty = controller.getInfoLoyalty(user);

      // assert
      await expect(funGetInfoLoyalty).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyInfoLoyalty).toHaveBeenCalledTimes(1);
      expect(spyInfoLoyalty).toHaveBeenCalledWith(user);
    });
  });

  describe('getMe', () => {
    it('should return authenticated user id', async () => {
      // arrange
      const user = { cognito_id: faker.datatype.uuid() };

      // act
      const response = controller.getMe(user);

      // assert
      expect(response).toEqual(user);
    });
  });

  describe('createCustomer', () => {
    it('should response single response customer', async () => {
      // arrange
      const customerDto: CreateCustomerRequestDto = pick(mockCustomer, [
        'cognito_id',
        'name',
        'username',
        'email',
        'phone',
      ]);

      const spyCreateCustomer = jest
        .spyOn(mockAppService, 'createCustomer')
        .mockResolvedValue(mockCustomer);
      mockCreateResponse = new CreateCustomerResponseDto(
        HttpStatus.CREATED,
        `Create new customer successfully`,
        mockCustomer,
      );

      // act
      const response = await controller.createCustomer(customerDto);

      // assert
      expect(response).toEqual(mockCreateResponse);
      expect(spyCreateCustomer).toHaveBeenCalledTimes(1);
      expect(spyCreateCustomer).toHaveBeenCalledWith(customerDto);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const customerDto: CreateCustomerRequestDto = pick(mockCustomer, [
        'cognito_id',
        'name',
        'username',
        'email',
        'phone',
      ]);

      const spyCreateCustomer = jest
        .spyOn(mockAppService, 'createCustomer')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const createCustomer = controller.createCustomer(customerDto);

      // assert
      await expect(createCustomer).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyCreateCustomer).toHaveBeenCalledTimes(1);
      expect(spyCreateCustomer).toHaveBeenCalledWith(customerDto);
    });
  });

  describe('getCustomerByCognitoId', () => {
    it('should response single response customer', async () => {
      // arrange
      const id = mockCustomer.cognito_id;
      const spyFindCustomerById = jest
        .spyOn(mockAppService, 'findCustomerByCognitoId')
        .mockResolvedValue(mockCustomer);
      mockSingleResponse = new SingleCustomerResponseDto(
        HttpStatus.OK,
        `Get data customer successfully`,
        mockCustomer,
      );

      // act
      const response = await controller.getCustomerByCognitoId(id);

      // assert
      expect(response).toEqual(mockSingleResponse);
      expect(spyFindCustomerById).toHaveBeenCalledTimes(1);
      expect(spyFindCustomerById).toHaveBeenCalledWith(id);
    });

    it('should throw not found', async () => {
      // arrange
      const id = mockCustomer.cognito_id;
      const spyFindCustomerById = jest
        .spyOn(mockAppService, 'findCustomerByCognitoId')
        .mockRejectedValue(new NotFoundException());

      // act
      const funGetCustomerById = controller.getCustomerByCognitoId(id);

      // assert
      await expect(funGetCustomerById).rejects.toEqual(new NotFoundException());
      expect(spyFindCustomerById).toHaveBeenCalledTimes(1);
      expect(spyFindCustomerById).toHaveBeenCalledWith(id);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const id = mockCustomer.cognito_id;
      const spyFindCustomerById = jest
        .spyOn(mockAppService, 'findCustomerByCognitoId')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funGetCustomerById = controller.getCustomerByCognitoId(id);

      // assert
      await expect(funGetCustomerById).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyFindCustomerById).toHaveBeenCalledTimes(1);
      expect(spyFindCustomerById).toHaveBeenCalledWith(id);
    });
  });

  describe('getCustomerByEmail', () => {
    it('should response single response customer', async () => {
      // arrange
      const email = mockCustomer.email;
      const spyFindCustomerByEmail = jest
        .spyOn(mockAppService, 'findCustomerByEmail')
        .mockResolvedValue(mockCustomer);
      mockSingleResponse = new SingleCustomerResponseDto(
        HttpStatus.OK,
        `Get data customer successfully`,
        mockCustomer,
      );

      // act
      const response = await controller.getCustomerByEmail(email);

      // assert
      expect(response).toEqual(mockSingleResponse);
      expect(spyFindCustomerByEmail).toHaveBeenCalledTimes(1);
      expect(spyFindCustomerByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw not found', async () => {
      // arrange
      const email = mockCustomer.email;
      const spyFindCustomerByEmail = jest
        .spyOn(mockAppService, 'findCustomerByEmail')
        .mockRejectedValue(new NotFoundException());

      // act
      const getCustomerByEmail = controller.getCustomerByEmail(email);

      // assert
      await expect(getCustomerByEmail).rejects.toEqual(new NotFoundException());
      expect(spyFindCustomerByEmail).toHaveBeenCalledTimes(1);
      expect(spyFindCustomerByEmail).toHaveBeenCalledWith(email);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const email = mockCustomer.email;
      const spyFindCustomerByEmail = jest
        .spyOn(mockAppService, 'findCustomerByEmail')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const getCustomerByEmail = controller.getCustomerByEmail(email);

      // assert
      await expect(getCustomerByEmail).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyFindCustomerByEmail).toHaveBeenCalledTimes(1);
      expect(spyFindCustomerByEmail).toHaveBeenCalledWith(email);
    });
  });

  describe('getCustomerById', () => {
    it('should response single response customer', async () => {
      // arrange
      const customerDto: IdCustomerRequestDto = pick(mockCustomer, ['id']);
      const id = customerDto.id;
      const spyFindCustomerById = jest
        .spyOn(mockAppService, 'findCustomerById')
        .mockResolvedValue(mockCustomer);
      mockSingleResponse = new SingleCustomerResponseDto(
        HttpStatus.OK,
        `Get data customer successfully`,
        mockCustomer,
      );

      // act
      const response = await controller.getCustomerById(customerDto);

      // assert
      expect(response).toEqual(mockSingleResponse);
      expect(spyFindCustomerById).toHaveBeenCalledTimes(1);
      expect(spyFindCustomerById).toHaveBeenCalledWith(id);
    });

    it('should throw not found', async () => {
      // arrange
      const customerDto: IdCustomerRequestDto = pick(mockCustomer, ['id']);
      const id = customerDto.id;
      const spyFindCustomerById = jest
        .spyOn(mockAppService, 'findCustomerById')
        .mockRejectedValue(new NotFoundException());

      // act
      const getCustomerById = controller.getCustomerById(customerDto);

      // assert
      await expect(getCustomerById).rejects.toEqual(new NotFoundException());
      expect(spyFindCustomerById).toHaveBeenCalledTimes(1);
      expect(spyFindCustomerById).toHaveBeenCalledWith(id);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const customerDto: IdCustomerRequestDto = pick(mockCustomer, ['id']);
      const id = customerDto.id;
      const spyFindCustomerById = jest
        .spyOn(mockAppService, 'findCustomerById')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const getCustomerById = controller.getCustomerById(customerDto);

      // assert
      await expect(getCustomerById).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyFindCustomerById).toHaveBeenCalledTimes(1);
      expect(spyFindCustomerById).toHaveBeenCalledWith(id);
    });
  });

  describe('pipeValidation', () => {
    it('should pass all validation for correct dto', async () => {
      // arrange
      const customerDto: CreateCustomerRequestDto = pick(mockCustomer, [
        'cognito_id',
        'name',
        'username',
        'email',
        'phone',
      ]);

      // act
      const errors = await validate(customerDto);

      // assert
      expect(errors.length).toBe(0);
    });

    it('should throw error when uuid invalid format', async () => {
      // arrange
      const notValidId = { id: '67746-a2bd693-47e1-99f5-f44572aee309' };
      const customerDto = plainToInstance(IdCustomerRequestDto, notValidId);

      // act
      const errors = await validate(customerDto);

      // assert
      expect(errors.length).toBe(1);
    });

    it('should throw error when create customer dto contains many errors', async () => {
      // arrange
      const notValidCreateDto = {
        name: 'Bkk',
        pic_email: 'admin.bukalapak.com',
        pic_phone: '0811',
      };
      const customerDto = plainToInstance(
        CreateCustomerRequestDto,
        notValidCreateDto,
      );

      // act
      const errors = await validate(customerDto);

      // assert
      expect(errors.length).not.toBe(0);
    });
  });

  describe('handlerRegister', () => {
    it('should call AppService.createCustomer', async () => {
      // arrange
      const customerDto: CreateCustomerRequestDto = pick(mockCustomer, [
        'cognito_id',
        'name',
        'username',
        'email',
        'phone',
      ]);

      const spyCreateCustomer = jest
        .spyOn(mockAppService, 'createCustomer')
        .mockResolvedValue(mockCustomer);

      // act
      await controller.handlerRegister(customerDto);

      // assert
      expect(spyCreateCustomer).toHaveBeenCalledTimes(1);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const customerDto: CreateCustomerRequestDto = pick(mockCustomer, [
        'cognito_id',
        'name',
        'username',
        'email',
        'phone',
      ]);

      const spyCreateCustomer = jest
        .spyOn(mockAppService, 'createCustomer')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funHandlerRegister = controller.handlerRegister(customerDto);

      // assert
      await expect(funHandlerRegister).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyCreateCustomer).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleInfoCustomer', () => {
    it('should call AppService.findCustomerByEmail', async () => {
      const data: IRequestInfoCustomer = {
        email: faker.internet.email(),
        transaction_id: faker.datatype.uuid(),
      };
      const result: IResponseInfoCustomer = {
        transaction_id: data.transaction_id,
        customer_id: mockCustomer.id,
        name: mockCustomer.name,
        email: mockCustomer.email,
        phone: mockCustomer.phone,
      };
      // arrange

      const spyFindCustomerByEmail = jest
        .spyOn(mockAppService, 'findCustomerByEmail')
        .mockResolvedValue(mockCustomer);

      // act
      const customer = await controller.handleInfoCustomer(data);
      // assert
      expect(customer).toEqual(result);
      expect(spyFindCustomerByEmail).toHaveBeenCalledTimes(1);
      expect(spyFindCustomerByEmail).toHaveBeenCalledWith(data.email);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const data: IRequestInfoCustomer = {
        email: faker.internet.email(),
        transaction_id: faker.datatype.uuid(),
      };

      const spyCreateCustomer = jest
        .spyOn(mockAppService, 'findCustomerByEmail')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funHandleInfoCustomer = controller.handleInfoCustomer(data);

      // assert
      await expect(funHandleInfoCustomer).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyCreateCustomer).toHaveBeenCalledTimes(1);
    });
  });
});

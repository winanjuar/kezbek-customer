import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
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

describe('AppController', () => {
  let controller: AppController;
  let mockCustomer: Customer;
  let mockSingleResponse: SingleCustomerResponseDto;
  let mockCreateResponse: CreateCustomerResponseDto;

  const mockAppService = {
    createCustomer: jest.fn(),
    findCustomerById: jest.fn(),
    findCustomerByCognitoId: jest.fn(),
    findCustomerByEmail: jest.fn(),
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
        `Get data customer with ID ${id} successfully`,
        mockCustomer,
      );

      // act
      const response = await controller.getCustomerById(customerDto);

      // assert
      expect(response).toEqual(mockSingleResponse);
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

  describe('getCustomerByCognitoId', () => {
    it('should response single response customer', async () => {
      // arrange
      const id = mockCustomer.cognito_id;
      const spyFindCustomerById = jest
        .spyOn(mockAppService, 'findCustomerByCognitoId')
        .mockResolvedValue(mockCustomer);
      mockSingleResponse = new SingleCustomerResponseDto(
        HttpStatus.OK,
        `Get data customer with Cognito ID ${id} successfully`,
        mockCustomer,
      );

      // act
      const response = await controller.getCustomerByCognitoId(id);

      // assert
      expect(response).toEqual(mockSingleResponse);
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
        `Get data customer with email ${email} successfully`,
        mockCustomer,
      );

      // act
      const response = await controller.getCustomerByEmail(email);

      // assert
      expect(response).toEqual(mockSingleResponse);
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
        id: mockCustomer.id,
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

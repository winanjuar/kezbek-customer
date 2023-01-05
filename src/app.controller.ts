import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateCustomerRequestDto } from './dto/request/create-customer.request.dto';
import { IdCustomerRequestDto } from './dto/request/id-customer.request.dto';
import { BadRequestResponseDto } from './dto/response/bad-request.response.dto';
import { CreateCustomerResponseDto } from './dto/response/create-customer.response.dto';
import { InternalServerErrorDto } from './dto/response/internal-server-error.response.dto';
import { NotFoundResponseDto } from './dto/response/not-found.response.dto';
import { SingleCustomerResponseDto } from './dto/response/single-customer.response.dto';

@ApiTags('Customer')
@Controller({ version: '1' })
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @ApiBody({ type: CreateCustomerRequestDto })
  @ApiCreatedResponse({ type: CreateCustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  @Post()
  async createCustomer(@Body() customerDto: CreateCustomerRequestDto) {
    try {
      const newCustomer = await this.appService.createCustomer(customerDto);
      this.logger.log(
        `[POST, /] Register new customer ${newCustomer.id} successfully`,
      );
      return new CreateCustomerResponseDto(
        HttpStatus.CREATED,
        'Create new customer successfully',
        newCustomer,
      );
    } catch (error) {
      this.logger.log(`[POST, /] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @ApiOkResponse({ type: SingleCustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  @Get(':id')
  async getCustomerById(@Param() customerDto: IdCustomerRequestDto) {
    try {
      const customer = await this.appService.findCustomerById(customerDto.id);
      this.logger.log(
        `[GET, :id] Get data customer with ID ${customerDto.id} successfully`,
      );
      return new SingleCustomerResponseDto(
        HttpStatus.OK,
        `Get data customer with ID ${customerDto.id} successfully`,
        customer,
      );
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @ApiOkResponse({ type: SingleCustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  @ApiParam({ name: 'id', type: 'string' })
  @Get('cognito/:id')
  async getCustomerByCognitoId(@Param('id') id: string) {
    const customer = await this.appService.findCustomerByCognitoId(id);
    this.logger.log(
      `[GET, cognito/:id] Get data customer with Cognito ID ${id} successfully`,
    );
    return new SingleCustomerResponseDto(
      HttpStatus.OK,
      `Get data customer with Cognito ID ${id} successfully`,
      customer,
    );
  }

  @ApiOkResponse({ type: SingleCustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  @ApiParam({ name: 'email', type: 'string' })
  @Get('email/:email')
  async getCustomerByEmail(@Param('email') email: string) {
    const customer = await this.appService.findCustomerByEmail(email);
    this.logger.log(
      `[GET, email/:email] Get data customer with email ${email} successfully`,
    );
    return new SingleCustomerResponseDto(
      HttpStatus.OK,
      `Get data customer with email ${email} successfully`,
      customer,
    );
  }

  @EventPattern('ep_register')
  async handlerRegister(@Payload() data: any) {
    try {
      const customerDto: CreateCustomerRequestDto = {
        cognito_id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone,
      };

      const newCustomer = await this.appService.createCustomer(customerDto);
      this.logger.log(
        `[EventPattern ep_register] Register new customer ${newCustomer.id} successfully`,
      );
    } catch (error) {
      this.logger.log(`[EventPattern ep_register] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @MessagePattern('mp_info_customer')
  async handleInfoCustomer(@Payload() data: any) {
    try {
      const email = data.email;
      const transaction_id = data.transaction_id;
      const customer = await this.appService.findCustomerByEmail(data.email);
      this.logger.log(
        `[MessagePattern mp_info_customer] [${transaction_id}] Get data customer with email ${email} successfully`,
      );
      return customer;
    } catch (error) {
      this.logger.log(`[MessagePattern mp_info_customer] ${error}`);
      throw new InternalServerErrorException();
    }
  }
}

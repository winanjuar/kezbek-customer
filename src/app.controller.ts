import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
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
  constructor(private readonly appService: AppService) {}

  @ApiBody({ type: CreateCustomerRequestDto })
  @ApiCreatedResponse({ type: CreateCustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  @Post()
  async createCustomer(@Body() customerDto: CreateCustomerRequestDto) {
    try {
      const newCustomer = await this.appService.createCustomer(customerDto);
      return new CreateCustomerResponseDto(
        HttpStatus.CREATED,
        'Create new customer successfully',
        newCustomer,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
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
      return new SingleCustomerResponseDto(
        HttpStatus.OK,
        `Get data customer with ID ${customerDto.id} successfully`,
        customer,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @ApiOkResponse({ type: SingleCustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorDto })
  @Get('/email/:email')
  async getCustomerByEmail(@Param() email: string) {
    try {
      const customer = await this.appService.findCustomerByEmail(email);
      return new SingleCustomerResponseDto(
        HttpStatus.OK,
        `Get data customer with email ${email} successfully`,
        customer,
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}

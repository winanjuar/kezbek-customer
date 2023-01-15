import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import JwtGuard from './auth/jwt.guard';
import { EPatternMessage } from './core/pattern-message.enum';
import { IRequestInfoCustomer } from './core/request-info-customer.interface';
import { IResponseInfoCustomer } from './core/response-info-customer.interface';
import { GetUser } from './decorator/get-user.decorator';
import { CognitoIdRequestDto } from './dto/request/cognito-id.request.dto';
import { CreateCustomerRequestDto } from './dto/request/create-customer.request.dto';
import { IdCustomerRequestDto } from './dto/request/id-customer.request.dto';
import { BadRequestResponseDto } from './dto/response/bad-request.response.dto';
import { CreateCustomerResponseDto } from './dto/response/create-customer.response.dto';
import { InternalServerErrorResponseDto } from './dto/response/internal-server-error.response.dto';
import { LoyaltyActualResponseDto } from './dto/response/loyalty-actual.response.dto';
import { NotFoundResponseDto } from './dto/response/not-found.response.dto';
import { SingleCustomerResponseDto } from './dto/response/single-customer.response.dto';
import { WalletBalanceResponseDto } from './dto/response/wallet-balance.response.dto';

@ApiTags('Customer')
@Controller({ version: '1' })
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @ApiOkResponse({ type: WalletBalanceResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('get-wallet-ballance')
  async getWalletBalance(@GetUser() user: CognitoIdRequestDto) {
    const logIdentifier = 'GET get-wallet-balance';
    const balance = await this.appService.infoBalanceWallet(user);
    this.logger.log(
      `[${logIdentifier}] [${balance.customer_id}] Get current balance successfully`,
    );
    return new WalletBalanceResponseDto(
      HttpStatus.OK,
      'Get current balance successfully',
      balance,
    );
  }

  @ApiOkResponse({ type: LoyaltyActualResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('get-info-loyalty')
  async getInfoLoyalty(@GetUser() user: CognitoIdRequestDto) {
    const logIdentifier = 'GET get-info-loyalty';
    const loyalty = await this.appService.infoLoyalty(user);
    this.logger.log(
      `[${logIdentifier}] [${loyalty.customer_id}] Get current loyalty successfully`,
    );
    return new LoyaltyActualResponseDto(
      HttpStatus.OK,
      'Get current loyalty successfully',
      loyalty,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('try-get-me')
  getMe(@GetUser() user: CognitoIdRequestDto) {
    const logIdentifier = 'GET try-get-me';
    this.logger.log(
      `[${logIdentifier}] Decode token for user ${user.cognito_id} successfully`,
    );
    return user;
  }

  @ApiBody({ type: CreateCustomerRequestDto })
  @ApiCreatedResponse({ type: CreateCustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @Post('try-new-customer')
  async createCustomer(@Body() customerDto: CreateCustomerRequestDto) {
    const logIdentifier = 'POST try-new-customer';
    try {
      const newCustomer = await this.appService.createCustomer(customerDto);
      this.logger.log(
        `[${logIdentifier}] [${newCustomer.id}] Register new customer successfully`,
      );
      return new CreateCustomerResponseDto(
        HttpStatus.CREATED,
        'Create new customer successfully',
        newCustomer,
      );
    } catch (error) {
      this.logger.log(`[${logIdentifier}] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @ApiOkResponse({ type: SingleCustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @ApiParam({ name: 'id', type: 'string' })
  @Get('try-info-customer-by-cognito/:id')
  async getCustomerByCognitoId(@Param('id') id: string) {
    const logIdentifier = 'GET try-info-customer-by-cognito/:id';
    try {
      const customer = await this.appService.findCustomerByCognitoId(id);
      this.logger.log(
        `[${logIdentifier}] [${customer.id}] Get data customer successfully`,
      );
      return new SingleCustomerResponseDto(
        HttpStatus.OK,
        `Get data customer successfully`,
        customer,
      );
    } catch (error) {
      this.logger.log(`[${logIdentifier}] ${error}`);
      if (error.response.statusCode === 404) {
        throw new NotFoundException(error.response.message);
      } else {
        throw new InternalServerErrorException(error.response.message);
      }
    }
  }

  @ApiOkResponse({ type: SingleCustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @ApiParam({ name: 'email', type: 'string' })
  @Get('try-info-customer-by-email/:email')
  async getCustomerByEmail(@Param('email') email: string) {
    const logIdentifier = 'GET try-info-customer-by-email/:email';
    try {
      const customer = await this.appService.findCustomerByEmail(email);
      this.logger.log(
        `[${logIdentifier}] [${customer.id}] Get data customer successfully`,
      );
      return new SingleCustomerResponseDto(
        HttpStatus.OK,
        `Get data customer successfully`,
        customer,
      );
    } catch (error) {
      this.logger.log(`[${logIdentifier}] ${error}`);
      if (error.response.statusCode === 404) {
        throw new NotFoundException(error.response.message);
      } else {
        throw new InternalServerErrorException(error.response.message);
      }
    }
  }

  @ApiOkResponse({ type: SingleCustomerResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiNotFoundResponse({ type: NotFoundResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @Get('try-info-customer-by-id/:id')
  async getCustomerById(@Param() customerDto: IdCustomerRequestDto) {
    const logIdentifier = 'GET try-info-customer-by-id/:id';
    try {
      const customer = await this.appService.findCustomerById(customerDto.id);
      this.logger.log(
        `[${logIdentifier}] [${customer.id}] Get data customer successfully`,
      );
      return new SingleCustomerResponseDto(
        HttpStatus.OK,
        `Get data customer successfully`,
        customer,
      );
    } catch (error) {
      this.logger.log(`[${logIdentifier}] ${error}`);
      if (error.response.statusCode === 404) {
        throw new NotFoundException(error.response.message);
      } else {
        throw new InternalServerErrorException(error.response.message);
      }
    }
  }

  @EventPattern(EPatternMessage.REGISTER)
  async handlerRegister(@Payload() data: any) {
    try {
      const customerDto: CreateCustomerRequestDto = {
        cognito_id: data.cognito_id,
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone,
      };

      const newCustomer = await this.appService.createCustomer(customerDto);
      this.logger.log(
        `[${EPatternMessage.REGISTER}] Register ${customerDto.cognito_id} as new customer ${newCustomer.id} successfully`,
      );
    } catch (error) {
      this.logger.log(`[${EPatternMessage.REGISTER}] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @MessagePattern(EPatternMessage.INFO_CUSTOMER)
  async handleInfoCustomer(
    @Payload() data: IRequestInfoCustomer,
  ): Promise<IResponseInfoCustomer> {
    try {
      const email = data.email;
      const transaction_id = data.transaction_id;
      const customer = await this.appService.findCustomerByEmail(email);
      this.logger.log(
        `[${EPatternMessage.INFO_CUSTOMER}] [${transaction_id}] Get data customer with email ${email} successfully`,
      );

      return {
        transaction_id,
        customer_id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      } as IResponseInfoCustomer;
    } catch (error) {
      this.logger.log(`[${EPatternMessage.INFO_CUSTOMER}] ${error}`);
      throw new InternalServerErrorException();
    }
  }
}

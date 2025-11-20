// Temporarily commented out due to missing dependencies
/*
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ShippingMethodService } from '../../application/services/shipping-method.service';
import { CreateShippingMethodDto, UpdateShippingMethodDto, ShippingMethodResponseDto } from '../../application/dtos/shipping-method.dto';
import { JwtAuthGuard } from '../../presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../../presentation/guards/roles.guard';
import { Roles } from '../../presentation/decorators/roles.decorator';

@Controller('shipping-methods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShippingMethodController {
  constructor(private readonly shippingMethodService: ShippingMethodService) {}

  @Post()
  @Roles('ADMIN', 'SALES_MANAGER')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createShippingMethodDto: CreateShippingMethodDto): Promise<ShippingMethodResponseDto> {
    return await this.shippingMethodService.create(createShippingMethodDto);
  }

  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', 'USER')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('is_active') isActive?: boolean,
  ): Promise<{ shippingMethods: ShippingMethodResponseDto[]; total: number; page: number; limit: number; totalPages: number }> {
    return await this.shippingMethodService.findAll({ page, limit, search, isActive });
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'USER')
  async findOne(@Param('id') id: string): Promise<ShippingMethodResponseDto> {
    return await this.shippingMethodService.findOne(+id);
  }

  @Put(':id')
  @Roles('ADMIN', 'SALES_MANAGER')
  async update(
    @Param('id') id: string,
    @Body() updateShippingMethodDto: UpdateShippingMethodDto,
  ): Promise<ShippingMethodResponseDto> {
    return await this.shippingMethodService.update(+id, updateShippingMethodDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.shippingMethodService.remove(+id);
  }

  @Put(':id/activate')
  @Roles('ADMIN', 'SALES_MANAGER')
  async activate(@Param('id') id: string): Promise<ShippingMethodResponseDto> {
    return await this.shippingMethodService.activate(+id);
  }

  @Put(':id/deactivate')
  @Roles('ADMIN', 'SALES_MANAGER')
  async deactivate(@Param('id') id: string): Promise<ShippingMethodResponseDto> {
    return await this.shippingMethodService.deactivate(+id);
  }
}
*/

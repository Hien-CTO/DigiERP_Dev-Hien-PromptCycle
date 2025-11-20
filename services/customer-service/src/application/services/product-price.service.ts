import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class ProductPriceService {
  private readonly httpClient: AxiosInstance;
  private readonly productServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.productServiceUrl =
      this.configService.get<string>('PRODUCT_SERVICE_URL') ||
      'http://product-service:3003';
    this.httpClient = axios.create({
      baseURL: this.productServiceUrl,
      timeout: 5000,
    });
  }

  async getProductPrice(productId: number): Promise<number> {
    try {
      // Call /api/product-prices?productId=... to get list of prices for this product
      const response = await this.httpClient.get(`/product-prices`, {
        params: { productId, page: 1, limit: 10 },
      });
      
      // Response format: { prices: ProductPriceResponseDto[], total: number, page: number, limit: number, totalPages: number }
      const prices = response.data.prices || [];
      
      if (prices.length === 0) {
        throw new HttpException(
          `No price found for product ID ${productId}`,
          HttpStatus.NOT_FOUND,
        );
      }

      // Find active price first, or get the first one
      const activePrice = prices.find((p: any) => p.isActive === true) || prices[0];
      
      return activePrice.price || 0;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new HttpException(
          `Product price not found for product ID ${productId}`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        `Failed to fetch product price: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProductPrices(productIds: number[]): Promise<Map<number, number>> {
    const priceMap = new Map<number, number>();
    
    // Fetch prices in parallel
    const promises = productIds.map(async (productId) => {
      try {
        const price = await this.getProductPrice(productId);
        priceMap.set(productId, price);
      } catch (error) {
        console.error(`Failed to get price for product ${productId}:`, error);
        // Continue with other products even if one fails
      }
    });

    await Promise.all(promises);
    return priceMap;
  }
}


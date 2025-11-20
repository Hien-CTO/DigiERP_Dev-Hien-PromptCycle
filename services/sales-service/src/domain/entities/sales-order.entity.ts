import { OrderStatus } from '../enums/order-status.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export class SalesOrder {
  constructor(
    public readonly id: number,
    public readonly orderNumber: string,
    public readonly customerId: number,
    public readonly customerName: string,
    public readonly customerEmail: string,
    public readonly customerPhone: string,
    public readonly warehouseId: number,
    public readonly status: OrderStatus,
    public readonly paymentStatus: PaymentStatus,
    public readonly subtotal: number,
    public readonly taxAmount: number,
    public readonly discountAmount: number,
    public readonly shippingAmount: number,
    public readonly totalAmount: number,
    public readonly currency: string,
    public readonly notes: string,
    public readonly internalNotes: string,
    public readonly orderDate: Date,
    public readonly requiredDate: Date,
    public readonly shippedDate: Date,
    public readonly deliveredDate: Date,
    public readonly shippingAddress: string,
    public readonly billingAddress: string,
    public readonly shippingMethod: string,
    public readonly paymentMethod: string,
    public readonly trackingNumber: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly createdBy: number,
    public readonly updatedBy: number,
  ) {}
}

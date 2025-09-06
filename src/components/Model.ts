import { IBasket, IProduct, TOrder, TPayment } from "../types";
import { IEvents } from "./base/events";

export class ProductModel {
  products: IProduct[] = [];
  preview: IProduct;
  basket: IBasket = {
    products: [],
  };
  order: TOrder = {
    payment: 'card',
    email: '',
    phone: '',
    address: '',
  };
  formErrors: Partial<Record<keyof TOrder, string>> = {};

  constructor(protected events: IEvents) {}

  get total(): number {
    return this.basket.products.reduce((sum, id) => {
      const product = this.getProduct(id);
      return product ? sum + (product.price || 0) : sum;
    }, 0);
  }

  setPreview(product: IProduct) {
    this.preview = product;
    this.events.emit('preview:changed', this.preview);
  }

  setPaymentMethod(method: TPayment) {
    this.order.payment = method;
  }

  setProducts(products: IProduct[]) {
    this.products = products;
    this.events.emit('products:changed', this.products);
  }

  getProduct(id: string): IProduct | undefined {
    return this.products.find(item => item.id === id);
  }

  isProductInBasket(item: IProduct) {
    return this.basket.products.includes(item.id);
  }

  addBasket(item: IProduct) {
    this.basket.products.push(item.id);
    this.events.emit('basket:changed', this.basket);
  }

  removeBasket(item: IProduct) {
    this.basket.products = this.basket.products.filter(id => id !== item.id);
    this.events.emit('basket:changed', this.basket);
  }

  clearBasket() {
    this.basket.products = [];
    this.events.emit('basket:changed', this.basket);
  }

  setOrderField(field: keyof TOrder, value: string) {
    if (field === 'payment') {
      this.setPaymentMethod(value as TPayment);
    } else {
      this.order[field] = value;
    }

    if (this.order.payment && this.orderValidation()) {
      this.events.emit('order:ready', this.order);
    }
  }

  orderValidation() {
    const errors: typeof this.formErrors = {};
    if (!this.order.payment) {
      errors.payment = 'Необходимо выбрать способ оплаты';
    }
    if (!this.order.email) {
      errors.email = 'Необходимо указать email';
    }
    if (!this.order.phone) {
      errors.phone = 'Необходимо указать телефон';
    }
    if (!this.order.address) {
      errors.address = 'Необходимо указать адрес';
    }
    this.formErrors = errors;
    this.events.emit('formErrors:changed', this.formErrors);
    return Object.keys(errors).length === 0;
  }
}
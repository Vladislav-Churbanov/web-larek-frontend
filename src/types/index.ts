export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  categoty: string;
  price: number | null;
}

export interface IOrder {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

export interface IBasket {
  products: string[];
}

export type TOrder = Omit<IOrder, 'total' | 'items'>;

export type TPayment = 'card' | 'cash' | '';

export interface IBasketIndex {
  index: number
}

export type TCard = IProduct & IBasketIndex;

export interface IOrderResult {
  id: string,
  total: number
}
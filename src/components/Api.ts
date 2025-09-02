import { IOrder, IOrderResult, IProduct } from "../types";
import { Api, ApiListResponse } from "./base/api";

export class ProductApi extends Api {
  readonly setBaseUrl: string;

  constructor(setBaseUrl:string, baseUrl: string) {
    super(baseUrl),
    this.setBaseUrl = setBaseUrl;
  }

  orderProducts(order: IOrder): Promise<IOrderResult> {
    return this.post('/order', order).then(
      (data: IOrderResult) => data
      );
    }

  getProducts():Promise<IProduct[]> {
    return this.get('/product').then((data: ApiListResponse<IProduct>) => 
      data.items.map((item) => ({
        ...item,
        image: this.setBaseUrl + item.image
      }))
    )
  }
}
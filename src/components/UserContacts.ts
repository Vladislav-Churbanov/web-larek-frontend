import { TOrder } from "../types";
import { Form } from "./base/form";

export class UserContacts extends Form<TOrder> {
  set email(value:string) {
    (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
  }

  set phone(value:string) {
    (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
  }
}
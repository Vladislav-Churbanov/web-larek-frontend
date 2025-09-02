import { EventEmitter } from "./base/events";
import { ensureElement } from "../utils/utils";
import { Form } from "./base/form";
import { TOrder, TPayment } from "../types";

export class OrderForm extends Form<TOrder> {
    protected cardPay: HTMLButtonElement;
    protected cashPay: HTMLButtonElement;

    constructor(container: HTMLFormElement, events: EventEmitter) {
        super(container, events);

        this.cardPay = ensureElement('.button_alt[name=card]', container) as HTMLButtonElement;
        this.cashPay = ensureElement('.button_alt[name=cash]', container) as HTMLButtonElement;

        this.cardPay.addEventListener('click', () => {
            this.payment = 'card',
            this.onInputChange('payment', 'card');
        });

        this.cashPay.addEventListener('click', () => {
            this.payment = 'cash',
            this.onInputChange('payment', 'cash');
        })
    }

    set payment(value:TPayment) {
        this.cardPay.classList.toggle('button_alt-active', value === 'card');
        this.cashPay.classList.toggle('button_alt-active', value === 'cash');
    }

    set address(value:string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }
}
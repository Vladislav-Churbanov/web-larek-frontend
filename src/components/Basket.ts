import { ensureElement, createElement } from "../utils/utils";
import { Component } from "./base/component";
import { EventEmitter } from "./base/events";

interface IBasketView {
  items: HTMLElement[];
  total: number;
}

export class Basket extends Component<IBasketView> {
  protected itemListContainer: HTMLElement;
  protected priceContainer: HTMLElement;
  protected buttonContainer: HTMLElement;

  constructor(container: HTMLElement, protected events: EventEmitter){
    super(container);

    this.itemListContainer = ensureElement('.basket__list', container) as HTMLElement;
    this.priceContainer = ensureElement('.basket__price', container) as HTMLElement;
    this.buttonContainer = ensureElement('.basket__button', container) as HTMLElement;

    this.buttonContainer.addEventListener('click', () => {
      events.emit('order:open');
    })

    this.items = [];
  }

  set items(items: HTMLElement[]) {
    if (items.length) {
      this.itemListContainer.replaceChildren(...items);
      this.setDisabled(this.buttonContainer, false);
    }
    else {
      this.itemListContainer.replaceChildren(createElement('p', { 
      textContent: 'Корзина пуста'}) as HTMLParagraphElement);
      this.setDisabled(this.buttonContainer, true);
    }
  }

  set total(total: number) {
    this.setText(this.priceContainer, `${total} синапсов`);
  }
}
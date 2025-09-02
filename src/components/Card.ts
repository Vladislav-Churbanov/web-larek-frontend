import { TCard } from "../types";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/component";

interface ICardEvent {
  onclick: (event: MouseEvent) => void;
}

export class Card extends Component<TCard> {
  protected titleElement: HTMLElement;
  protected priceElement: HTMLElement;
  protected categoryElement?: HTMLElement;
  protected imageElement?: HTMLImageElement;
  protected actionButton?: HTMLButtonElement;
  protected descriptionElement?: HTMLElement;
  protected indexElement?: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardEvent) {
    super(container);

    this.priceElement = ensureElement('.card__price', container) as HTMLElement;
    this.descriptionElement = container.querySelector('.card__text') as HTMLElement;
    this.actionButton = container.querySelector('.card__button') as HTMLButtonElement;
    this.categoryElement = container.querySelector('.card__category') as HTMLElement;
    this.imageElement = container.querySelector('.card__image') as HTMLImageElement;
    this.indexElement = container.querySelector('.basket__item-index') as HTMLElement;
    this.titleElement = ensureElement('.card__title', container) as HTMLElement;

    if(actions?.onclick) {
      if (this.actionButton) {
        this.actionButton.addEventListener('click', actions.onclick);
      } else {
        container.addEventListener('click', actions.onclick);
      }
    }
  }

  set title(value:string) {
    this.setText(this.titleElement, value);
  }

  get title():string {
    return this.titleElement.textContent;
  }

  set price(value:string) {
    this.setText(this.priceElement, `${value} синапсов`);
    if(value === null) {
      this.setText(this.priceElement, 'Бесценно');
      this.setText(this.actionButton, 'Недоступно')
      this.setDisabled(this.actionButton, true);
    }
  }

  set category(value:string) {
    this.setText(this.categoryElement, value);
    this.categoryElement.classList.toggle('card__category_soft', value === 'софт-скил');
    this.categoryElement.classList.toggle('card__category_other', value === 'другое');
    this.categoryElement.classList.toggle('card__category_additional', value === 'дополнительное');
    this.categoryElement.classList.toggle('card__category_hard', value === 'хард-скил');
    this.categoryElement.classList.toggle('card__category_button', value === 'кнопка');
  }

  set image(value:string) {
    const pngValue = value.replace('.svg', '.png');
    this.setImage(this.imageElement, pngValue, this.title);
  }

  set index(value:number) {
    this.setText(this.indexElement, value + 1)
  }

  set description(value:string) {
    this.setText(this.descriptionElement, value)
  }

  set button(value:string) {
    this.setText(this.actionButton, value);
  }
}
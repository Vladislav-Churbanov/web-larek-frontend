import { ensureElement } from "../utils/utils";
import { Component } from "./base/component";
import { IEvents } from "./base/events";

interface IPage {
  catalog: HTMLElement[];
  locked: boolean;
  counter: number;
}

export class Page extends Component<IPage> {
  protected wrapperContainer: HTMLElement;
  protected galleryContainer: HTMLElement;
  protected basketCounterContainer: HTMLElement;
  protected basketContainer: HTMLButtonElement;

  constructor(container: HTMLElement, protected events: IEvents){
    super(container);

    this.wrapperContainer = ensureElement('.page__wrapper') as HTMLElement;
    this.galleryContainer = ensureElement('.gallery') as HTMLElement;
    this.basketCounterContainer = ensureElement('.header__basket-counter') as HTMLElement;
    this.basketContainer = ensureElement('.header__basket') as HTMLButtonElement;

    this.basketContainer.addEventListener('click', () => {
      this.events.emit('basket:open');
    });
  }

  set locked(value: boolean) {
    if (value) {
      this.wrapperContainer.classList.add('page__wrapper_locked');
    } else {  this.wrapperContainer.classList.remove('page__wrapper_locked') }
  }

  set counter (value: number) {
    this.setText(this.basketCounterContainer, String(value));
        
  }

  set catalog (products: HTMLElement[]) {
    this.galleryContainer.replaceChildren(...products);    
  }
} 
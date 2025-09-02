import { ensureElement } from "../utils/utils";
import { Component } from "./base/component";
import { IEvents } from "./base/events";

interface IModal {
  modalContent: HTMLElement;
}

export class Modal extends Component<IModal> {
  protected closeModalButton: HTMLButtonElement;
  protected contentModal: HTMLElement;

  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    this.closeModalButton = ensureElement('.modal__close', container) as HTMLButtonElement;
    this.contentModal = ensureElement('.modal__content', container) as HTMLElement;

    this.closeModalButton.addEventListener('click', this.close.bind(this));
    this.container.addEventListener('click', this.close.bind(this));
    this.contentModal.addEventListener('click', (event) => event.stopPropagation());
  }

  set modalContent(value: HTMLElement) {
    this.contentModal.replaceChildren(value)
  }

  open() {
    this.container.classList.add('modal_active');
    this.events.emit('modal:open')
  }

  close() {
    this.container.classList.remove('modal_active');
    this.events.emit('modal:close')
  }

  render(data: IModal): HTMLElement {
    super.render(data);
    this.open();
    return this.container;
  }
}
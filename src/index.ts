import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { ProductApi } from './components/Api';
import { Basket } from './components/Basket';
import { Card } from './components/Card';
import { Modal } from './components/Modal';
import { ProductModel } from './components/Model';
import { OrderForm } from './components/Order';
import { Page } from './components/Page';
import { Success } from './components/Success';
import { UserContacts } from './components/UserContacts';
import { IProduct, TOrder } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate } from './utils/utils';

const events = new EventEmitter();
const api = new ProductApi(CDN_URL, API_URL);

// модель данных
const productModel =  new ProductModel(events);

// темплейты
const cardCatalogTemplate = document.querySelector('#card-catalog') as HTMLTemplateElement;
const cardPrewiewTemplate = document.querySelector('#card-preview') as HTMLTemplateElement;
const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
const cardBasketTemplate = document.querySelector('#card-basket') as HTMLTemplateElement;
const orderTemplate = document.querySelector('#order') as HTMLTemplateElement;
const contactTemplate = document.querySelector('#contacts') as HTMLTemplateElement;
const successTemplate = document.querySelector('#success') as HTMLTemplateElement;

// контейнеры
const page = new Page(document.querySelector('.page__wrapper') as HTMLElement, events);
const modal = new Modal(document.querySelector('#modal-container') as HTMLElement, events);
const basket = new Basket(cloneTemplate(basketTemplate) as HTMLElement, events);
const orderForm = new OrderForm(cloneTemplate(orderTemplate) as HTMLFormElement, events);
const contactForm = new UserContacts(cloneTemplate(contactTemplate) as HTMLFormElement, events);

// получение карточек с сервера
api.getProducts()
  .then(productModel.setProducts.bind(productModel))
  .catch(err => {
    console.log(err);
  })

  // изменение элементов каталога
events.on('products:changed', (items: IProduct[]) => {
  page.catalog = items.map(item => {
    const card = new Card(cloneTemplate(cardCatalogTemplate), {
      onclick: () => events.emit('card:select', item)
    });
    return card.render(item);
  })
});

// открытие карточки
events.on('card:select', (item: IProduct) => {
  productModel.setPrewiew(item);
});

// Блокировка и разблокировка прокрутки страницы если открыто модальное окно
events.on('modal:open', () => {
    page.locked = true;
});

events.on('modal:close', () => {
    page.locked = false;
});

// изменение открытой карточки
events.on('preview:changed', (item: IProduct) => {  
  const card = new Card(cloneTemplate(cardPrewiewTemplate), {
    onclick: () => {
      if(productModel.isProductInBasket(item)) {
        productModel.removeBasket(item);
        card.button = 'В корзину';
      } else {
          productModel.addBasket(item);
          card.button = 'Удалить из корзины';
      }
    }
  });
  card.button = productModel.isProductInBasket(item) ? 'Удалить из корзины' : 'В корзину';
  modal.render({
    modalContent:card.render(item)
  })
});

// открытие корзины
events.on('basket:open', () => {
  modal.render({
    modalContent:basket.render()
  })
});

// изменения в корзине
events.on('basket:changed', () => {
  page.counter = productModel.basket.products.length;  
  basket.items = productModel.basket.products.map((id, index) => {
    const item = productModel.getProduct(id);
    const card = new Card(cloneTemplate(cardBasketTemplate), {
      onclick: () => productModel.removeBasket(item)
    });    
    return card.render({
      title: item.title, 
      price: item.price,
      index: index,
    });
  }),
  basket.total = productModel.basket.total;  
});

// открытие формы с адресом  и способом оплаты
events.on('order:open', () => {
  modal.render({
    modalContent:orderForm.render({
      payment: 'card',
      address: '',
      valid: false,
      errors: []
    })
  })
});

// открытие формы с контактами пользователя 
events.on('order:submit', () => {
  modal.render({
    modalContent:contactForm.render({
      email: '',
      phone: '',
      valid: false,
      errors: [],
    })
  })
})

events.on('order:ready', () => {
  contactForm.valid = true;
})

// Изменение одного из полей формы order
events.on(/^order\..*:changed/, (data: { field: keyof TOrder, value: string }) => {
    productModel.setOrderField(data.field, data.value);
});

// Изменение одного из полей формы contact
events.on(/^contacts\..*:changed/, (data: { field: keyof TOrder, value: string }) => {
    productModel.setOrderField(data.field, data.value);
});

// Изменение состояния валидации формы
events.on('formErrors:changed', (errors: Partial<TOrder>) => {
  const { payment, address, email, phone} = errors;
  orderForm.valid = !payment && !address;
  orderForm.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
  contactForm.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

// Отправлие формы заказа
events.on('contacts:submit', () => {
  const apiData = {
      payment: productModel.order.payment,
      address: productModel.order.address,
      email: productModel.order.email,
      phone: productModel.order.phone,
      total: productModel.basket.total,
      items: productModel.basket.products
  }
  api.orderProducts(apiData)
    .then((result) => {
      productModel.clearBasket();
      const success = new Success(cloneTemplate(successTemplate), {
        onClick: () => {
          modal.close();
        }
      });

      modal.render({
        modalContent: success.render(result)
      });
    })
    .catch(err => {
      console.error(err);
    });
});
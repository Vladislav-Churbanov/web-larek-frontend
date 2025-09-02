# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
## Описание проекта

Проект Web-ларек реализует пример типового интернет-магазина. Пользователь может просматривать список товаров, 
добавлять/убирать товары из корзины, а также заказывать. Проект реализован на TypeScript и представляет собой SPA(Single Page Application)
c использованием API для получения данных о товарах.

Особенности реализации: — пользователь имеет возможность добавить в корзину и купить не более 1 единицы товара за 1 раз;
В каталоге есть товары, которые являются бесценными и их невохможно добавить в корзину/купить.

## Описание интерфейса

 Интерфейс можно условно разделить на 3 процесса:
 1. Просмотр каталога товаров
 2. Детальный просмотр каждого товара
 2. Добавление товаров в корзину/удаление
 3. Оформление заказа

## Интерфейсы данных

### `IProduct` - Интерфейс описывающий товар 

```typescript
interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  categoty: string;
  price: number | null;
}
```
свойства интерфейса:
1.  `category` - категория товара
2.  `title` - название товара
3.  `image` - картинка
4.  `price` - цена товара 
5.  `id` - идентификатор товара
6.  `description` - описание товара

### `IBasketIndex` - Интерфейс, частисно описывающий товар в корзине 

```typescript
interface IBasketIndex {
  index: number
}
```
Этот интерфейс предназначен для описания товара, находящегося в корзине (в отличие от товаров на странице или в модальном окне, для которых нумерация не требуется). Он включает в себя такие свойства, как:
1.  `index` - индекс товара

### `IBasket` - Интерфейс описывающий корзину

```typescript
interface IBasket {
  products: string[];
  total: number;
}
```

Свойства интерфейса:
1. `products` - массив идентефикаторов продуктов в корзине
2.  `total` - сумма товаров в корзине

### `IOrder` - Интерфейс, представляющий структуру заказа, который отправляется на сервер.

```typescript
interface IOrder {
  payment: TPaymentMethod;
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}
```
Свойства интерфейса:
1.  `items` - массив идентефикаторов товаров, которые пользователь заказал
2.  `payments` - способ оплаты: онлайн/при получении
3.  `address` - адрес доставки
4.  `email` - почта покупателя 
5.  `phone` - телефон покупателя 
6.  `total` - итоговая сумма в заказе

### `IOrderResult` - Интерфейс, описывающий Promise, который возвращается в процессе отправки товара на сервер.

```typescript
interface IOrderResult {
  id: string,
  total: number
}
```
Свойства интерфейса:
1.  `id` -  идентефикатор товаров, которые пользователь заказал
2.  `total` - итоговая сумма в заказе


### Тип данных `TOrder`

```typescript
type TOrder = Omit<IOrder, 'total' | 'items'>
```

Этот интерфейс создаётся на базе IOrder, но исключает свойства total и items. <br/>
Он предназначен для использования в классе OrderForm, где эти свойства не нужны.

### Тип данных `TPayment`

```typescript
type TPayment = 'card' | 'cash' | ''
```

Предназначен для применения в методах модели данных

### Тип данных `TCard`

Этот тип формируется на основе интерфейсов `IProduct` и `IBasket` и предназначен 
для полной типизации карточек товара.

```typescript
type TCard = IProduct & IBasketIndex;
```

## Применяемый паттерн: MVP (Model-View-Presenter)

### Model (Модель)
- содержит бизнес-логику, данные и правила работы с ними.
- отвечает за хранение и обработку данных, взаимодействие с базой данных или API.

### View (представление)
- отвечает за отображение пользовательского интерфейса.
- взаимодействует с пользователем, отображает данные, передает команды (события) презентеру.

### Presenter (Представитель)
- посредник между View и Model.
- обрабатывает пользовательские действия, запрашивает данные у модели и обновляет View.
- содержит бизнес-логику, связанную с отображением данных.

## Модели данных

### Класс `ProductModel`

Этот класс предназначен для взаимодействия с моделью данных всего приложения
```typescript
class ProductModel {
  products: IProduct[]; // каталог товаров
  preview: IProduct; // карточка для отображения в модальном окне
  // корзина товаров
  basket: IBasket = { 
    products: [], // продукты в корзине
    total: 0 // итоговая сумма в корзине
  };
  // заказ
  order: TOrder = { 
    payment: 'card', // способ оплаты(по умолчанию card)
    email: '', // эл. почта покупателя
    phone: '', // телефон покупателя
    address:'', // адрес покупателя
  };
  formErrors: Partial<Record<keyof TOrder, string>> = {}; //Ошибки, возникающие при валидации формы, связаны с типизацией: свойства с ключами типа TOrder объявлены как необязательные и имеют тип string

  constructor(protected events: IEvents) {} // конструктор принимает защищенное свойство Events с типом интерфейса IEvents.

  setProducts(products: IProduct[]) {} // получает массив товаров

  getProduct(id: string):IProduct {} // отдает товар по id

  setPrewiew(product:IProduct) {} // получает prewiew для показа превью карточки в модальном окне

  isProductInBasket(item: IProduct) {} // для проверки наличия товара в корзине

  addBasket(item: IProduct) {} // добавление в корзину

  removeBasket(item: IProduct) {} // удаление из корзины

  clearBasket() {} // очистка корзины

  setPaymentMethod(method:TPayment) {} // выбор метода оплаты 

  setOrderField(field: keyof TOrder, value: string) {} // готовит данные пользователя к отправке

  orderValidation() {} // валидация формы
}
```

### Класс ProductApi

Не относится к модели данных, предназначен для работы с API сервера

```typescript
class ProductApi extends Api {
  readonly setBaseUrl: string; // для загрузки картинок с сервера, доступно только для чтения

  constructor(setBaseUrl:string, baseUrl: string) {
    super(baseUrl),
    this.setBaseUrl = setBaseUrl;
  }

  getProducts() {} // получение товаров с сервера

  orderProducts() {} // отправка заказа пользователя на сервер
}
```


## Компоненты представления

В компонеты представления входят базовые классы:<br/>
`api.ts` - для работы с API, <br/>
`component.ts` - описывает компоненты и методы работы с ними(setText, setDisabled, ...) <br/>
`event.ts` - для работы с событиями <br/>
`form.ts` - универсальный класс для работы с формами <br/>

### Класс `Card`

Этот класс предназначен для описания карточки товара, её свойств и методов. 
Он наследует от базового компонента `Component`, который типизирован с помощью дженерика `TCard`

```typescript
interface ICardEvent {
  onclick: (event: MouseEvent) => void;
}

class Card extends Component<IBasket> {
  protected titleElement: HTMLElement; // название карточки
  protected priceElement: HTMLElement; // цена
  protected categoryElement?: HTMLElement; // категория товара(необязательное свойство)
  protected imageElement?: HTMLImageElement; // картинка товара(необязательное свойство)
  protected actionButton?: HTMLButtonElement; // кнопка (необязательное свойство)
  protected descriptionElement?: HTMLElement; // описание товара(необязательное свойство)
  protected indexElement?: HTMLElement; // индекс карточки в корзине(необязательное свойство)

  // Конструктор принимает в качестве параметров контейнер типа HTMLElement и actions с типизацией по интерфейсу ICardEvent, предназначенные для регистрации обработчиков событий MouseEvent пользователя.
  constructor(container: HTMLElement, actions?: ICardEvent) {
    super(container);

    // Затем осуществляется поиск элементов карточек на странице с помощью метода ensureElement (для элементов, присутствующих в любой карточке) и querySelector (для необязательных элементов).
    ...

    // обработчик события 
    if(actions?.onclick) {}
  }

  set title(value:string) {} // устанавливаем значение в cardTitle

  get title():string {} // получаем название карточки чтобы потом установить его в alt для картинки

  set price(value:string) {} // устанавливаем цену и учитываем наличие бесценных товаров

  set category(value:string) {} // устанавливаем категорию товара и, в зависимости от нее, прописываем логику изменения отображения категории

  set image(value:string) {} // устанавливаем картинку 

  set description(value:string) {} // устанавливаем описание товара, которое будет использовано при событии 'prewiew:changed'

  set button(value:string) {} // устанавливаем кнопку для того, чтобы менять текст кнопки в зависимости от того, добавлен ли элемент в корзину

  set index(value:number) {} // устанавливаем index карточки, нужен для нумерации в корзине
}
```

### Класс `Basket`

Этот класс предназначен для описания корзины товаров, её свойств и методов. 
Он наследует от базового компонента `Component`, который типизирован с помощью дженерика интерфейса `IBasketView`

```typescript
interface IBasketView {
  items: HTMLElement[]; // массив всех HTMLElement
  total: number; // итоговая сумма
}

class Basket extends Component<IBasketView> {
  protected itemListContainer: HTMLElement; // свойство контейнерва товаров
  protected priceContainer: HTMLElement; // итоговая сумма 
  protected buttonContainer: HTMLElement; // кнопка в корзине

  // конструктор принмает в контейнере HTMLElement и events для работы с событиями
  constructor(container: HTMLElement, protected events: EventEmitter){
    super(container);

    // дальше идет поиск элементов корзины на страничке
    ...

    // слушатель и обработчик клика по кнопке, по клику инициируем событие 'order:open'
    this.buttonContainer.addEventListener('click', () => {})

    // ставим начальное значение для массива элементов корзины
    this.items = [];
  }

  set items(items: HTMLElement[]) {} // Этот метод заполняет массив элементов корзины, принимая в качестве аргумента массив HTMLElement. Также он содержит логику обработки ситуации, когда массив пуст.

  set total(total: number) {} // метод устанавливающий итоговую сумму в корзине
}
```

### Класс `Modal`

Этот класс предназначен для описания всех модальных окон, их свойств и методов. 
Он наследует от базового компонента `Component`, который типизирован с помощью дженерика интерфейса `IModal`

```typescript
interface IModal {
  modalContent: HTMLElement;
}

class Modal extends Component<IModal> {
  protected closeModalButton: HTMLButtonElement; // кнопка закрытия модального окна
  protected contentModal: HTMLElement; // контент модального окна

  // конструктор принмает в контейнере HTMLElement и events для работы с событиями
  constructor(container: HTMLElement, protected events: IEvents) {
    super(container);

    // дальше идет поиск элементов на в модалках
    ...

    // слушатели и обработчики события 'click'
    this.closeModalButton.addEventListener('click', this.close.bind(this));
    this.container.addEventListener('click', this.close.bind(this));
    this.contentModal.addEventListener('click', (event) => event.stopPropagation());
  }

  set modalContent(value: HTMLElement) {} // устанавливаем контент

  open() {} // метод открытия модального окна и инициирующий событие 'modal:open'(блокировка прокрутки страницы)

  close() {} // метод закрытия модального окна и инициирующий событие 'modal:close'(разблокировка прокрутки страницы)

  render(data: IModal): HTMLElement {} // рендерит модальное окно, принимает данные интерфейса IModal и возвращает container с дженериком HTMLElement, также открывает модальное окно посредством метода open()
}
```

### Класс `Page`

Этот класс предназначен для описания страницы, её свойств и методов. 
Он наследует от базового компонента `Component`, который типизирован с помощью дженерика интерфейса `IPage`.

```typescript
interface IPage {
  catalog: HTMLElement[]; // каталог HTMLElement-ов
  locked: boolean; //cостояние странички, для того чтобы не было прокрутки при открытии модального окна
  counter: number; // счетчик для отображения количества элементов в корзине
}

class Page extends Component<IPage> {
  protected wrapperContainer: HTMLElement; // враппер, в которую обернута наша страничка
  protected galleryContainer: HTMLElement; // каталог
  protected basketCounterContainer: HTMLElement; // счетчик
  protected basketContainer: HTMLButtonElement; // корзина

  // конструктор принмает в контейнере HTMLElement и events для работы с событиями
  constructor(container: HTMLElement, protected events: IEvents){
    super(container);

    // дальше идет поиск элементов странички
    ...

    // слушаель и обработчик клика по корзине и инициация emit-a открытия корзины
    this.basketContainer.addEventListener('click', () => {
      this.events.emit('basket:open');
    });
  }

  set counter (value: number) {} // устанавливает значение счетчика

  set catalog (products: HTMLElement[]) {} // устанавливает элементы каталога

  set locked(value: boolean) {} // устанавлвает состояние страницы: заблокировано/разблокировано 
}
```

### Класс `Order`

Этот класс предназначен для описания формы заказа, её свойств и методов. 
Он наследует от базового типа `Form`, который типизирован с помощью дженерика `TOrder`.

```typescript
class OrderForm extends Form<TOrder> {
    protected cardPay: HTMLButtonElement; //свойство формы оплаты
    protected cashPay: HTMLButtonElement; //свойство формы оплаты

    // конструктор принмает в контейнере HTMLFormElement и events для работы с событиями
    constructor(container: HTMLFormElement, events: EventEmitter) {
      super(container, events);

      // дальше идет поиск элементов странички
      ...

      // слушатели на кнопки смены формы оплаты
      this.cardPay.addEventListener('click', () => {});
      this.cashPay.addEventListener('click', () => {})
    }

    set payment(value:TPaymentMethod) {} // устанавливаем способ оплаты

    set address(value:string) {} // устанавливаем адрес
}
```

### Класс `UserContacts`

Предназначен для описание формы контактов, ее свойств и методов
Наследуется от базового типа `Form`, который типизируется дженериком типа `TOrder` 

```typescript
class UserContacts extends Form<TOrder> {

  set email(value:string) {} // утсанавливаем email

  set phone(value:string) {} // устанавливаем номер телефона
}
```

## Презентер

Поскольку в приложении используется только одна страница, достаточно одного презентера. 
Его код не будет вынесен в отдельный класс — он будет размещён прямо в основном скрипте приложения `index.ts`.


## События

Для организации взаимодействия между компонентами различных слоёв будет применяться событийно-ориентированный метод. 
В качестве реализации этого подхода будет использоваться базовый класс `EventEmitter`

Для демонстрации работы данного подхода взят пример с событием клика по карточке товара и последующим нажатием кнопки «Добавить в корзину»:

1. Когда пользователь кликает на одну из карточек, отображённых на странице, инициируется событие `card:select`, которое возвращает объект `item`, связанный с выбранной карточкой.
2. Это событие обрабатывается с помощью метода `events:on`, который принимает `item` и вызывает у модели данных метод `setPreview`.
3. Метод `setPreview` получает выбранный `item` и инициирует событие `preview:changed`.
4. Это событие создает экземпляр класса `Card`, который реагирует на клик по кнопке внутри карточки, а также занимается рендерингом и последующим открытием соответствующего модального окна, заполняя его содержимым.
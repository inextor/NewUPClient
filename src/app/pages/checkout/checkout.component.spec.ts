import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CheckoutComponent } from './checkout.component';
import { RestService } from '../../services/rest.service';
import { Rest } from '../../classes/Rest';
import { Cart } from '../../models/RestModels/Cart';
import { Order } from '../../models/RestModels/Order';
import { Order_Item} from '../../models/RestModels/Order_Item';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';
import { Ecommerce } from '../../models/RestModels/Ecommerce';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let mockRestService: jasmine.SpyObj<RestService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockRestCart: jasmine.SpyObj<Rest<Cart, Cart>>;
  let mockRestOrder: jasmine.SpyObj<Rest<Order, Order>>;
  let mockRestOrderItem: jasmine.SpyObj<Rest<Order_Item, Order_Item>>;
  let mockRestEcommerceItem: jasmine.SpyObj<Rest<Ecommerce_Item, Ecommerce_Item>>;
  let mockRestItem: jasmine.SpyObj<Rest<any, any>>;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    username: 'testuser',
    password: '',
    status: 'ACTIVE' as const,
    created: new Date(),
    updated: new Date()
  };

  const mockEcommerce: Ecommerce = {
    id: 1,
    name: 'Test Store',
    pos_id: 1,
    pos_session_id: null,
    pos_main_user_id: 1,
    color: '#000000',
    banner_image_id: null,
    font_color: '#FFFFFF',
    logo_image_id: null
  };

  const mockCartItem: Cart = {
    id: 1,
    user_id: 1,
    ecommerce_item_id: 1,
    variation: 'M',
    qty: 2
  };

  const mockEcommerceItem: Ecommerce_Item = {
    id: 1,
    code: null,
    item_id: 1,
    ecommerce_id: 1,
    name: 'Test Product',
    price: 100,
    category_id: 1,
    category_name: null,
    sizes: 'unico',
    created: new Date(),
    updated: new Date()
  };

  const mockItemInfo = {
    item: {
      id: 1,
      name: 'Test Item',
      image_id: 1
    }
  };

  beforeEach(async () => {
    mockRestService = jasmine.createSpyObj('RestService', ['showError', 'showSuccess', 'loadCartCount']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockRestService.user = mockUser;
    mockRestService.ecommerce = mockEcommerce;
    mockRestService.base_url = 'http://localhost';

    mockActivatedRoute = {
      paramMap: of({
        get: (key: string) => null
      })
    };

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        { provide: RestService, useValue: mockRestService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;

    // Create spies for Rest instances
    mockRestCart = jasmine.createSpyObj('Rest', ['search', 'delete']);
    mockRestOrder = jasmine.createSpyObj('Rest', ['create']);
    mockRestOrderItem = jasmine.createSpyObj('Rest', ['create']);
    mockRestEcommerceItem = jasmine.createSpyObj('Rest', ['get']);
    mockRestItem = jasmine.createSpyObj('Rest', ['get']);

    component.rest_cart = mockRestCart;
    component.rest_order = mockRestOrder;
    component.rest_order_item = mockRestOrderItem;
    component.rest_ecommerce_item = mockRestEcommerceItem;
    component.rest_item = mockRestItem;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with user information', (done) => {
    mockRestCart.search.and.returnValue(Promise.resolve({
      data: [mockCartItem],
      total: 1,
      success: true
    }));
    mockRestEcommerceItem.get.and.returnValue(Promise.resolve(mockEcommerceItem));
    mockRestItem.get.and.returnValue(Promise.resolve(mockItemInfo));

    component.ngOnInit();

    expect(component.order.user_id).toBe(1);
    expect(component.order.customer_name).toBe('Test User');
    expect(component.order.customer_email).toBe('test@example.com');
    expect(component.order.customer_phone).toBe('1234567890');
    expect(component.order.ecommerce_id).toBe(1);

    setTimeout(() => {
      done();
    }, 100);
  });

  it('should load cart items on init', (done) => {
    mockRestCart.search.and.returnValue(Promise.resolve({
      data: [mockCartItem],
      total: 1,
      success: true
    }));
    mockRestEcommerceItem.get.and.returnValue(Promise.resolve(mockEcommerceItem));
    mockRestItem.get.and.returnValue(Promise.resolve(mockItemInfo));

    component.ngOnInit();

    setTimeout(() => {
      expect(mockRestCart.search).toHaveBeenCalledWith({ user_id: 1 });
      expect(component.cart_items.length).toBe(1);
      expect(component.is_loading).toBe(false);
      done();
    }, 100);
  });

  it('should redirect to cart if cart is empty', (done) => {
    mockRestCart.search.and.returnValue(Promise.resolve({
      data: [],
      total: 0,
      success: true
    }));

    component.ngOnInit();

    setTimeout(() => {
      expect(mockRestService.showError).toHaveBeenCalledWith('Tu carrito está vacío');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/cart']);
      done();
    }, 100);
  });

  it('should calculate totals correctly', () => {
    component.cart_items = [{
      ...mockCartItem,
      ecommerce_item: mockEcommerceItem
    }];

    component.calculateTotals();

    expect(component.order.subtotal).toBe(200); // 2 items * $100
    expect(component.order.tax_amount).toBe(0);
    expect(component.order.shipping_cost).toBe(0);
    expect(component.order.total_amount).toBe(200);
    expect(component.order.items_count).toBe(2);
  });

  it('should validate required fields before checkout', () => {
    component.order.customer_name = '';
    component.order.customer_email = 'test@example.com';
    component.order.customer_phone = '1234567890';

    component.processCheckout();

    expect(mockRestService.showError).toHaveBeenCalledWith('Por favor complete todos los campos obligatorios');
  });

  it('should validate shipping address before checkout', () => {
    component.order.customer_name = 'Test User';
    component.order.customer_email = 'test@example.com';
    component.order.customer_phone = '1234567890';
    component.order.shipping_address = '';

    component.processCheckout();

    expect(mockRestService.showError).toHaveBeenCalledWith('Por favor complete la dirección de envío completa');
  });

  it('should create order and order items successfully', (done) => {
    const mockCreatedOrder: Order = {
      id: 1,
      ecommerce_id: 1,
      user_id: 1,
      customer_name: 'Test User',
      customer_email: 'test@example.com',
      customer_phone: '1234567890',
      shipping_address: '123 Test St',
      shipping_city: 'Test City',
      shipping_state: 'Test State',
      shipping_postal_code: '12345',
      shipping_country: 'Test Country',
      subtotal: 200,
      tax_amount: 0,
      shipping_cost: 0,
      total_amount: 200,
      items_count: 2,
      order_number: '#1',
      status: 'PENDING',
      pos_order_id: null,
      pos_order_json: null,
      order_date: new Date(),
      notes: null,
      updated_by_user_id: null,
      created_by_user_id: 1,
      created: new Date(),
      updated: new Date()
    };

    const mockOrderItem: Order_Item = {
      id: 1,
      order_id: 1,
      ecommerce_item_id: 1,
      variation: 'M',
      qty: 2,
      unit_price: 100,
      notes: null,
      created: new Date(),
      updated: new Date()
    };

    component.order = {
      ...mockCreatedOrder,
      id: 0
    };
    component.cart_items = [{
      ...mockCartItem,
      ecommerce_item: mockEcommerceItem
    }];

    mockRestOrder.create.and.returnValue(Promise.resolve(mockCreatedOrder));
    mockRestOrderItem.create.and.returnValue(Promise.resolve(mockOrderItem));
    mockRestCart.delete.and.returnValue(Promise.resolve(undefined));

    component.processCheckout();

    setTimeout(() => {
      expect(mockRestOrder.create).toHaveBeenCalled();
      expect(mockRestOrderItem.create).toHaveBeenCalled();
      expect(mockRestCart.delete).toHaveBeenCalled();
      expect(mockRestService.loadCartCount).toHaveBeenCalled();
      expect(mockRestService.showSuccess).toHaveBeenCalledWith('¡Pedido creado exitosamente!');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/order-confirmation', 1]);
      done();
    }, 100);
  });

  it('should handle errors during checkout', (done) => {
    component.order.customer_name = 'Test User';
    component.order.customer_email = 'test@example.com';
    component.order.customer_phone = '1234567890';
    component.order.shipping_address = '123 Test St';
    component.order.shipping_city = 'Test City';
    component.order.shipping_state = 'Test State';
    component.order.shipping_postal_code = '12345';

    mockRestOrder.create.and.returnValue(Promise.reject('Error creating order'));

    component.processCheckout();

    setTimeout(() => {
      expect(mockRestService.showError).toHaveBeenCalledWith('Error creating order');
      expect(component.is_processing).toBe(false);
      done();
    }, 100);
  });
});

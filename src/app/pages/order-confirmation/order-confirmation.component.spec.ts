import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { OrderConfirmationComponent } from './order-confirmation.component';
import { RestService } from '../../services/rest.service';
import { Rest } from '../../classes/Rest';
import { Order } from '../../models/RestModels/Order';
import { Order_Item } from '../../models/RestModels/Order_Item';
import { Ecommerce_Item } from '../../models/RestModels/Ecommerce_Item';

describe('OrderConfirmationComponent', () => {
  let component: OrderConfirmationComponent;
  let fixture: ComponentFixture<OrderConfirmationComponent>;
  let mockRestService: jasmine.SpyObj<RestService>;
  let mockActivatedRoute: any;
  let mockRestOrder: jasmine.SpyObj<Rest<Order, Order>>;
  let mockRestOrderItem: jasmine.SpyObj<Rest<Order_Item, Order_Item>>;
  let mockRestEcommerceItem: jasmine.SpyObj<Rest<Ecommerce_Item, Ecommerce_Item>>;
  let mockRestItem: jasmine.SpyObj<Rest<any, any>>;

  const mockOrder: Order = {
    id: 1,
    ecommerce_id: 1,
    user_id: 1,
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '1234567890',
    shipping_address: '123 Main St',
    shipping_city: 'Test City',
    shipping_state: 'Test State',
    shipping_postal_code: '12345',
    shipping_country: 'USA',
    subtotal: 200,
    tax_amount: 20,
    shipping_cost: 10,
    total_amount: 230,
    items_count: 2,
    order_number: '#1',
    status: 'PENDING',
    pos_order_id: null,
    pos_order_json: null,
    order_date: new Date('2025-11-14T00:32:58'),
    notes: 'Test notes',
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
    mockRestService = jasmine.createSpyObj('RestService', ['showError', 'showSuccess']);
    mockRestService.base_url = 'http://localhost';
    mockRestService.pos_rest = { base_url: 'http://localhost' } as any;

    mockActivatedRoute = {
      paramMap: of({
        get: (key: string) => {
          if (key === 'id') return '1';
          return null;
        }
      })
    };

    await TestBed.configureTestingModule({
      imports: [OrderConfirmationComponent],
      providers: [
        { provide: RestService, useValue: mockRestService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderConfirmationComponent);
    component = fixture.componentInstance;

    // Create spies for Rest instances
    mockRestOrder = jasmine.createSpyObj('Rest', ['get']);
    mockRestOrderItem = jasmine.createSpyObj('Rest', ['search']);
    mockRestEcommerceItem = jasmine.createSpyObj('Rest', ['get']);
    mockRestItem = jasmine.createSpyObj('Rest', ['get']);

    component.rest_order = mockRestOrder;
    component.rest_order_item = mockRestOrderItem;
    component.rest_ecommerce_item = mockRestEcommerceItem;
    component.rest_item = mockRestItem;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load order on init', (done) => {
    mockRestOrder.get.and.returnValue(Promise.resolve(mockOrder));
    mockRestOrderItem.search.and.returnValue(Promise.resolve({
      data: [mockOrderItem],
      total: 1,
      success: true
    }));
    mockRestEcommerceItem.get.and.returnValue(Promise.resolve(mockEcommerceItem));
    mockRestItem.get.and.returnValue(Promise.resolve(mockItemInfo));

    component.ngOnInit();

    setTimeout(() => {
      expect(mockRestOrder.get).toHaveBeenCalledWith(1);
      expect(component.order).toEqual(mockOrder);
      expect(component.is_loading).toBe(false);
      done();
    }, 100);
  });

  it('should load order items with details', (done) => {
    mockRestOrder.get.and.returnValue(Promise.resolve(mockOrder));
    mockRestOrderItem.search.and.returnValue(Promise.resolve({
      data: [mockOrderItem],
      total: 1,
      success: true
    }));
    mockRestEcommerceItem.get.and.returnValue(Promise.resolve(mockEcommerceItem));
    mockRestItem.get.and.returnValue(Promise.resolve(mockItemInfo));

    component.ngOnInit();

    setTimeout(() => {
      expect(mockRestOrderItem.search).toHaveBeenCalledWith({ order_id: 1 });
      expect(component.order_items.length).toBe(1);
      expect(component.order_items[0].ecommerce_item).toEqual(mockEcommerceItem);
      expect(component.order_items[0].item_info).toEqual(mockItemInfo);
      done();
    }, 100);
  });

  it('should display all customer information', (done) => {
    mockRestOrder.get.and.returnValue(Promise.resolve(mockOrder));
    mockRestOrderItem.search.and.returnValue(Promise.resolve({
      data: [],
      total: 0,
      success: true
    }));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.order?.customer_name).toBe('John Doe');
      expect(component.order?.customer_email).toBe('john@example.com');
      expect(component.order?.customer_phone).toBe('1234567890');
      done();
    }, 100);
  });

  it('should display all shipping information', (done) => {
    mockRestOrder.get.and.returnValue(Promise.resolve(mockOrder));
    mockRestOrderItem.search.and.returnValue(Promise.resolve({
      data: [],
      total: 0,
      success: true
    }));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.order?.shipping_address).toBe('123 Main St');
      expect(component.order?.shipping_city).toBe('Test City');
      expect(component.order?.shipping_state).toBe('Test State');
      expect(component.order?.shipping_postal_code).toBe('12345');
      expect(component.order?.shipping_country).toBe('USA');
      done();
    }, 100);
  });

  it('should display correct order totals', (done) => {
    mockRestOrder.get.and.returnValue(Promise.resolve(mockOrder));
    mockRestOrderItem.search.and.returnValue(Promise.resolve({
      data: [],
      total: 0,
      success: true
    }));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.order?.subtotal).toBe(200);
      expect(component.order?.tax_amount).toBe(20);
      expect(component.order?.shipping_cost).toBe(10);
      expect(component.order?.total_amount).toBe(230);
      expect(component.order?.items_count).toBe(2);
      done();
    }, 100);
  });

  it('should display order status', (done) => {
    mockRestOrder.get.and.returnValue(Promise.resolve(mockOrder));
    mockRestOrderItem.search.and.returnValue(Promise.resolve({
      data: [],
      total: 0,
      success: true
    }));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.order?.status).toBe('PENDING');
      done();
    }, 100);
  });

  it('should display order date', (done) => {
    mockRestOrder.get.and.returnValue(Promise.resolve(mockOrder));
    mockRestOrderItem.search.and.returnValue(Promise.resolve({
      data: [],
      total: 0,
      success: true
    }));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.order?.order_date).toBeTruthy();
      done();
    }, 100);
  });

  it('should display order notes if available', (done) => {
    mockRestOrder.get.and.returnValue(Promise.resolve(mockOrder));
    mockRestOrderItem.search.and.returnValue(Promise.resolve({
      data: [],
      total: 0,
      success: true
    }));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.order?.notes).toBe('Test notes');
      done();
    }, 100);
  });

  it('should handle errors when loading order', (done) => {
    mockRestOrder.get.and.returnValue(Promise.reject('Error loading order'));

    component.ngOnInit();

    setTimeout(() => {
      expect(mockRestService.showError).toHaveBeenCalledWith('Error loading order');
      expect(component.is_loading).toBe(false);
      done();
    }, 100);
  });

  it('should handle empty order items', (done) => {
    mockRestOrder.get.and.returnValue(Promise.resolve(mockOrder));
    mockRestOrderItem.search.and.returnValue(Promise.resolve({
      data: [],
      total: 0,
      success: true
    }));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.order_items.length).toBe(0);
      done();
    }, 100);
  });

  it('should load multiple order items', (done) => {
    const mockOrderItem2: Order_Item = {
      ...mockOrderItem,
      id: 2,
      ecommerce_item_id: 2,
      variation: 'L',
      qty: 1
    };

    const mockEcommerceItem2: Ecommerce_Item = {
      ...mockEcommerceItem,
      id: 2,
      item_id: 2,
      name: 'Test Product 2'
    };

    mockRestOrder.get.and.returnValue(Promise.resolve(mockOrder));
    mockRestOrderItem.search.and.returnValue(Promise.resolve({
      data: [mockOrderItem, mockOrderItem2],
      total: 2,
      success: true
    }));

    mockRestEcommerceItem.get.and.callFake((id: number) => {
      if (id === 1) return Promise.resolve(mockEcommerceItem);
      if (id === 2) return Promise.resolve(mockEcommerceItem2);
      return Promise.resolve(mockEcommerceItem);
    });

    mockRestItem.get.and.returnValue(Promise.resolve(mockItemInfo));

    component.ngOnInit();

    setTimeout(() => {
      expect(component.order_items.length).toBe(2);
      expect(component.order_items[0].ecommerce_item?.name).toBe('Test Product');
      expect(component.order_items[1].ecommerce_item?.name).toBe('Test Product 2');
      done();
    }, 100);
  });

  it('should calculate line totals correctly for order items', (done) => {
    mockRestOrder.get.and.returnValue(Promise.resolve(mockOrder));
    mockRestOrderItem.search.and.returnValue(Promise.resolve({
      data: [mockOrderItem],
      total: 1,
      success: true
    }));
    mockRestEcommerceItem.get.and.returnValue(Promise.resolve(mockEcommerceItem));
    mockRestItem.get.and.returnValue(Promise.resolve(mockItemInfo));

    component.ngOnInit();

    setTimeout(() => {
      const orderItem = component.order_items[0];
      const lineTotal = (orderItem.unit_price || 0) * orderItem.qty;
      expect(lineTotal).toBe(200); // 2 * 100
      done();
    }, 100);
  });
});

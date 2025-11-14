import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CheckoutComponent } from './checkout.component';
import { RestService } from '../../services/rest.service';
import { Rest } from '../../classes/Rest';
import { Cart } from '../../models/RestModels/Cart';
import { Order } from '../../models/RestModels/Order';
import { Order_Item } from '../../models/RestModels/Order_Item';

describe('CheckoutComponent Integration Tests (Real Backend)', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let restService: RestService;
  let router: Router;
  let createdOrderId: number | null = null;
  let createdCartItemIds: number[] = [];

  beforeEach(async () => {
    const mockActivatedRoute = {
      params: of({}),
      queryParams: of({}),
      paramMap: of({
        get: (key: string) => null
      })
    };

    const mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        RestService,
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    restService = TestBed.inject(RestService);
    router = TestBed.inject(Router);

    // Ensure user is logged in for tests
    if (!restService.user || !restService.is_logged_in) {
      console.warn('User is not logged in. Integration tests may fail.');
    }
  });

  afterEach(async () => {
    // Cleanup: Delete created order and cart items
    if (createdOrderId) {
      try {
        const rest_order = new Rest<Order, Order>(restService, 'order.php');
        await rest_order.delete(createdOrderId);
        console.log('Cleaned up order:', createdOrderId);
      } catch (error) {
        console.error('Failed to cleanup order:', error);
      }
      createdOrderId = null;
    }

    if (createdCartItemIds.length > 0) {
      try {
        const rest_cart = new Rest<Cart, Cart>(restService, 'cart.php');
        for (const cartId of createdCartItemIds) {
          await rest_cart.delete(cartId);
        }
        console.log('Cleaned up cart items:', createdCartItemIds);
      } catch (error) {
        console.error('Failed to cleanup cart items:', error);
      }
      createdCartItemIds = [];
    }
  });

  it('should create a real order in the database', async () => {
    // Skip if user is not logged in
    if (!restService.user || !restService.is_logged_in) {
      pending('User must be logged in for this test');
      return;
    }

    // Step 1: Create a test cart item
    const rest_cart = new Rest<Cart, Cart>(restService, 'cart.php');
    const rest_ecommerce_item = new Rest(restService, 'ecommerce_item.php');

    // Get the first available ecommerce item
    const ecommerceItemsResponse: any = await rest_ecommerce_item.search({
      limit: 1
    });

    expect(ecommerceItemsResponse.data.length).toBeGreaterThan(0, 'No ecommerce items found in database');

    const testEcommerceItem = ecommerceItemsResponse.data[0];

    // Create cart item
    const cartItem = await rest_cart.create({
      user_id: restService.user.id,
      ecommerce_item_id: testEcommerceItem.id,
      variation: 'unico',
      qty: 2
    } as any);

    createdCartItemIds.push(cartItem.id);

    // Step 2: Initialize component (should load cart)
    component.ngOnInit();

    // Wait for cart to load
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(component.cart_items.length).toBe(1);

    // Step 3: Fill in order information
    component.order.customer_name = 'Integration Test User';
    component.order.customer_email = 'integration@test.com';
    component.order.customer_phone = '1234567890';
    component.order.shipping_address = '123 Test Street';
    component.order.shipping_city = 'Test City';
    component.order.shipping_state = 'Test State';
    component.order.shipping_postal_code = '12345';
    component.order.shipping_country = 'Mexico';

    // Step 4: Process checkout
    component.processCheckout();

    // Wait for order to be created
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 5: Verify order was created in database
    expect(router.navigate).toHaveBeenCalled();
    const navigateArgs = (router.navigate as jasmine.Spy).calls.mostRecent().args;
    expect(navigateArgs[0][0]).toBe('/order-confirmation');

    createdOrderId = navigateArgs[0][1];
    expect(createdOrderId).toBeGreaterThan(0);

    // Step 6: Verify the order exists in database
    const rest_order = new Rest<Order, Order>(restService, 'order.php');
    const createdOrder = await rest_order.get(createdOrderId!);

    expect(createdOrder).toBeTruthy();
    expect(createdOrder.customer_name).toBe('Integration Test User');
    expect(createdOrder.customer_email).toBe('integration@test.com');
    expect(createdOrder.customer_phone).toBe('1234567890');
    expect(createdOrder.shipping_address).toBe('123 Test Street');
    expect(createdOrder.shipping_city).toBe('Test City');
    expect(createdOrder.shipping_state).toBe('Test State');
    expect(createdOrder.shipping_postal_code).toBe('12345');
    expect(createdOrder.total_amount).toBeGreaterThan(0);

    // Step 7: Verify order items were created
    const rest_order_item = new Rest<Order_Item, Order_Item>(restService, 'order_item.php');
    const orderItemsResponse: any = await rest_order_item.search({
      order_id: createdOrderId
    });

    expect(orderItemsResponse.data.length).toBe(1);
    expect(orderItemsResponse.data[0].qty).toBe(2);
    expect(orderItemsResponse.data[0].ecommerce_item_id).toBe(testEcommerceItem.id);

    console.log('✓ Order created successfully in database:', createdOrderId);
  });

  it('should validate required fields before creating order', () => {
    component.order.customer_name = '';
    component.order.customer_email = 'test@test.com';
    component.order.customer_phone = '1234567890';

    spyOn(restService, 'showError');

    component.processCheckout();

    expect(restService.showError).toHaveBeenCalledWith('Por favor complete todos los campos obligatorios');
  });

  it('should validate shipping address before creating order', () => {
    component.order.customer_name = 'Test User';
    component.order.customer_email = 'test@test.com';
    component.order.customer_phone = '1234567890';
    component.order.shipping_address = '';

    spyOn(restService, 'showError');

    component.processCheckout();

    expect(restService.showError).toHaveBeenCalledWith('Por favor complete la dirección de envío completa');
  });
});

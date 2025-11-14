import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CheckoutComponent } from './checkout.component';
import { RestService } from '../../services/rest.service';
import { Rest } from '../../classes/Rest';
import { Cart } from '../../models/RestModels/Cart';
import { Order } from '../../models/RestModels/Order';
import { Order_Item } from '../../models/RestModels/Order_Item';

describe('CheckoutComponent Real Backend Tests', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let restService: RestService;
  let router: Router;
  let createdOrderId: number | null = null;
  let createdCartItemIds: number[] = [];

  // Test credentials
  const TEST_USER = {
    username: 'REDACTED@example.com',
    password: 'REDACTED_PASSWORD'
  };

  beforeAll(async () => {
    // Login first
    const loginRest = new Rest<any, any>(
      { base_url: 'http://localhost/NewUpServer', bearer: '' },
      'login.php'
    );

    try {
      const loginResponse = await loginRest.create({
        username: TEST_USER.username,
        password: TEST_USER.password
      });

      console.log('Login successful:', loginResponse);

      // Store session in localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('session', JSON.stringify(loginResponse.session));
        localStorage.setItem('user', JSON.stringify(loginResponse.user));
        localStorage.setItem('permission', JSON.stringify(loginResponse.permission || {}));
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  });

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

    // Reload user from localStorage after login
    restService.loadAuthDataFromLocalStorage();
  });

  afterEach(async () => {
    // NOTE: Cleanup is disabled so you can see the order in the database
    // To enable cleanup, uncomment the code below

    /*
    // Cleanup: Delete created order
    if (createdOrderId) {
      try {
        const rest_order = new Rest<Order, Order>(restService, 'order.php');
        await rest_order.delete(createdOrderId);
        console.log('✓ Cleaned up order:', createdOrderId);
      } catch (error) {
        console.error('Failed to cleanup order:', error);
      }
      createdOrderId = null;
    }

    // Cleanup: Delete created cart items
    if (createdCartItemIds.length > 0) {
      try {
        const rest_cart = new Rest<Cart, Cart>(restService, 'cart.php');
        for (const cartId of createdCartItemIds) {
          await rest_cart.delete(cartId);
        }
        console.log('✓ Cleaned up cart items:', createdCartItemIds);
      } catch (error) {
        console.error('Failed to cleanup cart items:', error);
      }
      createdCartItemIds = [];
    }
    */

    if (createdOrderId) {
      console.log('✓ Order created and left in database for inspection. Order ID:', createdOrderId);
      console.log('  To view: Navigate to http://localhost:4200/view-order/' + createdOrderId);
    }
  });

  it('should create a real order in the database with actual backend', async () => {
    console.log('=== Starting Real Order Creation Test ===');
    console.log('User logged in:', restService.user?.name);
    console.log('Ecommerce ID:', restService.ecommerce?.id);

    expect(restService.user).toBeTruthy('User should be logged in');
    expect(restService.is_logged_in).toBe(true, 'User should be marked as logged in');

    // Step 1: Get an ecommerce item to add to cart
    const rest_ecommerce_item = new Rest(restService, 'ecommerce_item.php');
    const ecommerceItemsResponse: any = await rest_ecommerce_item.search({
      limit: 1
    });

    expect(ecommerceItemsResponse.data.length).toBeGreaterThan(0, 'No ecommerce items found in database');
    const testEcommerceItem = ecommerceItemsResponse.data[0];
    console.log('Using ecommerce item:', testEcommerceItem.name, '(ID:', testEcommerceItem.id + ')');

    // Step 2: Create a cart item
    const rest_cart = new Rest<Cart, Cart>(restService, 'cart.php');
    const cartItem = await rest_cart.create({
      user_id: restService.user.id,
      ecommerce_item_id: testEcommerceItem.id,
      variation: 'unico',
      qty: 2
    } as any);

    createdCartItemIds.push(cartItem.id);
    console.log('✓ Created cart item ID:', cartItem.id);

    // Step 3: Initialize component (loads cart)
    component.ngOnInit();
    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(component.cart_items.length).toBe(1, 'Cart should have 1 item');
    console.log('✓ Cart loaded with', component.cart_items.length, 'items');

    // Step 4: Fill in order information
    component.order.customer_name = 'Test User Real Backend';
    component.order.customer_email = 'spam@nextor.mx';
    component.order.customer_phone = '5551234567';
    component.order.shipping_address = '456 Real Street';
    component.order.shipping_city = 'Real City';
    component.order.shipping_state = 'Real State';
    component.order.shipping_postal_code = '54321';
    component.order.shipping_country = 'Mexico';
    component.order.notes = 'This is a test order with delivery notes from automated test';

    console.log('✓ Order form filled');
    console.log('  Subtotal:', component.order.subtotal);
    console.log('  Total:', component.order.total_amount);

    // Step 5: Process checkout
    component.processCheckout();
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 6: Verify navigation was called
    const navigateCalls = (router.navigate as jasmine.Spy).calls;
    console.log('Navigate was called:', navigateCalls.count(), 'times');

    if (navigateCalls.count() === 0) {
      console.error('Navigation was not called! Order creation likely failed.');
      fail('Order was not created - navigation to order-confirmation did not occur');
      return;
    }

    const navigateArgs = navigateCalls.mostRecent().args;
    console.log('Navigate args:', navigateArgs);
    expect(navigateArgs[0][0]).toBe('/order-confirmation');

    createdOrderId = navigateArgs[0][1];
    expect(createdOrderId).toBeGreaterThan(0, 'Order ID should be positive');
    console.log('✓ Order created with ID:', createdOrderId);

    // Step 7: Verify order exists in database
    const rest_order = new Rest<Order, Order>(restService, 'order.php');
    const createdOrder = await rest_order.get(createdOrderId!);

    console.log('✓ Order retrieved from database');
    console.log('  Customer:', createdOrder.customer_name);
    console.log('  Email:', createdOrder.customer_email);
    console.log('  Total:', createdOrder.total_amount);

    expect(createdOrder).toBeTruthy('Order should exist in database');
    expect(createdOrder.customer_name).toBe('Test User Real Backend');
    expect(createdOrder.customer_email).toBe('spam@nextor.mx');
    expect(createdOrder.customer_phone).toBe('5551234567');
    expect(createdOrder.shipping_address).toBe('456 Real Street');
    expect(createdOrder.shipping_city).toBe('Real City');
    expect(createdOrder.shipping_state).toBe('Real State');
    expect(createdOrder.shipping_postal_code).toBe('54321');
    expect(createdOrder.shipping_country).toBe('Mexico');
    expect(createdOrder.notes).toBe('This is a test order with delivery notes from automated test');
    expect(createdOrder.total_amount).toBeGreaterThan(0);

    // Step 8: Verify order items
    const rest_order_item = new Rest<Order_Item, Order_Item>(restService, 'order_item.php');
    const orderItemsResponse: any = await rest_order_item.search({
      order_id: createdOrderId
    });

    console.log('✓ Order items:', orderItemsResponse.data.length);

    expect(orderItemsResponse.data.length).toBe(1);
    expect(orderItemsResponse.data[0].qty).toBe(2);
    expect(orderItemsResponse.data[0].ecommerce_item_id).toBe(testEcommerceItem.id);

    console.log('=== ✓ Real Order Creation Test PASSED ===');
  });

  it('should validate required fields', () => {
    component.order.customer_name = '';
    component.order.customer_email = 'test@test.com';
    component.order.customer_phone = '1234567890';

    spyOn(restService, 'showError');
    component.processCheckout();

    expect(restService.showError).toHaveBeenCalledWith('Por favor complete todos los campos obligatorios');
  });

  it('should validate shipping address', () => {
    component.order.customer_name = 'Test User';
    component.order.customer_email = 'test@test.com';
    component.order.customer_phone = '1234567890';
    component.order.shipping_address = '';

    spyOn(restService, 'showError');
    component.processCheckout();

    expect(restService.showError).toHaveBeenCalledWith('Por favor complete la dirección de envío completa');
  });
});

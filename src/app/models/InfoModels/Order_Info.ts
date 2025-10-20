import { Order } from '../RestModels/Order';
import { Order_Item_Info } from './Order_Item_Info';

export interface Order_Info {
  order: Order;
  order_items_info: Order_Item_Info[];
}

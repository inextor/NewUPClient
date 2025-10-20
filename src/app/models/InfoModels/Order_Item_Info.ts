import { Order_Item } from '../RestModels/Order_Item';
import { User_Order_Item } from '../RestModels/User_Order_Item';

export interface Order_Item_Info {
  order_item: Order_Item;
  user_order_items: User_Order_Item[];
}

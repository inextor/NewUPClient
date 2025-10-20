import { User_Order_Item } from '../RestModels/User_Order_Item';
import { User } from '../RestModels/User';
import { Order_Item } from '../RestModels/Order_Item';

export interface User_Order_Item_Info {
  user_order_item: User_Order_Item;
  user?: User;
  order_item?: Order_Item;
  ecommerce_item?: any;
  order?: any;
}

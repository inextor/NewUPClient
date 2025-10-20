import { account } from './Empties/Account';
import { ecommerce } from './Empties/Ecommerce';
import { ecommerce_item } from './Empties/Ecommerce_Item';
import { order } from './Empties/Order';
import { order_item } from './Empties/Order_Item';
import { pos_order } from './Empties/Pos_Order';
import { role } from './Empties/Role';
import { role_item } from './Empties/Role_Item';
import { role_ecommerce_item } from './Empties/Role_Ecommerce_Item';
import { role_user } from './Empties/Role_User';
import { session } from './Empties/Session';
import { transaction } from './Empties/Transaction';
import { user } from './Empties/User';
import { user_credentials } from './Empties/User_Credentials';
import { user_item } from './Empties/User_Item';
import { user_ecommerce_order_item } from './Empties/User_Ecommerce_Order_Item';

import { Account } from './RestModels/Account';
import { Ecommerce } from './RestModels/Ecommerce';
import { Ecommerce_Item } from './RestModels/Ecommerce_Item';
import { Order } from './RestModels/Order';
import { Order_Item } from './RestModels/Order_Item';
import { Pos_Order } from './RestModels/Pos_Order';
import { Role } from './RestModels/Role';
import { Role_Item } from './RestModels/Role_Item';
import { Role_Ecommerce_Item } from './RestModels/Role_Ecommerce_Item';
import { Role_User } from './RestModels/Role_User';
import { Session } from './RestModels/Session';
import { Transaction } from './RestModels/Transaction';
import { User } from './RestModels/User';
import { User_Credentials } from './RestModels/User_Credentials';
import { User_Item } from './RestModels/User_Item';
import { User_Ecommerce_Order_Item } from './RestModels/User_Ecommerce_Order_Item';

export class GetEmpty {
    static account(): Account {
        return account();
    }

    static ecommerce(): Ecommerce {
        return ecommerce();
    }

    static ecommerce_item(): Ecommerce_Item {
        return ecommerce_item();
    }

    static order(): Order {
        return order();
    }

    static order_item(): Order_Item {
        return order_item();
    }

    static pos_order(): Pos_Order {
        return pos_order();
    }

    static role(): Role {
        return role();
    }

    static role_item(): Role_Item {
        return role_item();
    }

    static role_ecommerce_item(): Role_Ecommerce_Item {
        return role_ecommerce_item();
    }

    static role_user(): Role_User {
        return role_user();
    }

    static session(): Session {
        return session();
    }

    static transaction(): Transaction {
        return transaction();
    }

    static user(): User {
        return user();
    }

    static user_credentials(): User_Credentials {
        return user_credentials();
    }

    static user_item(): User_Item {
        return user_item();
    }

    static user_ecommerce_order_item(): User_Ecommerce_Order_Item {
        return user_ecommerce_order_item();
    }
}

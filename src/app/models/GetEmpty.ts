import { account } from './Empties/Account';
import { ecommerce } from './Empties/Ecommerce';
import { pos_order } from './Empties/Pos_Order';
import { role } from './Empties/Role';
import { role_item } from './Empties/Role_Item';
import { session } from './Empties/Session';
import { transaction } from './Empties/Transaction';
import { user } from './Empties/User';
import { user_credentials } from './Empties/User_Credentials';
import { user_item } from './Empties/User_Item';
import { user_role } from './Empties/User_Role';

import { Account } from './RestModels/Account';
import { Ecommerce } from './RestModels/Ecommerce';
import { Pos_Order } from './RestModels/Pos_Order';
import { Role } from './RestModels/Role';
import { Role_Item } from './RestModels/Role_Item';
import { Session } from './RestModels/Session';
import { Transaction } from './RestModels/Transaction';
import { User } from './RestModels/User';
import { User_Credentials } from './RestModels/User_Credentials';
import { User_Item } from './RestModels/User_Item';
import { User_Role } from './RestModels/User_Role';

export class GetEmpty {
    static account(): Account {
        return account();
    }

    static ecommerce(): Ecommerce {
        return ecommerce();
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

    static user_role(): User_Role {
        return user_role();
    }
}
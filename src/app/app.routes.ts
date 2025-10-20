import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { ListUserComponent } from './pages/list-user/list-user.component';
import { ListRoleComponent } from './pages/list-role/list-role.component';
import { SaveRoleComponent } from './pages/save-role/save-role.component';
import { ListEcommerceItemComponent } from './pages/list-ecommerce-item/list-ecommerce-item.component';
import { ListRoleEcommerceItemComponent } from './pages/list-role-ecommerce-item/list-role-ecommerce-item.component';
import { ListRoleUserComponent } from './pages/list-role-user/list-role-user.component';
import { MainComponent } from './pages/main/main.component';
import { MainHomeComponent } from './pages/main-home/main-home.component';
import { CartComponent } from './pages/cart/cart.component';
import { SaveQuoteComponent } from './pages/save-quote/save-quote.component';
import { SaveUserComponent } from './pages/save-user/save-user.component';
import { ImportUsersComponent } from './pages/import-users/import-users.component';
import { SaveRoleEcommerceItemComponent } from './pages/save-role-ecommerce-item/save-role-ecommerce-item.component';
import { ListEcommerceItemRoleComponent } from './pages/list-ecommerce-item-role/list-ecommerce-item-role.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { SaveEcommerceItemComponent } from './pages/save-ecommerce-item/save-ecommerce-item.component';
import { ImportOrderComponent } from './pages/import-order/import-order.component';
import { ListOrderComponent } from './pages/list-order/list-order.component';
import { ViewOrderComponent } from './pages/view-order/view-order.component';
import { SaveCategoryComponent } from './pages/save-category/save-category.component';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'main-home', pathMatch: 'full' },
            { path: 'main-home', component: MainHomeComponent },
            { path: 'product-detail/:ecommerce_item_id', component: ProductDetailComponent },
            { path: 'list-user', component: ListUserComponent },
            { path: 'list-role', component: ListRoleComponent },
            { path: 'add-role', component: SaveRoleComponent },
            { path: 'edit-role/:id', component: SaveRoleComponent },
            { path: 'list-ecommerce-item', component: ListEcommerceItemComponent },
            { path: 'edit-ecommerce-item/:id', component: SaveEcommerceItemComponent },
            { path: 'list-role-ecommerce-item', component: ListRoleEcommerceItemComponent },
            { path: 'add-role-ecommerce-item', component: SaveRoleEcommerceItemComponent },
            { path: 'edit-role-ecommerce-item', component: SaveRoleEcommerceItemComponent },
            { path: 'list-ecommerce-item-role', component: ListEcommerceItemRoleComponent },
            { path: 'list-role-user', component: ListRoleUserComponent },
            { path: 'cart', component: CartComponent },
            { path: 'add-quote', component: SaveQuoteComponent },
            { path: 'edit-quote', component: SaveQuoteComponent },
            { path: 'add-user', component: SaveUserComponent },
            { path: 'edit-user', component: SaveUserComponent },
            { path: 'import-users', component: ImportUsersComponent },
            { path: 'import-order', component: ImportOrderComponent },
            { path: 'view-order/:id', component: ViewOrderComponent },
            { path: 'list-order', component: ListOrderComponent },
            { path: 'add-category', component: SaveCategoryComponent },
            { path: 'edit-category/:id', component: SaveCategoryComponent },
        ]
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'logout',
        component: LogoutComponent
    },
    { path: '**', redirectTo: '' }
];

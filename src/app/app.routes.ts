import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { ListUserComponent } from './pages/list-user/list-user.component';
import { ListRoleComponent } from './pages/list-role/list-role.component';
import { SaveRoleComponent } from './pages/save-role/save-role.component';
import { ListItemComponent } from './pages/list-item/list-item.component';
import { MainComponent } from './pages/main/main.component';
import { CartComponent } from './pages/cart/cart.component';
import { SaveQuoteComponent } from './pages/save-quote/save-quote.component';
import { SaveUserComponent } from './pages/save-user/save-user.component';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'list-user', pathMatch: 'full' },
            { path: 'list-user', component: ListUserComponent },
            { path: 'list-role', component: ListRoleComponent },
            { path: 'add-role', component: SaveRoleComponent },
            { path: 'edit-role/:id', component: SaveRoleComponent },
            { path: 'list-item', component: ListItemComponent },
            { path: 'cart', component: CartComponent },
            { path: 'save-quote', component: SaveQuoteComponent },
            { path: 'save-user', component: SaveUserComponent },
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

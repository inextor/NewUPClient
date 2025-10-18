import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { ListUserComponent } from './pages/list-user/list-user.component';
import { ListRoleComponent } from './pages/list-role/list-role.component';
import { SaveRoleComponent } from './pages/save-role/save-role.component';
import { ListItemComponent } from './pages/list-item/list-item.component';
import { ListRoleItemComponent } from './pages/list-role-item/list-role-item.component';
import { ListRoleUserComponent } from './pages/list-role-user/list-role-user.component';
import { MainComponent } from './pages/main/main.component';
import { MainHomeComponent } from './pages/main-home/main-home.component';
import { CartComponent } from './pages/cart/cart.component';
import { SaveQuoteComponent } from './pages/save-quote/save-quote.component';
import { SaveUserComponent } from './pages/save-user/save-user.component';
import { ImportUsersComponent } from './pages/import-users/import-users.component';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: MainComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'main-home', pathMatch: 'full' },
            { path: 'main-home', component: MainHomeComponent },
            { path: 'list-user', component: ListUserComponent },
            { path: 'list-role', component: ListRoleComponent },
            { path: 'add-role', component: SaveRoleComponent },
            { path: 'edit-role/:id', component: SaveRoleComponent },
            { path: 'list-item', component: ListItemComponent },
            { path: 'list-role-item', component: ListRoleItemComponent },
            { path: 'list-role-user', component: ListRoleUserComponent },
            { path: 'cart', component: CartComponent },
            { path: 'edit-quote', component: SaveQuoteComponent },
            { path: 'edit-user', component: SaveUserComponent },
            { path: 'import-users', component: ImportUsersComponent },
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

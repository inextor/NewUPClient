import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Role_User } from '../../models/RestModels/Role_User';
import { Role } from '../../models/RestModels/Role';
import { User } from '../../models/RestModels/User';
import { BaseComponent } from '../base/base.component';
import { Rest } from '../../classes/Rest';
import { SearchObject } from '../../classes/SearchObject';
import { ParamMap } from '@angular/router';
import { RestResponse } from '../../classes/RestResponse';
import { GetEmpty } from '../../models/GetEmpty';

interface CRoleUserInfo {
	role_user: Role_User;
	role: Role;
}

@Component({
  selector: 'app-list-role-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-role-user.component.html',
  styleUrl: './list-role-user.component.css'
})
export class ListRoleUserComponent extends BaseComponent implements OnInit {

  rest_role_user: Rest<Role_User,Role_User> = new Rest<Role_User,Role_User>(this.rest, 'role_user.php');
  rest_role: Rest<Role,Role> = new Rest<Role,Role>(this.rest, 'role.php');
  rest_user: Rest<User,User> = new Rest<User,User>(this.rest, 'user.php');

  role_user_list: Role_User[] = [];
  role_list: Role[] = [];
  user_id: number | null = null;
  user: User | null = null;

  added_role_list: CRoleUserInfo[] = [];

  showAddModal = false;
  newRoleName = '';
  isAdmin = false;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params:ParamMap) =>
    {
      let page = params.has('page') ? parseInt( params.get('page')! ) : 0;
      let limit = params.has('limit') ? parseInt( params.get('limit')! ) : 20;

      let url_params = this.rest_role_user.getUrlParams( params );

      // Store user_id if present
      if(params.has('user_id')) {
        this.user_id = parseInt(params.get('user_id')!);
      }

      Promise.all([
        this.user_id ? this.rest_user.get(this.user_id) : Promise.resolve(null),
        this.rest_role_user.search(url_params),
        this.rest_role.search({limit: 999999})
      ])
      .then(([user_info, role_user_response, role_response]) =>
      {
        this.user = user_info;
        this.role_user_list = role_user_response.data;
        this.role_list = role_response.data;

        this.added_role_list = this.role_user_list
        .map(role_user =>
        {
          let role = this.role_list.find(r => r.id === role_user.role_id) as Role;
          return {
            role_user: role_user,
            role: role
          }
        });
      })
      .catch((error:any) =>
      {
        this.rest.showError(error);
      });
    });
  }

  deleteRoleUser(crui: CRoleUserInfo): void {
    if(!confirm('¿Está seguro de eliminar este rol del usuario?')) {
      return;
    }

    this.rest_role_user.delete(crui.role_user.id)
      .then(() => {
        this.rest.showSuccess('Rol eliminado correctamente');
        this.added_role_list = this.added_role_list.filter(ru => ru.role_user.id !== crui.role_user.id);
      })
      .catch((error:any) => {
        this.rest.showError(error);
      });
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.newRoleName = '';
    this.isAdmin = false;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.newRoleName = '';
    this.isAdmin = false;
  }

  async addRoleToUser(): Promise<void> {
    if(!this.user_id) {
      this.rest.showError('No user ID provided');
      return;
    }

    if(!this.newRoleName.trim()) {
      this.rest.showError('El nombre del rol es requerido');
      return;
    }

    try {
      // Check if role exists
      let role = this.role_list.find(r => r.name === this.newRoleName);

      // If role doesn't exist, create it
      if(!role) {
        const newRole = GetEmpty.role();
        newRole.name = this.newRoleName as any;
        newRole.ecommerce_id = this.rest.ecommerce.id;
        role = await this.rest_role.create(newRole);
        this.role_list.push(role);
      }

      // Check if role is already assigned to this user
      const roleAlreadyAssigned = this.added_role_list.some(crui => crui.role.id === role!.id);
      if(roleAlreadyAssigned) {
        this.rest.showError('Este rol ya está asignado al usuario');
        return;
      }

      // Create role_user relationship
      const newRoleUser = GetEmpty.role_user();
      newRoleUser.user_id = this.user_id;
      newRoleUser.role_id = role.id;
      newRoleUser.is_admin = this.isAdmin;

      const createdRoleUser = await this.rest_role_user.create(newRoleUser);
      this.role_user_list.push(createdRoleUser);
      this.added_role_list.push
      ({
        role_user: createdRoleUser,
        role: role
      });

      this.rest.showSuccess('Rol agregado correctamente');
      this.closeAddModal();
    } catch(error) {
      this.rest.showError(error);
    }
  }
}
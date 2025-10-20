import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { ExcelUtils } from '../../classes/ExcelUtils';
import { Rest } from '../../classes/Rest';
import { User } from '../../models/RestModels/User';
import { Role_User } from '../../models/RestModels/Role_User';
import { GetEmpty } from '../../models/GetEmpty';

interface ImportedUser {
	codigo: string;
	nombre: string;
	username: string;
	password: string;
}

@Component({
	selector: 'app-import-users',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './import-users.component.html',
	styleUrl: './import-users.component.css'
})
export class ImportUsersComponent extends BaseComponent implements OnInit {

	rest_user: Rest<User, User> = new Rest<User, User>(this.rest, 'user.php');
	rest_role_user: Rest<Role_User, Role_User> = new Rest<Role_User, Role_User>(this.rest, 'role_user.php');

	// File upload
	selectedFile: File | null = null;

	// Admin roles
	adminRoles: any[] = [];
	selectedRoleId: number | null = null;

	// Parsed data
	importedUsers: ImportedUser[] = [];
	totalUsers: number = 0;

	// Import state
	isImporting: boolean = false;
	importResults: { created: number; updated: number; assigned: number } = { created: 0, updated: 0, assigned: 0 };

	ngOnInit(): void {
		// Load admin roles
		this.adminRoles = this.rest.admin_roles;

		// Pre-select role if only one admin role
		if (this.adminRoles.length === 1) {
			this.selectedRoleId = this.adminRoles[0].role.id;
		}
	}

	onFileSelected(event: any): void {
		const file: File = event.target.files[0];
		if (file) {
			this.selectedFile = file;
			this.parseExcel();
		}
	}

	async parseExcel(): Promise<void> {
		if (!this.selectedFile) return;

		try {
			// Get raw rows from Excel
			const rawData = await ExcelUtils.xlsx2RawRows(this.selectedFile);

			if (rawData.length < 2) {
				this.rest.showError('El archivo Excel debe tener al menos 2 filas (encabezado y datos)');
				return;
			}

			// Parse data rows (skip header)
			this.importedUsers = [];
			for (let i = 1; i < rawData.length; i++) {
				const row = rawData[i];
				const codigo = row[0]?.toString().trim() || '';
				const nombre = row[1]?.toString().trim() || '';
				const username = row[2]?.toString().trim() || '';
				const password = row[3]?.toString().trim() || '';

				if (!nombre) continue; // Skip empty rows

				this.importedUsers.push({
					codigo,
					nombre,
					username,
					password
				});
			}

			this.totalUsers = this.importedUsers.length;
			this.rest.showSuccess(`Archivo importado: ${this.totalUsers} usuarios`);

		} catch (error) {
			this.rest.showError(error);
		}
	}

	async importUsers(): Promise<void> {
		if (!this.selectedRoleId) {
			this.rest.showError('Debe seleccionar un rol');
			return;
		}

		if (this.importedUsers.length === 0) {
			this.rest.showError('No hay usuarios para importar');
			return;
		}

		this.isImporting = true;
		this.importResults = { created: 0, updated: 0, assigned: 0 };

		try {
			// Get all existing users by code to check duplicates
			const codes = this.importedUsers.map(u => u.codigo).filter(c => c);
			let existingUsers: User[] = [];

			if (codes.length > 0) {
				const response = await this.rest_user.search({ 'code,': codes, limit: 99999 });
				existingUsers = response.data;
			}

			// Create map of existing users by code
			const existingUserMap = new Map<string, User>();
			for (const user of existingUsers) {
				if (user.code) {
					existingUserMap.set(user.code, user);
				}
			}

			// Process each user
			for (const importedUser of this.importedUsers) {
				const existingUser = importedUser.codigo ? existingUserMap.get(importedUser.codigo) : null;

				if (existingUser) {
					// User exists - just assign to role if not already assigned
					await this.assignUserToRole(existingUser.id, this.selectedRoleId);
					this.importResults.assigned++;
				} else {
					// Create new user
					const newUser = GetEmpty.user();
					newUser.code = importedUser.codigo || null;
					newUser.name = importedUser.nombre;
					newUser.username = importedUser.username || null;
					newUser.password = importedUser.password || null;
					newUser.ecommerce_id = this.rest.ecommerce.id;
					newUser.type = 'USER';

					const createdUser = await this.rest_user.create(newUser);
					this.importResults.created++;

					// Assign to role
					await this.assignUserToRole(createdUser.id, this.selectedRoleId);
				}
			}

			this.rest.showSuccess(
				`Importación completada: ${this.importResults.created} creados, ${this.importResults.assigned} asignados al rol`
			);

			// Reset form
			this.selectedFile = null;
			this.importedUsers = [];
			this.totalUsers = 0;

		} catch (error) {
			this.rest.showError(error);
		} finally {
			this.isImporting = false;
		}
	}

	async assignUserToRole(user_id: number, role_id: number): Promise<void> {
		// Check if user is already in role
		const existingRoleUser = await this.rest_role_user.search({
			user_id: user_id,
			role_id: role_id,
			limit: 1
		});

		if (existingRoleUser.data.length === 0) {
			// Create role_user assignment
			const roleUser = GetEmpty.role_user();
			roleUser.user_id = user_id;
			roleUser.role_id = role_id;
			roleUser.is_admin = 0;

			await this.rest_role_user.create(roleUser);
		}
	}

	generateTemplate(): void {
		// Create Excel template with sample data
		const templateData = [
			{
				'Código': 'EMP001',
				'Nombre': 'Juan Pérez',
				'Username': 'jperez',
				'Password': 'password123'
			},
			{
				'Código': 'EMP002',
				'Nombre': 'María García',
				'Username': 'mgarcia',
				'Password': 'password456'
			}
		];

		const headers = ['Código', 'Nombre', 'Username', 'Password'];
		const filename = `plantilla_usuarios_${new Date().getTime()}.xlsx`;

		ExcelUtils.array2xlsx(templateData, filename, headers);
		this.rest.showSuccess('Plantilla generada exitosamente');
	}

	canImport(): boolean {
		return this.rest.canAddUsers();
	}
}

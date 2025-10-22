import { Component, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '../base/base.component';
import { ExcelUtils } from '../../classes/ExcelUtils';
import { ProductSizeRanges } from '../../classes/ProductSizeRanges';
import { Rest } from '../../classes/Rest';
import { RestResponse } from '../../classes/RestResponse';
import { User } from '../../models/RestModels/User';
import { Cart } from '../../models/RestModels/Cart';
import { Order } from '../../models/RestModels/Order';
import { Order_Item } from '../../models/RestModels/Order_Item';
import { Role } from '../../models/RestModels/Role';
import { Role_Ecommerce_Item } from '../../models/RestModels/Role_Ecommerce_Item';
import { Role_User } from '../../models/RestModels/Role_User';
import { GetEmpty } from '../../models/GetEmpty';
import { Order_Info } from '../../models/InfoModels/Order_Info';

interface ImportedRow {
	codigo_empleado: string;
	nombre: string;
	quantities: { [productCode: string]: number };
}

interface ProductSummary {
	code: string;
	base_code: string; // Product code without variation
	variation: string | null; // Variation (size, color, etc.)
	totalQty: number;
	ecommerce_item_id?: number;
	ecommerce_item?: any;
}

interface ValidationError {
	type: 'missing_user' | 'missing_product';
	code: string;
	name?: string;
}

@Component({
	selector: 'app-import-order',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './import-order.component.html',
	styleUrl: './import-order.component.css'
})
export class ImportOrderComponent extends BaseComponent {

	constructor(injector: Injector) {
		super(injector);
	}

	rest_user: Rest<User, User> = new Rest<User, User>(this.rest, 'user.php');
	rest_ecommerce_item: Rest<any, any> = new Rest<any, any>(this.rest, 'ecommerce_item.php');
	rest_cart: Rest<Cart, Cart> = new Rest<Cart, Cart>(this.rest, 'cart.php');
	rest_order: Rest<Order, Order> = new Rest<Order, Order>(this.rest, 'order.php');
	rest_order_item: Rest<Order_Item, Order_Item> = new Rest<Order_Item, Order_Item>(this.rest, 'order_item.php');
	rest_role: Rest<Role, Role> = new Rest<Role, Role>(this.rest, 'role.php');
	rest_role_ecommerce_item: Rest<Role_Ecommerce_Item, Role_Ecommerce_Item> = new Rest<Role_Ecommerce_Item, Role_Ecommerce_Item>(this.rest, 'role_ecommerce_item.php');
	rest_role_user: Rest<Role_User, Role_User> = new Rest<Role_User, Role_User>(this.rest, 'role_user.php');

	// File upload
	selectedFile: File | null = null;

	// Parsed data
	rawData: any[][] = [];
	productCodes: string[] = [];
	importedRows: ImportedRow[] = [];

	// Summary
	productSummary: ProductSummary[] = [];
	totalUsers: number = 0;

	// Validation
	validationErrors: ValidationError[] = [];
	createMissingUsers: boolean = false;
	isValidated: boolean = false;
	canSave: boolean = false;

	// Generated order structure
	order: Order | null = null;
	orderItems: Order_Item[] = [];

	// Template generation modal
	showTemplateModal: boolean = false;
	roleList: Role[] = [];
	selectedRoleId: number | null = null;
	templateUsers: User[] = [];
	templateEcommerceItems: any[] = [];
	isLoadingTemplate: boolean = false;

	// Note modal
	showNoteModalFlag: boolean = false;
	currentNote: string = '';

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
			this.rawData = await ExcelUtils.xlsx2RawRows(this.selectedFile);

			if (this.rawData.length < 2) {
				this.rest.showError('El archivo Excel debe tener al menos 2 filas (encabezado y datos)');
				return;
			}

			// First row is headers
			const headers = this.rawData[0];

			// Product codes start from column 3 (index 2)
			this.productCodes = headers.slice(2).filter(code => code && code.toString().trim() !== '');

			// Parse data rows
			this.importedRows = [];
			for (let i = 1; i < this.rawData.length; i++) {
				const row = this.rawData[i];
				const codigo_empleado = row[0]?.toString().trim() || '';
				const nombre = row[1]?.toString().trim() || '';

				if (!codigo_empleado) continue; // Skip empty rows

				const quantities: { [productCode: string]: number } = {};

				// Parse quantities for each product
				for (let j = 0; j < this.productCodes.length; j++) {
					const qty = parseFloat(row[j + 2]) || 0;
					if (qty > 0) {
						quantities[this.productCodes[j]] = qty;
					}
				}

				this.importedRows.push({
					codigo_empleado,
					nombre,
					quantities
				});
			}

			this.totalUsers = this.importedRows.length;
			this.calculateProductSummary();
			this.rest.showSuccess(`Archivo importado: ${this.totalUsers} usuarios, ${this.productCodes.length} productos`);

			// Automatically validate data after import
			await this.validateData();

		} catch (error) {
			this.rest.showError(error);
		}
	}

	calculateProductSummary(): void {
		const summary: { [code: string]: number } = {};

		for (const row of this.importedRows) {
			for (const [code, qty] of Object.entries(row.quantities)) {
				summary[code] = (summary[code] || 0) + qty;
			}
		}

		this.productSummary = Object.entries(summary).map(([code, totalQty]) => {
			const parsed = this.parseProductCode(code);
			return {
				code,
				base_code: parsed.base_code,
				variation: parsed.variation,
				totalQty
			};
		});
	}

	/**
	 * Parse product code to extract base code and variation
	 * Supports formats:
	 * - "PRODUCTO:M" → base: "PRODUCTO", variation: "M"
	 * - "#45:XL" → base: "#45", variation: "XL"
	 * - "CAM-001:L" → base: "CAM-001", variation: "L"
	 * - "PRODUCTO" → base: "PRODUCTO", variation: null
	 */
	parseProductCode(code: string): { base_code: string, variation: string | null } {
		const codeStr = String(code).trim();
		const colonIndex = codeStr.lastIndexOf(':');

		if (colonIndex > 0) {
			// Has variation
			return {
				base_code: codeStr.substring(0, colonIndex),
				variation: codeStr.substring(colonIndex + 1)
			};
		}

		// No variation
		return {
			base_code: codeStr,
			variation: null
		};
	}

	async validateData(): Promise<void> {
		this.validationErrors = [];
		this.isValidated = false;
		this.canSave = false;

		try {
			// Validate users
			// Separate user codes and IDs
			const userCodes: string[] = [];
			const userIds: number[] = [];

			for (const row of this.importedRows) {
				const code = row.codigo_empleado;
				if (code.startsWith('#')) {
					const id = parseInt(code.substring(1));
					if (!isNaN(id)) {
						userIds.push(id);
					}
				} else {
					userCodes.push(code);
				}
			}

			// Search by codes
			let existingUsers: User[] = [];
			if (userCodes.length > 0) {
				const usersResponse = await this.rest_user.search({ 'code,': userCodes, limit: 99999 });
				existingUsers = usersResponse.data;
			}

			// Search by IDs
			if (userIds.length > 0) {
				const usersResponse = await this.rest_user.search({ 'id,': userIds, limit: 99999 });
				existingUsers = [...existingUsers, ...usersResponse.data];
			}

			// Create lookup maps
			const existingUserCodes = new Map<string, User>();
			for (const user of existingUsers) {
				if (user.code) {
					existingUserCodes.set(user.code, user);
				}
				existingUserCodes.set(`#${user.id}`, user);
			}

			// Validate each user
			for (const row of this.importedRows) {
				if (!existingUserCodes.has(row.codigo_empleado)) {
					this.validationErrors.push({
						type: 'missing_user',
						code: row.codigo_empleado,
						name: row.nombre
					});
				}
			}

			// Validate products via ecommerce_item
			// Separate product codes and IDs (use base codes, ignoring variations)
			const itemCodes: string[] = [];
			const ecommerceItemIds: number[] = [];

			// Get unique base codes from productSummary
			const uniqueBaseCodes = new Set<string>();
			for (const product of this.productSummary) {
				uniqueBaseCodes.add(product.base_code);
			}

			for (const baseCode of uniqueBaseCodes) {
				if (baseCode.startsWith('#')) {
					const id = parseInt(baseCode.substring(1));
					if (!isNaN(id)) {
						ecommerceItemIds.push(id);
					}
				} else if (baseCode) {
					itemCodes.push(baseCode);
				}
			}

			console.log('Item codes to search:', itemCodes);
			console.log('Ecommerce Item IDs to search:', ecommerceItemIds);

			// Search ecommerce_items by item codes
			let ecommerceItems: any[] = [];
			if (itemCodes.length > 0) {
				const ecommerceItemsResponse = await this.rest_ecommerce_item.search({
					'code,': itemCodes,
					ecommerce_id: this.rest.ecommerce.id,
					limit: 99999
				});
				console.log('Ecommerce items found by code:', ecommerceItemsResponse.data);
				ecommerceItems = ecommerceItemsResponse.data;
			}

			// Search ecommerce_items by ecommerce_item.id
			if (ecommerceItemIds.length > 0) {
				const ecommerceItemsResponse = await this.rest_ecommerce_item.search({
					'id,': ecommerceItemIds,
					ecommerce_id: this.rest.ecommerce.id,
					limit: 99999
				});
				console.log('Ecommerce items found by id:', ecommerceItemsResponse.data);
				ecommerceItems = [...ecommerceItems, ...ecommerceItemsResponse.data];
			}

			// Create lookup map for items (by base code)
			const existingItemMap = new Map<string, any>();
			for (const ecomItem of ecommerceItems) {
				console.log('Processing ecommerce_item:', ecomItem);
				// Map by code if available
				if (ecomItem.code) {
					existingItemMap.set(ecomItem.code, ecomItem);
				}
				// Map by #ecommerce_item.id
				if (ecomItem.id) {
					existingItemMap.set(`#${ecomItem.id}`, ecomItem);
				}
			}

			console.log('Item map keys:', Array.from(existingItemMap.keys()));

			// Map items to product summary (use base_code for lookup)
			for (const summary of this.productSummary) {
				const ecomItem = existingItemMap.get(summary.base_code);
				if (ecomItem) {
					summary.ecommerce_item_id = ecomItem.id; // Store ecommerce_item.id
					summary.ecommerce_item = ecomItem;
				}
			}

			// Validate each product (check if base code exists)
			for (const summary of this.productSummary) {
				if (!existingItemMap.has(summary.base_code)) {
					this.validationErrors.push({
						type: 'missing_product',
						code: summary.code // Show full code with variation in error
					});
				}
			}

			this.isValidated = true;

			// Check if we can save
			const hasMissingUsers = this.validationErrors.some(e => e.type === 'missing_user');
			const hasMissingProducts = this.validationErrors.some(e => e.type === 'missing_product');

			if (hasMissingProducts) {
				this.canSave = false;
				this.rest.showError('Hay productos que no existen en el sistema');
			} else if (hasMissingUsers && !this.createMissingUsers) {
				this.canSave = false;
				this.rest.showError('Hay usuarios que no existen. Active "Crear usuarios faltantes" para continuar.');
			} else {
				this.canSave = true;
				this.generateOrderStructure();
				this.rest.showSuccess('Validación exitosa. Los datos están listos para guardar.');
			}

		} catch (error) {
			this.rest.showError(error);
		}
	}

	onCreateMissingUsersChange(): void {
		if (this.isValidated) {
			const hasMissingUsers = this.validationErrors.some(e => e.type === 'missing_user');
			const hasMissingProducts = this.validationErrors.some(e => e.type === 'missing_product');

			this.canSave = !hasMissingProducts && (!hasMissingUsers || this.createMissingUsers);

			if (this.canSave) {
				this.generateOrderStructure();
			}
		}
	}

	generateOrderStructure(): void {
		// Create order structure
		this.order = GetEmpty.order();
		this.order.ecommerce_id = this.rest.ecommerce.id;
		this.order.status = 'PENDING';
		this.order.order_date = new Date();
		this.order.created_by_user_id = this.rest.user.id;
		this.order.notes = `Imported from Excel: ${this.selectedFile?.name}`;

		// Create order items from product summary
		this.orderItems = this.productSummary
			.filter(p => p.ecommerce_item_id) // Only products that exist
			.map(p => {
				const orderItem = GetEmpty.order_item();
				orderItem.ecommerce_item_id = p.ecommerce_item_id!;
				orderItem.variation = p.variation; // Use variation from parsed code
				orderItem.qty = p.totalQty;
				orderItem.unit_price = null; // Will be set later if needed
				orderItem.notes = `Code: ${p.code}`;
				return orderItem;
			});
	}

	async addToCart(): Promise<void> {
		if (!this.canSave || !this.orderItems || this.orderItems.length === 0) {
			this.rest.showError('No hay items para agregar al carrito. Valide los datos primero.');
			return;
		}

		if (!this.rest.user?.id) {
			this.rest.showError('Debe iniciar sesión para agregar items al carrito.');
			return;
		}

		try {
			// Get existing cart items for the current user
			const cartResponse: RestResponse<Cart> = await this.rest_cart.search({
				user_id: this.rest.user.id
			});
			const existingCartItems = cartResponse.data || [];

			// Create a map of existing cart items by (ecommerce_item_id, variation)
			const cartMap = new Map<string, Cart>();
			existingCartItems.forEach(item => {
				const key = `${item.ecommerce_item_id}-${item.variation || ''}`;
				cartMap.set(key, item);
			});

			// Add or update cart items
			const promises: Promise<any>[] = [];

			for (const orderItem of this.orderItems) {
				const key = `${orderItem.ecommerce_item_id}-${orderItem.variation || ''}`;
				const existingItem = cartMap.get(key);

				if (existingItem) {
					// Update existing cart item
					existingItem.qty += orderItem.qty;
					promises.push(this.rest_cart.update(existingItem));
				} else {
					// Create new cart item
					const newCartItem: Cart = {
						id: 0,
						user_id: this.rest.user.id,
						ecommerce_item_id: orderItem.ecommerce_item_id,
						variation: orderItem.variation || 'unico',
						qty: orderItem.qty
					};
					promises.push(this.rest_cart.create(newCartItem));
				}
			}

			await Promise.all(promises);

			this.rest.showSuccess(`${this.orderItems.length} items agregados al carrito exitosamente`);

			// Navigate to cart
			this.router.navigate(['/cart']);

		} catch (error) {
			this.rest.showError(error);
		}
	}

	// Template generation methods
	async openTemplateModal(): Promise<void> {
		this.showTemplateModal = true;
		this.selectedRoleId = null;
		this.templateUsers = [];
		this.templateEcommerceItems = [];

		try {
			// Load roles
			const rolesResponse = await this.rest_role.search({ limit: 99999 });
			this.roleList = rolesResponse.data;
		} catch (error) {
			this.rest.showError(error);
		}
	}

	closeTemplateModal(): void {
		this.showTemplateModal = false;
		this.selectedRoleId = null;
		this.templateUsers = [];
		this.templateEcommerceItems = [];
	}

	async onRoleSelected(): Promise<void> {
		if (!this.selectedRoleId) {
			this.templateUsers = [];
			this.templateEcommerceItems = [];
			return;
		}

		this.isLoadingTemplate = true;

		try {
			// Load role users
			const roleUsersResponse = await this.rest_role_user.search({
				role_id: this.selectedRoleId,
				limit: 99999
			});
			const roleUsers = roleUsersResponse.data;

			// Get user IDs
			const userIds = roleUsers.map(ru => ru.user_id);

			// Load users
			if (userIds.length > 0) {
				const usersResponse = await this.rest_user.search({
					'id,': userIds,
					limit: 99999
				});
				this.templateUsers = usersResponse.data;
			} else {
				this.templateUsers = [];
			}

			// Load role ecommerce items
			const roleEcommerceItemsResponse = await this.rest_role_ecommerce_item.search({
				role_id: this.selectedRoleId,
				limit: 99999
			});
			const roleEcommerceItems = roleEcommerceItemsResponse.data;

			// Get ecommerce item IDs
			const ecommerceItemIds = roleEcommerceItems.map(rei => rei.ecommerce_item_id);

			// Load ecommerce items
			if (ecommerceItemIds.length > 0) {
				const ecommerceItemsResponse = await this.rest_ecommerce_item.search({
					'id,': ecommerceItemIds,
					limit: 99999
				});
				this.templateEcommerceItems = ecommerceItemsResponse.data;
			} else {
				this.templateEcommerceItems = [];
			}

			this.rest.showSuccess(`Cargados ${this.templateUsers.length} usuarios y ${this.templateEcommerceItems.length} items`);

		} catch (error) {
			this.rest.showError(error);
		} finally {
			this.isLoadingTemplate = false;
		}
	}

	generateTemplate(): void {
		if (!this.selectedRoleId || this.templateEcommerceItems.length === 0) {
			this.rest.showError('Debe seleccionar un rol con al menos un item');
			return;
		}

		// Build headers with variations based on size class
		const headers: string[] = ['Codigo Empleado', 'Nombre'];
		const productColumns: string[] = []; // Track all product columns for data generation

		this.templateEcommerceItems.forEach(ecommerceItem => {
			const baseCode = ecommerceItem.code || `#${ecommerceItem.id}`;
			const sizeClass = ecommerceItem.sizes;

			// Get variations based on size class
			let variations: string[] = [];
			switch (sizeClass) {
				case 'pantalon dama':
					variations = ProductSizeRanges.PANTALON_DAMA;
					break;
				case 'pantalon caballero':
					variations = ProductSizeRanges.PANTALON_CABALLERO;
					break;
				case 'camisa':
					variations = ProductSizeRanges.CAMISAS_CHALECOS_SUDADERAS_CHAMARRAS;
					break;
				case 'calzado':
					variations = ProductSizeRanges.CALZADO;
					break;
				case 'unico':
					variations = ['unico'];
					break;
				default:
					variations = ['unico'];
					break;
			}

			// Add column for each variation
			variations.forEach(variation => {
				const columnName = `${baseCode}:${variation}`;
				headers.push(columnName);
				productColumns.push(columnName);
			});
		});

		// Create array of objects (not 2D array)
		let excelData: any[] = [];
		if (this.templateUsers.length > 0) {
			excelData = this.templateUsers.map(user => {
				const row: any = {
					'Codigo Empleado': user.code || `#${user.id}`,
					'Nombre': user.name
				};
				// Add empty quantities for each product column
				productColumns.forEach(column => {
					row[column] = '';
				});
				return row;
			});
		} else {
			// Create one example row with empty values
			const row: any = {
				'Codigo Empleado': '',
				'Nombre': ''
			};
			productColumns.forEach(column => {
				row[column] = '';
			});
			excelData = [row];
		}

		// Convert to Excel
		const selectedRole = this.roleList.find(r => r.id === this.selectedRoleId);
		const roleName = (selectedRole?.name || 'template').substring(0, 20); // Limit to 20 chars to leave room for prefix
		const filename = `orden_${roleName}_${new Date().getTime()}.xlsx`;

		ExcelUtils.array2xlsx(excelData, filename, headers);

		this.rest.showSuccess('Plantilla de Excel generada exitosamente');
		this.closeTemplateModal();
	}

	// Note modal methods
	showNoteModal(note: string): void {
		this.currentNote = note;
		this.showNoteModalFlag = true;
	}

	closeNoteModal(): void {
		this.showNoteModalFlag = false;
		this.currentNote = '';
	}
}

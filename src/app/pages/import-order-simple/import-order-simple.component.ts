import { Component, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { ExcelUtils } from '../../classes/ExcelUtils';
import { ProductSizeRanges } from '../../classes/ProductSizeRanges';
import { Rest } from '../../classes/Rest';
import { RestResponse } from '../../classes/RestResponse';
import { Cart } from '../../models/RestModels/Cart';
import { Role } from '../../models/RestModels/Role';
import { Role_Ecommerce_Item } from '../../models/RestModels/Role_Ecommerce_Item';

interface ImportedRow {
	nombre: string;
	codigo: string;
	cantidad: number;
	base_code: string;
	variation: string | null;
	ecommerce_item_id?: number;
	ecommerce_item?: any;
}

interface ValidationError {
	type: 'missing_product';
	code: string;
	name: string;
}

@Component({
	selector: 'app-import-order-simple',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './import-order-simple.component.html',
	styleUrl: './import-order-simple.component.css'
})
export class ImportOrderSimpleComponent extends BaseComponent {

	constructor(injector: Injector) {
		super(injector);
	}

	rest_ecommerce_item: Rest<any, any> = new Rest<any, any>(this.rest, 'ecommerce_item.php');
	rest_cart: Rest<Cart, Cart> = new Rest<Cart, Cart>(this.rest, 'cart.php');
	rest_role: Rest<Role, Role> = new Rest<Role, Role>(this.rest, 'role.php');
	rest_role_ecommerce_item: Rest<Role_Ecommerce_Item, Role_Ecommerce_Item> = new Rest<Role_Ecommerce_Item, Role_Ecommerce_Item>(this.rest, 'role_ecommerce_item.php');

	// File upload
	selectedFile: File | null = null;

	// Parsed data
	importedRows: ImportedRow[] = [];

	// Validation
	validationErrors: ValidationError[] = [];
	isValidated: boolean = false;
	canSave: boolean = false;

	// Template generation modal
	showTemplateModal: boolean = false;
	roleList: Role[] = [];
	selectedRoleId: number | null = null;
	templateEcommerceItems: any[] = [];
	isLoadingTemplate: boolean = false;

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
			const rawData: any[][] = await ExcelUtils.xlsx2RawRows(this.selectedFile);

			if (rawData.length < 2) {
				this.rest.showError('El archivo Excel debe tener al menos 2 filas (encabezado y datos)');
				return;
			}

			// Parse data rows (skip header)
			this.importedRows = [];
			for (let i = 1; i < rawData.length; i++) {
				const row = rawData[i];
				const nombre = row[0]?.toString().trim() || '';
				const codigo = row[1]?.toString().trim() || '';
				const cantidad = parseFloat(row[2]) || 0;

				if (!codigo || cantidad <= 0) continue; // Skip invalid rows

				// Parse code to extract base code and variation
				const parsed = this.parseProductCode(codigo);

				this.importedRows.push({
					nombre,
					codigo,
					cantidad,
					base_code: parsed.base_code,
					variation: parsed.variation
				});
			}

			this.rest.showSuccess(`Archivo importado: ${this.importedRows.length} items`);

			// Automatically validate data after import
			await this.validateData();

		} catch (error) {
			this.rest.showError(error);
		}
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
			// Validate products via ecommerce_item
			// Separate product codes and IDs (use base codes, ignoring variations)
			const itemCodes: string[] = [];
			const ecommerceItemIds: number[] = [];

			// Get unique base codes
			const uniqueBaseCodes = new Set<string>();
			for (const row of this.importedRows) {
				uniqueBaseCodes.add(row.base_code);
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

			// Search ecommerce_items by item codes
			let ecommerceItems: any[] = [];
			if (itemCodes.length > 0) {
				const ecommerceItemsResponse = await this.rest_ecommerce_item.search({
					'code,': itemCodes,
					ecommerce_id: this.rest.ecommerce.id,
					limit: 99999
				});
				ecommerceItems = ecommerceItemsResponse.data;
			}

			// Search ecommerce_items by ecommerce_item.id
			if (ecommerceItemIds.length > 0) {
				const ecommerceItemsResponse = await this.rest_ecommerce_item.search({
					'id,': ecommerceItemIds,
					ecommerce_id: this.rest.ecommerce.id,
					limit: 99999
				});
				ecommerceItems = [...ecommerceItems, ...ecommerceItemsResponse.data];
			}

			// Create lookup map for items (by base code)
			const existingItemMap = new Map<string, any>();
			for (const ecomItem of ecommerceItems) {
				// Map by code if available
				if (ecomItem.code) {
					existingItemMap.set(ecomItem.code, ecomItem);
				}
				// Map by #ecommerce_item.id
				if (ecomItem.id) {
					existingItemMap.set(`#${ecomItem.id}`, ecomItem);
				}
			}

			// Map items to imported rows (use base_code for lookup)
			for (const row of this.importedRows) {
				const ecomItem = existingItemMap.get(row.base_code);
				if (ecomItem) {
					row.ecommerce_item_id = ecomItem.id;
					row.ecommerce_item = ecomItem;
				}
			}

			// Validate each product (check if base code exists)
			for (const row of this.importedRows) {
				if (!existingItemMap.has(row.base_code)) {
					this.validationErrors.push({
						type: 'missing_product',
						code: row.codigo,
						name: row.nombre
					});
				}
			}

			this.isValidated = true;

			// Check if we can save
			if (this.validationErrors.length > 0) {
				this.canSave = false;
				this.rest.showError('Hay productos que no existen en el sistema');
			} else {
				this.canSave = true;
				this.rest.showSuccess('Validación exitosa. Los datos están listos para agregar al carrito.');
			}

		} catch (error) {
			this.rest.showError(error);
		}
	}

	async addToCart(): Promise<void> {
		if (!this.canSave || !this.importedRows || this.importedRows.length === 0) {
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

			for (const row of this.importedRows) {
				if (!row.ecommerce_item_id) continue; // Skip invalid items

				const key = `${row.ecommerce_item_id}-${row.variation || ''}`;
				const existingItem = cartMap.get(key);

				if (existingItem) {
					// Update existing cart item
					existingItem.qty += row.cantidad;
					promises.push(this.rest_cart.update(existingItem));
				} else {
					// Create new cart item
					const newCartItem: Cart = {
						id: 0,
						user_id: this.rest.user.id,
						ecommerce_item_id: row.ecommerce_item_id,
						variation: row.variation || 'unico',
						qty: row.cantidad
					};
					promises.push(this.rest_cart.create(newCartItem));
				}
			}

			await Promise.all(promises);

			this.rest.showSuccess(`${this.importedRows.length} items agregados al carrito exitosamente`);

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
		this.templateEcommerceItems = [];
	}

	async onRoleSelected(): Promise<void> {
		if (!this.selectedRoleId) {
			this.templateEcommerceItems = [];
			return;
		}

		this.isLoadingTemplate = true;

		try {
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

			this.rest.showSuccess(`Cargados ${this.templateEcommerceItems.length} items`);

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

		// Build rows with variations based on size class
		const excelData: any[] = [];

		this.templateEcommerceItems.forEach(ecommerceItem => {
			const baseCode = ecommerceItem.code || `#${ecommerceItem.id}`;
			const sizeClass = ecommerceItem.sizes;
			const itemName = ecommerceItem.name;

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

			// Add row for each variation
			variations.forEach(variation => {
				excelData.push({
					'Nombre': itemName,
					'Código': `${baseCode}:${variation}`,
					'Cantidad': ''
				});
			});
		});

		// Convert to Excel
		const selectedRole = this.roleList.find(r => r.id === this.selectedRoleId);
		const roleName = (selectedRole?.name || 'template').substring(0, 20);
		const filename = `orden_simple_${roleName}_${new Date().getTime()}.xlsx`;

		const headers = ['Nombre', 'Código', 'Cantidad'];
		ExcelUtils.array2xlsx(excelData, filename, headers);

		this.rest.showSuccess('Plantilla de Excel generada exitosamente');
		this.closeTemplateModal();
	}
}

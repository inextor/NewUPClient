import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RestService } from '../../services/rest.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [FormsModule, CommonModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css'
})
export class LoginComponent {
	@ViewChild('helpModal') helpModal!: ElementRef<HTMLDialogElement>;

	username = '';
	password = '';

	constructor(private rest_service: RestService, private router: Router) {}

	async login() {
		const url = this.rest_service.base_url+'/login.php'; // Replace with your API URL

		try {
			let username = this.username;
			let password = this.password;

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			if (!response.ok) {
				// Handle non-2xx responses (e.g., 401 Unauthorized)
				const errorData = await response.json();
				throw new Error(errorData.error || 'Login failed');
			}

			const data = await response.json();

			// In a web app, localStorage or sessionStorage is common.
			localStorage.setItem('session', JSON.stringify(data.session));
			localStorage.setItem('user', JSON.stringify(data.user));
			localStorage.setItem('ecommerce', JSON.stringify(data.ecommerce));

			// Store roles_info if provided by backend
			if (data.roles_info) {
				localStorage.setItem('roles_info', JSON.stringify(data.roles_info));
			}

			this.rest_service.loadAuthDataFromLocalStorage();
			this.router.navigate(['/']);

		} catch (error) {
			this.rest_service.showError(error);
			// Here you would typically show an error message to the user.
			throw error;
		}
	}

	openHelpModal(event: Event) {
		event.preventDefault();
		if (this.helpModal) {
			this.helpModal.nativeElement.showModal();
		}
	}

	closeHelpModal() {
		if (this.helpModal) {
			this.helpModal.nativeElement.close();
		}
	}
}

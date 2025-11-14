import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RestService } from '../../services/rest.service';
import { Rest } from '../../classes/Rest';
import { Role } from '../../models/RestModels/Role';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  rest = inject(RestService);
  roles: Role[] = [];

  @ViewChild('helpModal') helpModal!: ElementRef<HTMLDialogElement>;

  private rest_role: Rest<Role, Role>;

  constructor() {
    this.rest_role = new Rest<Role, Role>(this.rest, 'role.php');
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.rest_role.search({ ecommerce_id: this.rest.ecommerce.id })
      .then(response => {
        this.roles = response.data || [];
      })
      .catch(error => {
        console.error('Error loading roles:', error);
      });
  }

  openHelpModal(): void {
    this.helpModal?.nativeElement.showModal();
  }

  closeHelpModal(): void {
    this.helpModal?.nativeElement.close();
  }
}

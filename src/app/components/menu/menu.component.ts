import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { RestService } from '../../services/rest.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit, OnDestroy {
  rest = inject(RestService);
  private router = inject(Router);
  private routerSubscription?: Subscription;

  // Track which section is currently open (only one at a time)
  openSection: string = 'home';

  ngOnInit() {
    // Subscribe to navigation events to close menu on route/query changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.rest.is_menu_open = false;
      });
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  toggleSection(section: string): void {
    // If clicking the same section, close it; otherwise open the new section
    this.openSection = this.openSection === section ? '' : section;
  }

  isSectionOpen(section: string): boolean {
    return this.openSection === section;
  }

  getTimestamp(): number {
    return Date.now();
  }
}

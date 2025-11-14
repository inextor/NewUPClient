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

  getTimestamp(): number {
    return Date.now();
  }
}

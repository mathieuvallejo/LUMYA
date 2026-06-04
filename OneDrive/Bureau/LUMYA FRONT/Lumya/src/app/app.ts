import { Component, signal, computed } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Navbar } from './shared/components/navbar/navbar';
import { SearchBar } from './shared/components/search-bar/search-bar';
import { UiStateService } from './core/services/ui-state.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SearchBar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Lumya');
  private onAuthRoute = signal(false);
  showNav = computed(() => !this.onAuthRoute() && !this.uiState.hideNav());

  constructor(router: Router, private uiState: UiStateService) {
    router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects ?? e.url;
      const hideOn = ['/login', '/register', '/themes'];
      this.onAuthRoute.set(hideOn.some(r => url.startsWith(r)));
    });
  }
}

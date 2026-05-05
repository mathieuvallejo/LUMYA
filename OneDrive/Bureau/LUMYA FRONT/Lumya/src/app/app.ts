import { Component, signal } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Navbar } from './shared/components/navbar/navbar';
import { SearchBar } from './shared/components/search-bar/search-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, SearchBar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Lumya');
  showNav = signal(false);

  constructor(router: Router) {
    router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects ?? e.url;
      const hideOn = ['/login', '/register'];
      this.showNav.set(!hideOn.some(r => url.startsWith(r)));
    });
  }
}

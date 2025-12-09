import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <img src="assets/logo.png" alt="Streamer Tracker Logo" class="logo-icon">
          <h1 class="app-title">Streamer Tracker 🌟</h1>
        </div>
        <nav class="nav">
          <button 
            class="nav-btn" 
            routerLink="/dashboard" 
            routerLinkActive="active"
            [routerLinkActiveOptions]="{exact: true}">
            📊 Dashboard
          </button>
          <button 
            class="nav-btn" 
            routerLink="/streamers" 
            routerLinkActive="active">
            👥 My Streamers
          </button>
        </nav>
      </div>
    </header>

    <div class="container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'Streamer Tracker';
}

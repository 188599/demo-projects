import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from './services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { TitleService } from './services/title.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-sidenav-container>
      <mat-sidenav mode="side"></mat-sidenav>

      <mat-sidenav-content>
        @if (loggedIn()) {
          <mat-toolbar class="mat-elevation-z8">
            <button mat-icon-button (click)="goBack()"><mat-icon>arrow_back</mat-icon></button>
            
            @if (title()) {
              <span>{{ title() }}</span>
            }

            <span class="spacer"></span>

            <button mat-icon-button>
              <mat-icon>notifications</mat-icon>
            </button>

            <a mat-icon-button routerLink="/account-settings">
              <mat-icon>account_circle</mat-icon>
            </a>

            <button mat-icon-button class="logout-button" (click)="logout()">
              <mat-icon>logout</mat-icon>
            </button>
          </mat-toolbar>
        }

        <router-outlet/>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    @use '@angular/material' as mat;

    $theme: mat.define-theme();

    .logout-button {
      @include mat.icon-color($theme, $color-variant: error);
    }
    
    mat-toolbar {
      z-index: 999;
      position: relative;
    }

    mat-sidenav-container {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }

    mat-sidenav-content {
      display: block;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
 `,
})
export class AppComponent {

  public loggedIn = this.authService.loggedIn;

  public title = this.titleService.title;

  constructor(
    private authService: AuthService,
    private titleService: TitleService,
    private router: Router,
    private location: Location
  ) { }

  public async logout() {
    this.authService.logout();

    await this.router.navigateByUrl('login');
  }

  public goBack() {
    this.location.back();
  }

}

import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from './services/auth.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterOutlet } from '@angular/router';
import { TitleService } from './services/title.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-sidenav-container>
      <mat-sidenav mode="side"></mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar class="mat-elevation-z8">
          @if (title()) {
            <span>{{title()}}</span>
          }

          @if (loggedIn()) {
            <span class="spacer"></span>

            <button mat-icon-button (click)="logout()">
              <mat-icon>logout</mat-icon>
            </button>
          }
          </mat-toolbar>

        <router-outlet/>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
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
    private router: Router
  ) { }

  public async logout() {
    this.authService.logout();

    await this.router.navigateByUrl('login');
  }

}

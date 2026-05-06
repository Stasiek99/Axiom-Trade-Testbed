import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { LangService } from './core/services/lang.service';
import type { Lang } from './core/i18n/translations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly lang = inject(LangService);

  setLang(lang: Lang): void {
    this.lang.setLang(lang);
  }
}

import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { WaveBackgroundComponent } from './shared/wave-background/wave-background.component';
import { LangService } from './core/services/lang.service';
import { BacktestStore } from './core/backtest/backtest.store';
import type { Lang } from './core/i18n/translations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatMenuModule, WaveBackgroundComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly lang          = inject(LangService);
  protected readonly backtestStore = inject(BacktestStore);

  private readonly bp = inject(BreakpointObserver);
  protected readonly isNarrow = toSignal(
    this.bp.observe('(max-width: 768px)').pipe(map(s => s.matches)),
    { initialValue: false }
  );

  setLang(lang: Lang): void {
    this.lang.setLang(lang);
  }
}

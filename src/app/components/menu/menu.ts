import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {ROUTE_PATH} from '../../app-routing.module';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Menu {
  router = inject(Router);
  readonly ROUTE_PATH = ROUTE_PATH;
}

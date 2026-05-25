import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.html',
  styleUrls: ['./button.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {

  @Input()
  disabled: boolean = false;

  @Input()
  type: string = 'button';
}

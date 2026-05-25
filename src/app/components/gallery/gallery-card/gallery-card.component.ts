import {Component, EventEmitter, Input, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Gallery} from "../../../data/galleries";

/**
 * Карточка работы в галерее
 */
@Component({
  selector: 'app-gallery-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery-card.component.html',
  styleUrls: ['./gallery-card.component.scss']
})
export class GalleryCardComponent {

  @Input()
  gallery: Gallery | null = null;

  @Input()
  modalShowMode: boolean = false;

  @Output()
  onShow = new EventEmitter<Gallery>();

  show(event: MouseEvent) {
    if (this.gallery && this.modalShowMode) {
      this.onShow.emit(this.gallery);
      // иначе, отработает переход по href на страницу работы
      event.preventDefault();
    }
  }
}

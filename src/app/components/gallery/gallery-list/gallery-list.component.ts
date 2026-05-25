import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Gallery} from "../../../data/galleries";
import {GalleryCardComponent} from "../gallery-card/gallery-card.component";
import {NgForOf} from "@angular/common";

/**
 * Компонент отвечает за отображение списка работ в галерее.
 * Самостоятельно не используется.
 * Создан, т.к. список галерей может быть нужен в нескольких разделах, например еще в профиле юзера.
 */
@Component({
  selector: 'app-gallery-list',
  standalone: true,
  templateUrl: './gallery-list.component.html',
  imports: [
    GalleryCardComponent,
    NgForOf
  ],
  styleUrls: ['./gallery-list.component.scss']
})
export class GalleryListComponent {
  @Input()
  galleries: Gallery[] = [];

  @Input()
  modalShowMode = false;

  @Output()
  onShow = new EventEmitter<Gallery>();

  onShowGallery(gallery: Gallery) {
    this.onShow.emit(gallery);
  }
}

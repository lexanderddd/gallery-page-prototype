import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute} from "@angular/router";
import {Gallery} from "../../../data/galleries";
import {SubscribeHandlerService} from "../../../services/subscribe-handler.service";
import {GalleryService} from "../../../services/api/gallery.service";
import {GalleryShowComponent} from "../gallery-show/gallery-show.component";

/**
  * Страница работы галереи открытая в отдельном окне,
  * например ссылку вставили в новой вкладе.
  */
@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, GalleryShowComponent],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private subscribeHandlerService = inject(SubscribeHandlerService);
  private galleryService = inject(GalleryService);

  slug: string | null = null;
  gallery: Gallery | null = null;

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug');

    if (this.slug) {
      this.getGallery(this.slug);
    }
  }

  private getGallery(slug: string) {
    this.subscribeHandlerService.takeOne(
      this.galleryService.getGallery(
        slug
      ), res => {
        this.gallery = res;
      }
    );
  }
}

import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Gallery} from "../../../data/galleries";
import {ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet} from "@angular/router";
import {SharedGalleriesDataService} from "../../../services/share/shared-galleries-data";
import {SubscribeHandlerService} from "../../../services/subscribe-handler.service";
import {GalleryShowComponent} from "../gallery-show/gallery-show.component";
import {ROUTE_PATH} from '../../../app-routing.module';
import {filter, Subject} from "rxjs";

/**
 * Отвечает за отображение модального окна
 */
@Component({
  selector: 'app-gallery-modal-show',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './gallery-modal-show.component.html',
  styleUrls: ['./gallery-modal-show.component.scss']
})
export class GalleryModalShowComponent implements OnInit, OnDestroy {

  @Input()
  gallery?: Gallery;

  @Input()
  galleries?: Gallery[];

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sharedGalleriesDataService = inject(SharedGalleriesDataService);
  private subscribeHandlerService = inject(SubscribeHandlerService);

  /**
   * Тут будет экземпляр компонента GalleryShowComponent после его активации в <router-outlet>
   * @private
   */
  private galleryShowComponent!: GalleryShowComponent;
  protected readonly ROUTE_PATH = ROUTE_PATH;

  private readonly unsubscriber = new Subject<void>();

  /**
   * map слаг "слаг галереи" => индекс в списке всех галерей
   */
  index: Record<string, number> = {};

  /**
   * Индекс галереи в массиве, которую отображем, предыдущая и следующая
   */
  currentIndex: number = 0;
  prevIndex: number | null = null;
  nextIndex: number | null = null;

  ngOnInit() {

    if (this.galleries) {
      this.galleries.forEach((gallery, i) => {
        this.index[gallery.slug] = i;
      });
    }


    if (this.gallery) {
      this.setCurrentIndex(this.index[this.gallery.slug]);
    }

    this.subscribeHandlerService.subjectSubscribe(this.router.events.pipe(filter(nav => nav instanceof NavigationEnd)), () => {

      /**
       * Нужно, чтобы отслеживать переход по истории в браузере
       */
      if (this.route.children[0]) {
        const slug = this.route.children[0].snapshot.paramMap.get(
          'slug'
        );

        if (slug && this.galleries) {
          this.gallery = this.galleries.find(it => slug === it.slug)
          this.galleries.forEach((gallery, i) => {
            if (gallery.slug === slug) {
              this.setCurrentIndex(i);
              this.setShowGallery();
            }
          });
        }
      }

    }, this.unsubscriber);
  }

  /**
   * К следующей работе
   */
  goNext() {
    if (this.galleries && this.currentIndex >= this.galleries.length - 1) {
      return;
    }

    if (this.nextIndex) {
      this.setCurrentIndex(this.nextIndex);
    }
    this.setShowGallery();
  }

  /**
   * К предыдущей работе
   */
  goPrev() {
    if (this.currentIndex === 0) {
      return;
    }

    if (this.prevIndex) {
      this.setCurrentIndex(this.prevIndex);
    }
    this.setShowGallery();
  }

  /**
   * Что отображаем сейчас
   * @param index
   * @private
   */
  private setCurrentIndex(index: number) {
    if (this.galleries) {
      this.gallery = this.galleries[index];
      this.currentIndex = index;

      this.nextIndex = this.galleries.length > this.currentIndex + 1 ? this.currentIndex + 1 : null;
      this.prevIndex = this.currentIndex > 0 ? this.currentIndex - 1 : null;
    }
  }

  /**
   * Когда router-outlet активирует компонент,
   * вызываем setGalleryShowComponent(...)
   * и передаем туда экземпляр созданного GalleryShowComponent.
   * Чтобы компонент отображения знал, что его открыли в модальном режиме.
   * @param component
   */
  setGalleryShowComponent(component: GalleryShowComponent) {
    this.galleryShowComponent = component;
    component.modalMode = true;
    this.setShowGallery();
  }

  setShowGallery() {

    // Может вызываться повторно, когда при навигации срабатывает также проверка
    // на изменение адреса, которая нужна при переходах по истории браузера.
    // Возможно еще какие-то кейсы с открытием и последующим переходам по истории/навигации могут всплыть.
    // Тут это разруливать проще и надёжнее.

    if (this.gallery && this.galleryShowComponent.gallery && this.galleryShowComponent.gallery.slug === this.gallery.slug) {
      return;
    }

    if (this.gallery) {
      // меняем галерею в компоненте отображения
      this.galleryShowComponent.setGalleryFromModalShow(this.gallery);
    }

    this.sharedGalleriesDataService.selectedGallery = this.gallery;
  }

  ngOnDestroy(): void {
    this.sharedGalleriesDataService.setShowMode(false);
    this.unsubscriber.next();

    const nav = this.router.getCurrentNavigation();
    const targetUrl = nav ? nav.extractedUrl.toString() : this.router.url;
    if (!targetUrl.includes(ROUTE_PATH.galleries)) {
      return;
    }

    if (!this.sharedGalleriesDataService.getCloseModalShowFromHistory()) {
      const path = this.sharedGalleriesDataService.getPathBeforeShowModal();
      if (path) {
        this.router.navigateByUrl(path).then();
      }
    } else {
      this.sharedGalleriesDataService.setCloseModalShowFromHistory(false);
    }
  }
}

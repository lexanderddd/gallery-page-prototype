

import {Component, inject, OnDestroy, OnInit, ViewContainerRef} from '@angular/core';
import {Gallery} from "../../../data/galleries";
import {GalleryService} from "../../../services/api/gallery.service";
import {GalleryListComponent} from "../gallery-list/gallery-list.component";
import {SharedGalleriesDataService} from "../../../services/share/shared-galleries-data";
import {ROUTE_PATH} from "../../../app-routing.module";
import {NavigationEnd, Router} from "@angular/router";
import {Location} from '@angular/common';
import {SubscribeHandlerService} from "../../../services/subscribe-handler.service";
import {filter, Subject} from "rxjs";
import {BackdropComponentService} from "../../../services/backdrop-component.service";
import {GalleryModalShowComponent} from "../gallery-modal-show/gallery-modal-show.component";

/**
 * Страница со списком работ в галерее
 */
@Component({
  selector: 'app-galleries',
  standalone: true,
  templateUrl: './galleries.component.html',
  imports: [
    GalleryListComponent,
  ],
  styleUrls: ['./galleries.component.scss']
})
export class GalleriesComponent implements OnInit, OnDestroy {

  private sharedGalleriesDataService = inject(SharedGalleriesDataService);
  private subscribeHandlerService = inject(SubscribeHandlerService);
  private backdropComponentService = inject(BackdropComponentService);
  private viewContainerRef = inject(ViewContainerRef);

  private router = inject(Router);
  locate = inject(Location);

  apiGalleriesService = inject(GalleryService);

  galleries: Gallery[] = [];

  // Не очевидная логика. Когда модальное окно закрывается по клику все, там нужно выставлять флаг modalShowMode=false
  // Но при закрытии перезагружать галереи не нужно, поэтому дополнительно добавлен флаг updateGalleriesWhenChangeUrl
  modalShowMode: boolean = false;
  updateGalleriesWhenChangeUrl = true;

  private readonly unsubscriber = new Subject<void>();

  ngOnInit() {

    this.sharedGalleriesDataService.setIsGalleriesPage(true);
    this.subscribeHandlerService.subjectSubscribe(this.sharedGalleriesDataService.showModalMode, modalShowMode => {

      if (modalShowMode) {
        // Открываем модальное окно
        this.updateGalleriesWhenChangeUrl = false;
      }

      this.modalShowMode = modalShowMode;
    }, this.unsubscriber);

    this.subscribeHandlerService.subjectSubscribe(
      this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      ),
      (event: NavigationEnd) => {

        /**
         * Закрытие/открытие модалки при переходах по истории в браузере
         */
        const path = event.urlAfterRedirects;
        if (!path.includes(ROUTE_PATH.galleriesShow)) {
          this.backdropComponentService.hideAndDestroyService();
        } else if (path.includes(ROUTE_PATH.galleriesShow) && !this.modalShowMode) {
          this.createBackdropShow();
        }

        /**
         * При переходе между работами в режиме просмотра обновлять не нужно
         */
        if (!this.modalShowMode) {
          if (this.updateGalleriesWhenChangeUrl) {
            this.getGalleries();
          } else {
            this.updateGalleriesWhenChangeUrl = true;
          }
        }
      }, this.unsubscriber);
    this.getGalleries();
  }

  getGalleries() {
    this.apiGalleriesService.getGalleries().subscribe((response: Gallery[]) => {
      this.galleries = response;
    });
  }

  onShowGallery(gallery: Gallery) {
    this.sharedGalleriesDataService.setPathBeforeShowModal(this.locate.path());
    this.sharedGalleriesDataService.selectedGallery = gallery;
    this.sharedGalleriesDataService.galleries = this.galleries;
    this.router.navigate([ROUTE_PATH.galleriesShow, gallery.slug]).then();
  }

  createBackdropShow() {
    this.sharedGalleriesDataService.setShowMode(true);
    this.sharedGalleriesDataService.setWindowScrollY(window.scrollY);

    const gallery = this.sharedGalleriesDataService.selectedGallery;
    const galleries = this.sharedGalleriesDataService.galleries;

    const insertComponent = this.viewContainerRef.createComponent(GalleryModalShowComponent);

    insertComponent.instance.gallery = gallery;
    insertComponent.instance.galleries = galleries;

    /**
     * Реализация backdropComponentService не наша, заимствовал.
     */
    this.backdropComponentService.createBackdropComponent(
      this.viewContainerRef,
      {
        inZIndex: 200,
        inTransparency: 75,
        screenStop: true,
        insertBackdropStyles: {
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          overflow: 'auto',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
        }
      },
      insertComponent
    );
  }

  ngOnDestroy(): void {
    this.unsubscriber.next();
    this.unsubscriber.complete();
    this.sharedGalleriesDataService.setIsGalleriesPage(false);
  }
}

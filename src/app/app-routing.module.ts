import {inject, NgModule} from '@angular/core';
import {CanMatchFn, RouterModule, Routes} from '@angular/router';
import {SharedGalleriesDataService} from "./services/share/shared-galleries-data";
import {take} from "rxjs";

export enum ROUTE_PATH {
  galleries = 'galleries',
  galleriesShow = 'galleries/gallery',
  models = 'models',
  modelsShow = 'models/show',
}

export const galleryModalGuard: CanMatchFn = (route, segments) => {
  const sharedGalleryDataService = inject(SharedGalleriesDataService);

  return sharedGalleryDataService.isGalleriesPage.pipe(
    take(1)
  );
};

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/main-page/main-page.component').then(c => c.MainPageComponent)
  },
  {
    path: ROUTE_PATH.models,
    loadComponent: () => import('./components/models/model-list/model-list.component').then(c => c.ModelListComponent)
  },
  {
    path: ROUTE_PATH.modelsShow + '/:slug',
    loadComponent: () =>
      import('./components/models/model-show/model-show.component').then(c => c.ModelShowComponent)
  },

  {
    path: ROUTE_PATH.galleries,
    loadComponent: () =>
      import('./components/gallery/galleries/galleries.component').then(c => c.GalleriesComponent),
    children: [
      {
        canMatch: [galleryModalGuard],
        path: 'gallery/:slug',
        loadComponent: () =>
          import('./components/gallery/gallery-show/gallery-show.component').then(c => c.GalleryShowComponent)
      },
    ]
  },
  /**
   * TODO: может это тоже запихнуть в children надо было
   */
  {
    path: ROUTE_PATH.galleriesShow + '/:slug',
    loadComponent: () =>
      import('./components/gallery/gallery/gallery.component').then(c => c.GalleryComponent)
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/err404/err404.component')
        .then(c => c.Err404Component),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environments';
import {GalleryModel} from "../../data/galleries";
import {Model, TypeSlug} from "../../data/models";


@Injectable({
  providedIn: 'root',
})
export class LabelsService {

  private http = inject(HttpClient)

  deleteGalleryModel(labelId: number) {
    return this.http.delete(environment.apiUrlLabels + '/' + labelId);
  }

  addGalleryModel(galleryModel: GalleryModel): Observable<GalleryModel> {
    return this.http.post<GalleryModel>(environment.apiUrlLabels, galleryModel);
  }

  getGalleryModels(slug: string): Observable<GalleryModel[]> {
    return this.http.get<GalleryModel[]>(environment.apiUrlLabels + '?gallery_slug=' + slug);
  }

  mapGalleryModelToModel(galleryModel: GalleryModel): Model {

    const model: Model = {
      title: galleryModel.title ?? '',
      title_en: galleryModel.title_en ?? '',
      comments_count: galleryModel.commentsCount ?? 0,
      votes_count: galleryModel.votesCount ?? 0,
      slug: galleryModel.slug ?? '',
      images: galleryModel.images ?? [],
      model_type: galleryModel.model_type ?? TypeSlug.FREE,
      is_bookmark: galleryModel.is_bookmark ?? false,
      is_purchase: galleryModel.is_purchase ?? false,
      isOwner: galleryModel.isOwner ?? false,
      properties: galleryModel.properties!,
    };

    return model;
  }
}

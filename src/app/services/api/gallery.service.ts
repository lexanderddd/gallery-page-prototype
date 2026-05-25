import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environments';
import {Gallery} from "../../data/galleries";

@Injectable({
  providedIn: 'root',
})
export class GalleryService {

  private http = inject(HttpClient)

  getGalleries(): Observable<Gallery[]> {
    return this.http.get<Gallery[]>(environment.apiUrlGalleries);
  }

  getGallery(slug: string) {
    return this.http.get<Gallery>(environment.apiUrlGalleries + '/' + slug);
  }
}

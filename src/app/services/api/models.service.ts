import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environments';
import {Model} from "../../data/models";

@Injectable({
  providedIn: 'root',
})
export class ModelsService {

  private http = inject(HttpClient)

  getModel(slug: string): Observable<Model> {
    return this.http.get<Model>(environment.apiUrlModels + '/' + slug);
  }

  getModels(): Observable<Model[]> {
    return this.http.get<Model[]>(environment.apiUrlModels);
  }
}

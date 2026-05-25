import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {Gallery} from "../../data/galleries";


@Injectable({
  providedIn: 'root'
})

export class SharedGalleriesDataService {

  selectedGallery?: Gallery = undefined;
  galleries?: Gallery[] = undefined;

  private windowScrollY: number = 0;

  private pathBeforeShowModal: string | null = null;

  // В galleries.component при обработке закрытия модального окна нужно знать было оно в результате перехода по истории
  // или при клике вне компонента
  private modalShowFromHistory = false;

  private showModalModeSource: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  readonly showModalMode = this.showModalModeSource.asObservable();

  private isGalleriesPageSource: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  readonly isGalleriesPage = this.isGalleriesPageSource.asObservable();

  setWindowScrollY(windowScrollY: number) {
    this.windowScrollY = windowScrollY;
  }

  getWindowScrollY() {
    return this.windowScrollY;
  }

  setPathBeforeShowModal(path: string) {
    this.pathBeforeShowModal = path;
  }

  getPathBeforeShowModal() {
    return this.pathBeforeShowModal;
  }

  setCloseModalShowFromHistory(modalShowFromHistory: boolean) {
    this.modalShowFromHistory = modalShowFromHistory;
  }

  getCloseModalShowFromHistory() {
    return this.modalShowFromHistory;
  }

  setShowMode(showMode: boolean) {
    this.showModalModeSource.next(showMode);
  }

  setIsGalleriesPage(isGalleriesPage: boolean) {
    this.isGalleriesPageSource.next(isGalleriesPage);
  }
}

import {Component, ElementRef, HostListener, inject, Input, OnInit, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Gallery, GalleryModel} from "../../../data/galleries";
import {Model} from "../../../data/models";
import {ModelsService} from "../../../services/api/models.service";
import {ROUTE_PATH} from "../../../app-routing.module";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {SubscribeHandlerService} from "../../../services/subscribe-handler.service";
import {LabelsService} from "../../../services/api/labels.service";
import {catchError, throwError} from "rxjs";
import {ModelCardComponent} from "../../models/model-card/model-card.component";
import {Button} from "../../button/button";

export interface PosXY {
  posX: number;
  posY: number;
  placement: 'left' | 'right';  // по умолчанию отображаем справа от бирки, если left - слева.
}

export interface ModelPreview extends PosXY {
  imageId: number;
  model?: Model | null;
  labelId: number;
}

export interface AddModelForm extends PosXY {
  markerPosX: number;
  markerPosY: number;
  imageId: number;
}

@Component({
  selector: 'app-gallery-show',
  standalone: true,
  imports: [CommonModule, ModelCardComponent, ReactiveFormsModule, Button],
  templateUrl: './gallery-show.component.html',
  styleUrls: ['./gallery-show.component.scss']
})
export class GalleryShowComponent implements OnInit {
  @Input()
  slug: string | undefined;

  @Input()
  gallery: Gallery | undefined;

  /**
   * Признак, что открыто из модального окна
   */
  @Input()
  modalMode: boolean = false;

  private modelsListService = inject(ModelsService);

  private readonly path = ROUTE_PATH;

  galleryModelsByGallery: Record<string, Record<number, GalleryModel[]>>  = {};

  /**
   * В панели инструментов выбран режим добавления моделей (бирок)
   */
  selectedAddModels: boolean = false;

  /**
   * После клика в режиме добавления бирки по картинке тут будет форма
   */
  addModelForm: AddModelForm | null = null;

  form = new FormGroup({
      modelUrl: new FormControl<string>(''),
      imageId: new FormControl<number>(0),
    }
  );

  private subscribeHandlerService = inject(SubscribeHandlerService);
  private labelsService = inject(LabelsService);

  @ViewChild('modelCard')
  modelCard!: ElementRef<HTMLInputElement>;

  @ViewChild('modelForm')
  modelForm!: ElementRef<HTMLInputElement>;

  /**
   * Тут будет выбранная бирка (модель) после клика по маркеру
   */
  modelPreview: ModelPreview | null =  null;

  addModelErrorMessage: string | null = null;

  ngOnInit() {
    if (!this.modalMode) {
      // В модальном окне getGalleryModels() вызывается явно
      this.getGalleryModels();
    }
  }

  /**
   * Переход в режим добавления бирок и выход из него
   * @param selected
   */
  setSelectedAddModels(selected: boolean) {
    this.selectedAddModels = selected;
  }

  deleteLabel(labelId: number, imageId: number) {
    this.subscribeHandlerService.takeOne(
      this.labelsService.deleteGalleryModel(labelId), res => {
        if (this.gallery) {
          this.galleryModelsByGallery[this.gallery.slug][imageId] = this.galleryModelsByGallery[this.gallery.slug][imageId].filter((item) => {return item.id !== labelId});
          this.modelPreview = null;
        }
      }
    );
  }

  addLabel(event: MouseEvent, imgPosition: number) {

    if (!this.addModelForm && !this.modelPreview) {
      event.stopPropagation();
    }

    // Проверка !this.gallery только для того чтобы не было ошибок в "strict": true
    if (!this.selectedAddModels || this.addModelForm || !this.gallery) {
      return;
    }
    const img = event.target as HTMLElement;
    const rect = img.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const imageId: number = this.gallery.images[imgPosition].id;

    const galleryModel: GalleryModel = {
      posX: x,
      posY: y,
      labelImageId: imageId
    };

    if (!this.galleryModelsByGallery[this.gallery.slug][imageId]) {
      this.galleryModelsByGallery[this.gallery.slug][imageId] = [];
    }

    this.galleryModelsByGallery[this.gallery.slug][imageId].push(galleryModel);

    this.createAddModelForm(rect, x, y, imageId);
  }

  createAddModelForm(rectImage: DOMRect, markerPosX: number, markerPosY: number, imageId: number) {

    const percentX = ((window.scrollX + rectImage.left + markerPosX + 36) / rectImage.width) * 100;

    const backdropElementScrollTop = this.modelForm.nativeElement.closest('.backdrop')?.scrollTop;

    const percentY = this.modalMode
      ? ((window.scrollY + rectImage.top + (backdropElementScrollTop ?? 0) + this.modelCard.nativeElement.scrollTop + markerPosY ) / rectImage.height) * 100
      : ((window.scrollY + rectImage.top + markerPosY ) / rectImage.height) * 100;


    const x = rectImage.width * (percentX / 100);
    const y = rectImage.height * (percentY / 100);

    this.addModelForm = {
      markerPosX: markerPosX,
      markerPosY: markerPosY,
      posX: x,
      posY: y,
      placement: (x - rectImage.left) > (rectImage.width / 2) ? 'left' : 'right',
      imageId: imageId,
    };
  }

  onSubmitAddModelForm() {
    const slug = this.form.controls.modelUrl.value?.split('/').pop()

    if (slug) {
      this.subscribeHandlerService.takeOne(this.modelsListService.getModel(slug).pipe(catchError(err => {
          this.addModelErrorMessage = 'Какая-то ошибка при добавлении';
          return throwError(err);
        })), res => {

          /**
           * TODO: Возможно лишнее
           */
          if (res) {
            const model = res;

            let newGalleryModel: GalleryModel | null = null;

            this.galleryModelsByGallery[this.gallery!.slug][this.addModelForm!.imageId].forEach((item, i) => {
              if (!item.id) {
                newGalleryModel = {
                  ...{'gallery_slug': this.gallery?.slug},
                  ...model,
                  ...this.galleryModelsByGallery[this.gallery!.slug][this.addModelForm!.imageId][i]
                };
              }
            });

            if (newGalleryModel) {
              this.subscribeHandlerService.takeOne(
                this.labelsService.addGalleryModel(
                  newGalleryModel
                ), res => {
                  if (res && this.addModelForm) {

                    this.galleryModelsByGallery[this.gallery!.slug][this.addModelForm!.imageId].forEach((item, i) => {
                      if (!item.id) {
                        this.galleryModelsByGallery[this.gallery!.slug][this.addModelForm!.imageId][i] = res;
                      }
                    });

                    this.modelPreview = {
                      imageId: this.addModelForm.imageId,
                      posX: this.addModelForm.posX,
                      posY: this.addModelForm.posY,
                      placement: this.addModelForm.placement,
                      model: this.labelsService.mapGalleryModelToModel(model),
                      labelId: res.id!,
                    }

                    this.addModelForm = null;
                    this.setSelectedAddModels(false);
                  }
                }
              );
            }

          }
        }
      );
    }
  }

  showModel(event: MouseEvent, model: GalleryModel) {
    /**
     * Иначе сразу закроем в onDocumentClick()
     */
    event.stopPropagation();

    /**
     * Повторным кликом по маркеру, закрываем
     */
    if (this.modelPreview && this.modelPreview.model && model.slug === this.modelPreview.model.slug) {
      this.modelPreview = null;
      return;
    }

    const img = event.target as HTMLElement;

    const parentElement = img.parentElement;
    const parentParentElement = img.parentElement?.parentElement;

    if (!parentElement || !parentParentElement) {
      // для "strict": true
      return;
    }

    const rectImage = parentParentElement.getBoundingClientRect();
    const rectMarker = parentElement.getBoundingClientRect();

    const percentX = ((window.scrollX + rectMarker.left   + 36) / rectImage.width) * 100;

    const backdropElementScrollTop = this.modelCard.nativeElement.closest('.backdrop')?.scrollTop;

    const percentY = this.modalMode
      ? ((window.scrollY + (backdropElementScrollTop ?? 0) + this.modelCard.nativeElement.scrollTop + rectMarker.top ) / rectImage.height) * 100
      : ((window.scrollY + rectMarker.top ) / rectImage.height) * 100;


    const x = rectImage.width * (percentX / 100);
    const y = rectImage.height * (percentY / 100);

    this.modelPreview = {
      imageId: model.labelImageId ?? 0,
      posX: x,
      posY: y,
      placement: (x - rectImage.left) > (rectImage.width / 2) ? 'left' : 'right',
      model: this.labelsService.mapGalleryModelToModel(model),
      labelId: model.id ?? 0
    }
  }

  closeAddModelForm() {

    if (!this.gallery || !this.addModelForm) {
      // "strict": true
      return;
    }

    this.galleryModelsByGallery[this.gallery.slug][this.addModelForm.imageId].pop();
    this.addModelForm = null;
    this.selectedAddModels = false;
  }

  /**
   * Скрываем карточку модели/добавления модели если клик не на ней.
   * @param event
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.modelPreview) {

      const clickedInside =
        this.modelCard?.nativeElement.contains(event.target as Node);

      if (!clickedInside) {
        this.modelPreview = null;
      }
    }

    if (this.addModelForm) {
      const clickedInside =
        this.modelForm?.nativeElement.contains(event.target as Node);

      if (!clickedInside) {
        this.closeAddModelForm();
      }
    }
  }

  /**
   * Ручка, которую дергает модальное окно, при переходах между работами
   * @param gallery
   */
  setGalleryFromModalShow(gallery: Gallery) {
    this.gallery = gallery;
    this.slug = gallery.slug;
    this.getGalleryModels();
  }

  /**
   * Модели (бирки) в галерее
   */
  getGalleryModels() {

    if (this.slug) {

      /**
       * TODO:
       * Тут будет какое-то кеширование, чтобы не грузить уже загруженные работы, когда листаем вперёд/назад
       */
      /*if (this.galleryModelsByGallery[this.slug]) {
        return this.galleryModelsByGallery[this.slug];
      }*/

      this.subscribeHandlerService.takeOne(
        this.labelsService.getGalleryModels(this.slug), res => {

          if (this.slug && !this.galleryModelsByGallery[this.slug]) {
            this.galleryModelsByGallery[this.slug] = {};
          }

          res.forEach((model, i) => {

            if (this.slug && model.labelImageId && !this.galleryModelsByGallery[this.slug][model.labelImageId]) {
              this.galleryModelsByGallery[this.slug][model.labelImageId] = [];
            }

            if (this.slug && model.labelImageId) {
              this.galleryModelsByGallery[this.slug][model.labelImageId].push(model);
            }
          })
        }
      );
    }
  }
}

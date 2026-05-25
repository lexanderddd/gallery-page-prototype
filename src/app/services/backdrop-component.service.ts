import {ComponentRef, Injectable, ViewContainerRef} from '@angular/core';

import {Subject} from 'rxjs';
import {BackdropComponent} from "../components/backdrop/backdrop.component";

export interface MainParams {
  inZIndex?: number;
  inTransparency?: number;
  screenStop?: boolean;
  animationIn?: string;
  animationOut?: string;
  insertBackdropStyles?: Partial<CSSStyleDeclaration>;
  showCloseBtn?: boolean;
  closeOnBackgroundClick?: boolean;
}


/**
 * Не наше творчество, заимствовал.
 */
@Injectable({
  providedIn: 'root'
})
export class BackdropComponentService {
  private backdropComponentClosed: Subject<boolean> = new Subject<boolean>();
  private insertComponentsArray: ComponentRef<any>[] = [];
  private mainParams: MainParams = {
    inZIndex: 80,
    inTransparency: 30,
    animationIn: '100ms ease-in',
    animationOut: '100ms ease-out',
    screenStop: false,
    showCloseBtn: false,
    closeOnBackgroundClick: true
  };
  public backdropComponent: ComponentRef<BackdropComponent> | undefined = undefined;

  createBackdropComponent(

    viewContainerRef: ViewContainerRef,
    insertMainParams?: MainParams,
    insertComponent?: any,
    insertTemplate?: any,
    insertHtml?: HTMLElement) {

    if (insertMainParams) {
      this.mainParams = {...this.mainParams, ...insertMainParams};
    }
    let backdropStyles: Partial<CSSStyleDeclaration> = {
      backgroundColor: `rgba(0, 0, 0, ${(this.mainParams.inTransparency || 0) / 100})`,
      zIndex: this.mainParams.inZIndex?.toString()
    };
    if (insertMainParams?.insertBackdropStyles) {
      backdropStyles = {...backdropStyles, ...insertMainParams.insertBackdropStyles};
    }
    if (this.mainParams.screenStop) {
      this.windowScreenStopService(true);
      backdropStyles.overscrollBehavior = 'none';
    }
    this.backdropComponent = viewContainerRef.createComponent(BackdropComponent);
    this.backdropComponent.instance.mainParams = this.mainParams;
    this.backdropComponent.instance.backdropStylesInsert = backdropStyles;
    if (insertComponent !== undefined) {
      this.backdropComponent.instance.insertComponent(insertComponent);
      this.insertComponentsArray.push(insertComponent);
    }
    if (insertTemplate !== undefined) {
      this.backdropComponent.instance.insertTemplate(insertTemplate);
    }

    if (insertHtml) {
      this.backdropComponent.location.nativeElement.appendChild(insertHtml);
    }
  }

  windowScreenStopService(set: boolean) {
    if (set) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  hideAndDestroyService() {
    this.backdropComponent?.instance.hideAndDestroy();
  }

  backdrop() {
    this.backdropComponentClosed.next(true);
    if (this.insertComponentsArray.length) {
      this.insertComponentsArray.forEach(comp => comp.destroy());
      this.insertComponentsArray = [];
    }
    if (this.backdropComponent) {
      this.backdropComponent.destroy();
      this.backdropComponent = undefined;
    }
    this.windowScreenStopService(false);
  }
}

import {Component, ComponentRef, ElementRef, TemplateRef, Type, ViewChild, ViewContainerRef} from '@angular/core';
import {AnimationEvent, trigger} from '@angular/animations';
import {CommonModule} from '@angular/common';
import {animate, state, style, transition} from '@angular/animations';
import {BackdropComponentService, MainParams} from "../../services/backdrop-component.service";

export const popupAnimation = [
  state('closed', style({opacity: 0})),
  state('open', style({opacity: 1})),
  transition('* => closed', [
    animate('{{ animationOut }}', style({opacity: 0}))
  ]),
  transition('closed => open', [
    animate('{{ animationIn }}', style({opacity: 1}))
  ]),
  transition(':enter', [
    style({opacity: 0}),
    animate('{{ animationIn }}', style({opacity: 1}))
  ])
];

/**
 * Не наше творчество, заимствовал.
 * Нужен для BackdropComponentService
 */
@Component({
  selector: 'app-backdrop',
  templateUrl: './backdrop.component.html',
  styleUrls: ['./backdrop.component.scss'],
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('fadeInOut', popupAnimation)
  ]
})
export class BackdropComponent {
  backdropStylesInsert: Partial<CSSStyleDeclaration> = {};
  mainParams: MainParams ={};
  state: string | undefined = undefined;

  @ViewChild('backdrop', {static: false}) backdrop!: ElementRef;
  @ViewChild('insertElement', {read: ViewContainerRef, static: true}) insertElement!: ViewContainerRef;

  constructor(public viewContainerRef: ViewContainerRef,
              public backdropComponentService: BackdropComponentService) { }

  insertTemplate(template: TemplateRef<any>) {
    const view = this.viewContainerRef.createEmbeddedView(template);
    this.insertElement.insert(view);
  }

  insertComponent(comp: ComponentRef<any>) {
    this.insertElement.insert(comp.hostView);
  }

  onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'closed') {
      this.backdropComponentService.backdrop();
    }
  }

  hideAndDestroy() {
    this.state = 'closed';
  }

  onClick(event: Event) {
    if (!this.mainParams.closeOnBackgroundClick || event.target !== this.backdrop.nativeElement || !event.target) {
      return;
    }
    this.hideAndDestroy();
  }

// ------------------------
  createInnerComponent(component: Type<any>) {
    return this.insertElement.createComponent(component);
  }
}

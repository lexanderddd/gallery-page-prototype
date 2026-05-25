import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Model} from "../../../data/models";
import {RouterLink} from "@angular/router";
import {ROUTE_PATH} from "../../../app-routing.module";

@Component({
  selector: 'app-model-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './model-card.component.html',
  styleUrls: ['./model-card.component.scss']
})
export class ModelCardComponent {

  @Input()
  model?: Model;
  protected readonly ROUTE_PATH = ROUTE_PATH;
}

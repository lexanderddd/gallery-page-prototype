import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ModelsService} from "../../../services/api/models.service";
import {Model} from "../../../data/models";
import {ModelCardComponent} from "../model-card/model-card.component";

@Component({
  selector: 'app-model-list',
  standalone: true,
  imports: [CommonModule, ModelCardComponent],
  templateUrl: './model-list.component.html',
  styleUrls: ['./model-list.component.scss']
})
export class ModelListComponent implements OnInit {

  models: Model[] = [];

  modelsService = inject(ModelsService);

  ngOnInit() {
    this.getModels();
  }

  getModels() {
    this.modelsService.getModels().subscribe((res: Model[]) => {
      this.models = res;
    });
  }
}

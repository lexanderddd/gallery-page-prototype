import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute} from "@angular/router";
import {SubscribeHandlerService} from "../../../services/subscribe-handler.service";
import {ModelsService} from "../../../services/api/models.service";
import {Model} from "../../../data/models";

@Component({
  selector: 'app-model-show',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-show.component.html',
  styleUrls: ['./model-show.component.scss']
})
export class ModelShowComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private subscribeHandlerService = inject(SubscribeHandlerService);
  private modelService = inject(ModelsService);

  slug: string | null = null;
  model: Model | null = null;
  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug');

    if (this.slug) {
      this.getModel(this.slug);
    }
  }

  private getModel(slug: string) {
    this.subscribeHandlerService.takeOne(
      this.modelService.getModel(
        slug
      ), res => {
        this.model = res;
      }
    );
  }
}

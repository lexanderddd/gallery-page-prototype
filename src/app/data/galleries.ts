import {ModelImage, ModelProperties, TypeSlug} from "./models";

interface GalleryImage {
  id: number;
  webPath: string;
}

export interface Gallery {
  slug: string;
  title: string;
  description: string;
  labels: boolean;
  votesCount: number;
  viewsCount: number;
  commentsCount: number;
  image: string;
  images: GalleryImage[];
  is_bookmark: boolean;
  is_award: boolean;
  is_mountain: boolean;
  created_at: string;
  timeLeft?: number;
  isLike?: boolean;
  user?: {
    username: string,
    slug: string
  }
}

export interface GalleryModel {
  slug?: string;
  title?: string;
  title_en?: string;
  model_type?: TypeSlug;
  is_bookmark?: boolean;
  is_purchase?: boolean;
  isOwner?: boolean;
  labels?: boolean;
  votesCount?: number;
  viewsCount?: number;
  commentsCount?: number;
  images?: ModelImage[];
  labelImageId?: number;
  posX?: number;
  posY?: number;
  properties?: ModelProperties;
  id?: number;  // Это label.id
}

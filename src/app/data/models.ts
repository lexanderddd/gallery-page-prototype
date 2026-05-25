export enum TypeSlug {
  PRO = 'pro',
  OM = 'om',
  FREE = 'free'
}

export interface ModelImage {
  id?: number;
  file_name?: string;
  web_path: string;
  sort: number;
}

export interface Category<T> {
  id: number;
  parent_id: T;
  title: string;
  title_en: string;
  slug: string;
}

export interface ModelProperties {
  platform: { title?: string, titleEn?: string };
  render: { title?: string };
  polygons?: number;
  size_kb?: number;
  length?: number;
  width?: number;
  height?: number;
  is_created_with_ai: boolean;
}

export interface Model {
  title: string;
  title_en: string;
  comments_count: number;
  votes_count: number;
  model_type: TypeSlug;
  slug: string;
  images: ModelImage[];
  is_bookmark: boolean;
  is_purchase: boolean;
  isOwner: boolean;
  is_first?: boolean;
  category_parent?: Category<null>;
  category?: Category<number>;
  price?: number;
  price_usd?: number;
  properties: ModelProperties;
}

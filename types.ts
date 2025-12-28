
export interface Language {
  code: string;
  name: string;
}

export interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: number;
}

export enum TranslationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type AppTab = 'translate' | 'image';

export interface ImageStyle {
  id: string;
  label: string;
  promptSuffix: string;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3';

export type BackgroundType = 'default' | 'none' | 'white' | 'nature' | 'studio' | 'city';

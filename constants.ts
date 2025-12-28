
import { Language, ImageStyle } from './types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ru', name: 'Russian' },
];

export const IMAGE_STYLES: ImageStyle[] = [
  { id: 'realistic', label: 'Realistic', promptSuffix: 'highly detailed, photorealistic, 8k, masterwork, sharp focus' },
  { id: 'diagram', label: 'Diagram', promptSuffix: 'clean technical diagram, schematic, vector style, educational illustration' },
  { id: '3d', label: '3D Render', promptSuffix: 'unreal engine 5 render, octane render, volumetric lighting, high quality 3d, stylized' },
  { id: 'cinematic', label: 'Cinematic', promptSuffix: 'movie scene, dramatic lighting, anamorphic, color graded, epic scale' },
  { id: 'anime', label: 'Anime', promptSuffix: 'studio ghibli style, vibrant colors, clean lines, high quality anime art' },
  { id: 'sketch', label: 'Sketch', promptSuffix: 'charcoal sketch, hand drawn, artistic, textured paper' }
];

export const BACKGROUND_OPTIONS = [
  { id: 'default', label: 'Auto (Recommended)', suffix: '' },
  { id: 'none', label: 'No Background (Isolated)', suffix: 'isolated on a clean, solid flat background, cutout style, no environment' },
  { id: 'white', label: 'Pure White', suffix: 'on a solid pure white background' },
  { id: 'nature', label: 'Nature', suffix: 'with a beautiful natural landscape background, trees and sky' },
  { id: 'studio', label: 'Studio', suffix: 'in a professional studio setting with soft lighting' },
  { id: 'city', label: 'Cityscape', suffix: 'with a blurry urban city background' }
];

export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3'];

export const WORD_LIMIT = 1200;

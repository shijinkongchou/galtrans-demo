import type { SpriteInfo } from './types';

export interface ImageFile {
  name: string;
  path: string;
}

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif'];

const COMMON_SEPARATORS = ['_', '-', ' ', '.'];

export function detectSprites(files: ImageFile[]): SpriteInfo[] {
  const imageFiles = files.filter(f => isImageFile(f.name));

  if (imageFiles.length === 0) {
    return [];
  }

  const groups = new Map<string, Set<string>>();

  for (const file of imageFiles) {
    const baseName = getBaseName(file.name);
    const { prefix, expression } = splitSpriteName(baseName);

    if (!prefix) {
      continue;
    }

    if (!groups.has(prefix)) {
      groups.set(prefix, new Set());
    }

    if (expression) {
      groups.get(prefix)!.add(expression);
    }
  }

  const result: SpriteInfo[] = [];

  for (const [name, expressions] of groups) {
    if (expressions.size >= 1) {
      result.push({
        name,
        expressions: Array.from(expressions).sort()
      });
    }
  }

  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

export function isImageFile(filename: string): boolean {
  const ext = getExtension(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

function getBaseName(filename: string): string {
  const ext = getExtension(filename);
  return ext ? filename.slice(0, -ext.length) : filename;
}

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx) : '';
}

function splitSpriteName(name: string): { prefix: string; expression: string } {
  for (const sep of COMMON_SEPARATORS) {
    const parts = name.split(sep);
    if (parts.length >= 2) {
      const prefix = parts[0];
      const expression = parts.slice(1).join(sep);
      if (prefix && expression && /^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(prefix)) {
        return { prefix, expression };
      }
    }
  }

  const match = name.match(/^([a-zA-Z0-9\u4e00-\u9fa5]+)([A-Z].*)$/);
  if (match) {
    return { prefix: match[1], expression: match[2] };
  }

  if (name.length > 3) {
    const mid = Math.floor(name.length / 2);
    return { prefix: name.slice(0, mid), expression: name.slice(mid) };
  }

  return { prefix: name, expression: 'default' };
}

export function groupSpritesByDirectory(files: ImageFile[]): Map<string, SpriteInfo[]> {
  const dirMap = new Map<string, ImageFile[]>();

  for (const file of files) {
    const dir = getDirectory(file.path);
    if (!dirMap.has(dir)) {
      dirMap.set(dir, []);
    }
    dirMap.get(dir)!.push(file);
  }

  const result = new Map<string, SpriteInfo[]>();
  for (const [dir, dirFiles] of dirMap) {
    result.set(dir, detectSprites(dirFiles));
  }

  return result;
}

function getDirectory(path: string): string {
  const idx = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  return idx >= 0 ? path.slice(0, idx) : '';
}

export function detectBackgrounds(files: ImageFile[]): string[] {
  const imageFiles = files.filter(f => isImageFile(f.name));
  const backgrounds: string[] = [];

  const bgKeywords = ['bg', 'background', '背景', 'scene'];

  for (const file of imageFiles) {
    const name = file.name.toLowerCase();
    if (bgKeywords.some(keyword => name.includes(keyword))) {
      backgrounds.push(file.name);
    }
  }

  return backgrounds.sort();
}

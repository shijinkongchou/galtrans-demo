export interface EngineDetectionResult {
  engine: string;
  confidence: number;
  reasons: string[];
}

export interface FileInfo {
  name: string;
  path: string;
  content?: string;
}

const RENPY_EXTENSIONS = ['.rpy', '.rpyc'];
const KIRIKIRI_EXTENSIONS = ['.ks', '.tjs'];
const KIRIKIRI_PACKAGE_EXTENSIONS = ['.xp3'];
const KIRIKIRI_PLUGIN_EXTENSIONS = ['.dll'];
const ONSCRIPTER_SIGNATURES = [
  '*define',
  '*title',
  '*start',
  'bg ',
  'play ',
  'jump ',
  'gosub '
];

export function detectEngine(files: FileInfo[]): EngineDetectionResult {
  const results: { engine: string; count: number; reasons: string[] }[] = [];

  results.push(detectRenpy(files));
  results.push(detectKiriKiri(files));
  results.push(detectONScripter(files));

  results.sort((a, b) => b.count - a.count);

  const totalFiles = files.length;
  const best = results[0];

  if (totalFiles === 0) {
    return {
      engine: 'unknown',
      confidence: 0,
      reasons: ['没有可检测的文件']
    };
  }

  const confidence = Math.min(100, Math.round((best.count / totalFiles) * 100));

  if (confidence < 10) {
    return {
      engine: 'generic',
      confidence: 50,
      reasons: ['未检测到明确的引擎特征，使用通用模式']
    };
  }

  return {
    engine: best.engine,
    confidence,
    reasons: best.reasons
  };
}

function detectRenpy(files: FileInfo[]): { engine: string; count: number; reasons: string[] } {
  let count = 0;
  const reasons: string[] = [];

  for (const file of files) {
    const ext = getExtension(file.name).toLowerCase();
    if (RENPY_EXTENSIONS.includes(ext)) {
      count++;
    }
  }

  if (count > 0) {
    reasons.push(`检测到 ${count} 个 Ren'Py 脚本文件 (.rpy)`);
  }

  for (const file of files) {
    if (file.content && file.content.includes('label ') && file.content.includes(':')) {
      if (getExtension(file.name).toLowerCase() === '.rpy') {
        reasons.push(`文件 ${file.name} 包含 label 定义，符合 Ren'Py 语法特征`);
        break;
      }
    }
  }

  return { engine: 'renpy', count, reasons };
}

function detectKiriKiri(files: FileInfo[]): { engine: string; count: number; reasons: string[] } {
  let count = 0;
  const reasons: string[] = [];
  let hasPackages = false;

  for (const file of files) {
    const ext = getExtension(file.name).toLowerCase();
    if (KIRIKIRI_EXTENSIONS.includes(ext)) {
      count++;
    } else if (KIRIKIRI_PACKAGE_EXTENSIONS.includes(ext)) {
      hasPackages = true;
      count += 0.5;
    } else if (KIRIKIRI_PLUGIN_EXTENSIONS.includes(ext)) {
      const fileNameLower = file.name.toLowerCase();
      if (fileNameLower.includes('kag') || fileNameLower.includes('kirikiri') || fileNameLower.includes('krkr')) {
        count += 0.5;
      }
    }
  }

  if (hasPackages) {
    const packageCount = files.filter(f => KIRIKIRI_PACKAGE_EXTENSIONS.includes(getExtension(f.name).toLowerCase())).length;
    reasons.push(`检测到 ${packageCount} 个 KiriKiri 封包文件 (.xp3)`);
    reasons.push('⚠️ 注意：封包文件无法直接读取，需要先使用工具解压');
  }

  if (count > 0) {
    const scriptCount = files.filter(f => KIRIKIRI_EXTENSIONS.includes(getExtension(f.name).toLowerCase())).length;
    if (scriptCount > 0) {
      reasons.push(`检测到 ${scriptCount} 个 KiriKiri 脚本文件 (.ks/.tjs)`);
    }
  }

  for (const file of files) {
    if (file.content && file.content.includes('[label]') && file.content.includes('@')) {
      if (getExtension(file.name).toLowerCase() === '.ks') {
        reasons.push(`文件 ${file.name} 包含 KAG 标签语法，符合 KiriKiri 特征`);
        break;
      }
    }
  }

  return { engine: 'kirikiri', count, reasons };
}

function detectONScripter(files: FileInfo[]): { engine: string; count: number; reasons: string[] } {
  let count = 0;
  const reasons: string[] = [];

  const txtFiles = files.filter(f => getExtension(f.name).toLowerCase() === '.txt');

  for (const file of txtFiles) {
    if (!file.content) continue;

    let signatureCount = 0;
    for (const sig of ONSCRIPTER_SIGNATURES) {
      if (file.content.includes(sig)) {
        signatureCount++;
      }
    }

    if (signatureCount >= 3) {
      count++;
      reasons.push(`文件 ${file.name} 包含 ${signatureCount} 个 ONScripter 特征指令`);
    }
  }

  if (count > 0) {
    reasons.push(`检测到 ${count} 个 ONScripter 脚本文件`);
  }

  return { engine: 'onscripter', count, reasons };
}

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx) : '';
}

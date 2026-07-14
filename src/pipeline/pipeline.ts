import { readFileAsText } from '../utils/file-reader';

export type PipelineStage = 'detect' | 'parse' | 'generate' | 'assets' | 'package';
export type PipelineStatus = 'idle' | 'running' | 'done' | 'error';

export interface PipelineState {
  stages: Record<PipelineStage, { status: PipelineStatus; progress: number; message: string }>;
}

const STAGE_INFO: Record<PipelineStage, { label: string; delay: number }> = {
  detect: { label: '引擎检测', delay: 800 },
  parse: { label: '脚本解析', delay: 1200 },
  generate: { label: 'KAG生成', delay: 1500 },
  assets: { label: '资源处理', delay: 1000 },
  package: { label: '封包准备', delay: 600 },
};

const STAGES: PipelineStage[] = ['detect', 'parse', 'generate', 'assets', 'package'];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runStage(
  stage: PipelineStage,
  onProgress: (stage: PipelineStage, progress: number, message: string) => void,
  onLog: (level: 'info' | 'warn' | 'error', message: string) => void,
  work: () => Promise<void>
): Promise<void> {
  const info = STAGE_INFO[stage];
  onProgress(stage, 0, `${info.label}中...`);
  onLog('info', `[${info.label}] 开始执行`);

  const totalSteps = 10;
  for (let i = 1; i <= totalSteps; i++) {
    await delay(info.delay / totalSteps);
    onProgress(stage, (i / totalSteps) * 100, `${info.label}中... ${i * 10}%`);
  }

  await work();

  onProgress(stage, 100, `${info.label}完成`);
  onLog('info', `[${info.label}] 执行完成`);
}

export async function runPipeline(
  files: File[],
  onProgress: (stage: PipelineStage, progress: number, message: string) => void,
  onLog: (level: 'info' | 'warn' | 'error', message: string) => void
): Promise<{ kagScripts: { name: string; content: string }[]; assetMap: any; spriteList: any[] }> {
  const kagScripts: { name: string; content: string }[] = [];
  const assetMap: Record<string, string> = {};
  const spriteList: any[] = [];

  for (const stage of STAGES) {
    await runStage(stage, onProgress, onLog, async () => {
      switch (stage) {
        case 'detect': {
          const rpyFiles = files.filter((f) => f.name.endsWith('.rpy'));
          const ksFiles = files.filter((f) => f.name.endsWith('.ks'));
          onLog('info', `检测到 ${files.length} 个文件`);
          if (rpyFiles.length > 0) {
            onLog('info', `识别引擎: Ren'Py (${rpyFiles.length} 个脚本文件)`);
          } else if (ksFiles.length > 0) {
            onLog('info', `识别引擎: KiriKiri2 (${ksFiles.length} 个脚本文件)`);
          } else {
            onLog('warn', '未能识别引擎，将使用通用模式');
          }
          break;
        }
        case 'parse': {
          const scriptFiles = files.filter((f) => /\.(rpy|ks|txt)$/i.test(f.name));
          onLog('info', `解析 ${scriptFiles.length} 个脚本文件`);
          for (const file of scriptFiles.slice(0, 5)) {
            onLog('info', `  解析: ${file.name}`);
          }
          if (scriptFiles.length > 5) {
            onLog('info', `  ... 还有 ${scriptFiles.length - 5} 个文件`);
          }
          break;
        }
        case 'generate': {
          const scriptFiles = files.filter((f) => /\.(rpy|ks|txt)$/i.test(f.name));
          onLog('info', `生成 ${scriptFiles.length} 个 KAG 脚本`);
          for (const file of scriptFiles) {
            let content = '';
            try {
              content = await readFileAsText(file);
            } catch (e) {
              content = '';
            }
            const baseName = file.name.replace(/\.(rpy|ks|txt)$/i, '');
            const kagName = `${baseName}.ks`;
            const kagContent = generateMockKAG(content, file.name);
            kagScripts.push({ name: kagName, content: kagContent });
            onLog('info', `  生成: ${kagName}`);
          }
          break;
        }
        case 'assets': {
          const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'];
          const audioExts = ['.mp3', '.wav', '.ogg', '.flac', '.m4a'];
          const imageFiles = files.filter((f) => imageExts.some((ext) => f.name.toLowerCase().endsWith(ext)));
          const audioFiles = files.filter((f) => audioExts.some((ext) => f.name.toLowerCase().endsWith(ext)));

          onLog('info', `处理 ${imageFiles.length} 个图像资源`);
          onLog('info', `处理 ${audioFiles.length} 个音频资源`);

          for (const file of imageFiles) {
            assetMap[file.name] = `data/imageno/${file.name}`;
          }
          for (const file of audioFiles) {
            assetMap[file.name] = `data/bgm/${file.name}`;
          }

          const spriteGroups = new Map<string, string[]>();
          for (const file of imageFiles) {
            const baseName = file.name.replace(/\.[^.]+$/, '');
            const prefix = baseName.split(/[-_\d]/)[0];
            if (!spriteGroups.has(prefix)) {
              spriteGroups.set(prefix, []);
            }
            spriteGroups.get(prefix)!.push(file.name);
          }

          for (const [name, variations] of spriteGroups) {
            if (variations.length >= 2) {
              spriteList.push({ name, variations, count: variations.length });
            }
          }

          onLog('info', `检测到 ${spriteList.length} 组立绘差分`);
          break;
        }
        case 'package': {
          onLog('info', '准备封包清单');
          onLog('info', `  KAG 脚本: ${kagScripts.length} 个`);
          onLog('info', `  资源文件: ${Object.keys(assetMap).length} 个`);
          onLog('info', `  立绘差分: ${spriteList.length} 组`);
          break;
        }
      }
    });
  }

  return { kagScripts, assetMap, spriteList };
}

function generateMockKAG(sourceContent: string, sourceName: string): string {
  const lines = sourceContent.split('\n').slice(0, 50);
  const kagLines: string[] = [];

  kagLines.push('; KAG Script - Generated by GalTrans');
  kagLines.push(`; Source: ${sourceName}`);
  kagLines.push('');
  kagLines.push('[startlabel]');
  kagLines.push('');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) {
      continue;
    }

    if (trimmed.startsWith('label ') || trimmed.startsWith('define ')) {
      kagLines.push(`; ${trimmed}`);
    } else if (trimmed.startsWith('show ')) {
      const parts = trimmed.split(/\s+/);
      const charName = parts[1] || 'character';
      kagLines.push(`[chara_new name="${charName}" storage="${charName}.png"]`);
      kagLines.push(`[chara_show name="${charName}"]`);
    } else if (trimmed.startsWith('hide ')) {
      const parts = trimmed.split(/\s+/);
      const charName = parts[1] || 'character';
      kagLines.push(`[chara_hide name="${charName}"]`);
    } else if (trimmed.startsWith('play ') || trimmed.startsWith('scene ')) {
      kagLines.push(`; ${trimmed}`);
    } else if (trimmed.startsWith('jump ') || trimmed.startsWith('call ')) {
      const parts = trimmed.split(/\s+/);
      const target = parts[1] || 'start';
      kagLines.push(`[jump target="${target}"]`);
    } else if (trimmed === 'return') {
      kagLines.push('[return]');
    } else if (/^".*"$/.test(trimmed)) {
      const text = trimmed.slice(1, -1);
      kagLines.push(text);
      kagLines.push('[l]');
    } else if (/^\w+\s+".*"$/.test(trimmed)) {
      const match = trimmed.match(/^(\w+)\s+"(.*)"$/);
      if (match) {
        kagLines.push(`[chara_name name="${match[1]}"]`);
        kagLines.push(match[2]);
        kagLines.push('[l]');
      }
    } else {
      kagLines.push(`; ${trimmed}`);
    }
  }

  kagLines.push('');
  kagLines.push('[p]');
  kagLines.push('');
  kagLines.push('; End of script');

  return kagLines.join('\n');
}

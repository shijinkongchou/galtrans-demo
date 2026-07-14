import { useCallback, useRef } from 'react';
import { useAppContext } from '../store/AppContext';
import { buildFileTree, readFileAsText } from '../utils/file-reader';
import { detectEngine } from '../engine/detector';
import { detectSprites, isImageFile } from '../engine/sprite-detector';
import type { FileInfo } from '../engine/detector';

const SCRIPT_EXTENSIONS = ['.rpy', '.rpyc', '.ks', '.tjs', '.txt'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.wma', '.aac'];

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx).toLowerCase() : '';
}

function isScriptFile(filename: string): boolean {
  return SCRIPT_EXTENSIONS.includes(getExtension(filename));
}

function isAudioFile(filename: string): boolean {
  return AUDIO_EXTENSIONS.includes(getExtension(filename));
}

export interface FileStats {
  script: number;
  sprite: number;
  audio: number;
  total: number;
}

export function calculateFileStats(files: File[]): FileStats {
  let script = 0;
  let sprite = 0;
  let audio = 0;

  for (const file of files) {
    if (isScriptFile(file.name)) {
      script++;
    } else if (isImageFile(file.name)) {
      sprite++;
    } else if (isAudioFile(file.name)) {
      audio++;
    }
  }

  return {
    script,
    sprite,
    audio,
    total: files.length,
  };
}

async function detectEngineFromFiles(files: File[]) {
  const scriptFiles = files.filter((f) => isScriptFile(f.name));
  const fileInfos: FileInfo[] = [];

  const sampleFiles = scriptFiles.slice(0, 5);
  for (const file of sampleFiles) {
    try {
      const content = await readFileAsText(file);
      const filePath = (file as any).webkitRelativePath || file.name;
      fileInfos.push({
        name: file.name,
        path: filePath,
        content,
      });
    } catch {
      const filePath = (file as any).webkitRelativePath || file.name;
      fileInfos.push({
        name: file.name,
        path: filePath,
      });
    }
  }

  if (fileInfos.length === 0) {
    for (const file of files.slice(0, 10)) {
      const filePath = (file as any).webkitRelativePath || file.name;
      fileInfos.push({
        name: file.name,
        path: filePath,
      });
    }
  }

  return detectEngine(fileInfos);
}

export function useFileImport() {
  const {
    setFiles,
    setFileTree,
    setEngine,
    setSpriteList,
    resetAll,
    addLog,
  } = useAppContext();

  const dragCounter = useRef(0);

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;

      resetAll();

      setFiles(files);

      const tree = buildFileTree(files);
      setFileTree(tree);

      const imageFiles = files
        .filter((f) => isImageFile(f.name))
        .map((f) => ({
          name: f.name,
          path: (f as any).webkitRelativePath || f.name,
        }));
      const sprites = detectSprites(imageFiles);
      setSpriteList(sprites);

      addLog('info', `已导入 ${files.length} 个文件`);

      const hasPackages = files.some(f => f.name.toLowerCase().endsWith('.xp3'));
      const hasScripts = files.some(f => isScriptFile(f.name));

      if (hasPackages && !hasScripts) {
        addLog('warn', '⚠️ 检测到 KiriKiri 封包文件 (.xp3)，但未找到解压后的脚本文件');
        addLog('warn', '请先使用 XP3 解压工具（如 Kirikiri Tools）解压封包');
        addLog('warn', '解压后将包含脚本的文件夹拖入即可进行转换');
      } else if (!hasScripts) {
        addLog('warn', '⚠️ 未检测到可识别的脚本文件');
        addLog('info', '支持的脚本格式: .rpy (Ren\'Py), .ks/.tjs (KiriKiri), .txt (ONScripter)');
      }

      const engineResult = await detectEngineFromFiles(files);
      setEngine(engineResult.engine, engineResult.confidence, engineResult.reasons);

      if (engineResult.reasons.length > 0) {
        for (const reason of engineResult.reasons) {
          addLog('info', reason);
        }
      }
    },
    [setFiles, setFileTree, setEngine, setSpriteList, resetAll, addLog]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await handleFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
      }
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        await handleFiles(e.target.files);
        e.target.value = '';
      }
    },
    [handleFiles]
  );

  const openFileDialog = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    (input as any).webkitdirectory = true;
    (input as any).directory = true;
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        await handleFiles(target.files);
      }
    };
    input.click();
  }, [handleFiles]);

  const openFileDialogSingle = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        await handleFiles(target.files);
      }
    };
    input.click();
  }, [handleFiles]);

  return {
    handleFiles,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileInput,
    openFileDialog,
    openFileDialogSingle,
  };
}

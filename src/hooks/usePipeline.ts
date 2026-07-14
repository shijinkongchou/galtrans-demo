import { useCallback, useRef } from 'react';
import { useAppContext } from '../store/AppContext';
import { runPipeline } from '../pipeline/pipeline';
import type { PipelineStage } from '../pipeline/pipeline';
import { detectSprites } from '../engine/sprite-detector';

export function usePipeline() {
  const {
    state,
    updatePipelineStage,
    addLog,
    setKagScripts,
    setAssetMap,
    setSpriteList,
    setOutputTab,
    resetAll,
  } = useAppContext();

  const isRunningRef = useRef(false);

  const isRunning = state.pipelineState.stages.detect.status === 'running' ||
    state.pipelineState.stages.parse.status === 'running' ||
    state.pipelineState.stages.generate.status === 'running' ||
    state.pipelineState.stages.assets.status === 'running' ||
    state.pipelineState.stages.package.status === 'running';

  const startPipeline = useCallback(async () => {
    if (isRunningRef.current || state.files.length === 0) return;

    isRunningRef.current = true;

    try {
      const result = await runPipeline(
        state.files,
        (stage: PipelineStage, progress: number, message: string) => {
          const status = progress === 100 ? 'done' : 'running';
          updatePipelineStage(stage, status, progress, message);
        },
        (level: 'info' | 'warn' | 'error', message: string) => {
          addLog(level, message);
        }
      );

      setKagScripts(result.kagScripts);
      setAssetMap(result.assetMap);

      const imageFiles = state.files
        .filter((f) => /\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(f.name))
        .map((f) => ({
          name: f.name,
          path: (f as any).webkitRelativePath || f.name,
        }));
      const sprites = detectSprites(imageFiles);
      setSpriteList(sprites);

      setOutputTab('kag');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog('error', `转换失败: ${errorMessage}`);
    } finally {
      isRunningRef.current = false;
    }
  }, [
    state.files,
    updatePipelineStage,
    addLog,
    setKagScripts,
    setAssetMap,
    setSpriteList,
    setOutputTab,
  ]);

  const reset = useCallback(() => {
    if (isRunningRef.current) return;
    resetAll();
  }, [resetAll]);

  return {
    startPipeline,
    reset,
    isRunning,
  };
}

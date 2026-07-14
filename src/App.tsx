import { useMemo, useState, useCallback } from 'react';
import { AppProvider, useAppContext } from './store/AppContext';
import { useFileImport, calculateFileStats } from './hooks/useFileImport';
import { usePipeline } from './hooks/usePipeline';
import { readFileAsText } from './utils/file-reader';
import { downloadZip } from './utils/download';
import type { FileTreeNode } from './utils/file-reader';

import Header from './components/Header';
import StatsRow from './components/StatsRow';
import FileTree from './components/FileTree';
import OutputTabs from './components/OutputTabs';
import Pipeline from './components/Pipeline';
import Console from './components/Console';
import StatusBar from './components/StatusBar';
import DropZone from './components/DropZone';
import CodeViewer from './components/CodeViewer';

import styles from './App.module.css';

interface FileNodeForTree {
  name: string;
  path: string;
  type: 'file' | 'directory';
  extension?: string;
  children?: FileNodeForTree[];
}

function convertTreeNode(node: FileTreeNode): FileNodeForTree {
  const ext = node.type === 'file'
    ? node.name.slice(node.name.lastIndexOf('.') + 1).toLowerCase()
    : undefined;

  return {
    name: node.name,
    path: node.path,
    type: node.type === 'dir' ? 'directory' : 'file',
    extension: ext,
    children: node.children?.map(convertTreeNode),
  };
}

function AppContent() {
  const { state, setSelectedFile, addLog } = useAppContext();
  const { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, openFileDialogSingle } = useFileImport();
  const { startPipeline, reset, isRunning } = usePipeline();
  const [isDragOver, setIsDragOver] = useState(false);

  const stats = useMemo(() => calculateFileStats(state.files), [state.files]);

  const treeNodes = useMemo(() => {
    if (!state.fileTree || !state.fileTree.children) return [];
    return state.fileTree.children.map(convertTreeNode);
  }, [state.fileTree]);

  const handleFileSelect = useCallback(async (node: FileNodeForTree) => {
    if (node.type !== 'file') return;

    const findFile = (treeNode: FileTreeNode | null): File | null => {
      if (!treeNode) return null;
      if (treeNode.path === node.path && treeNode.type === 'file' && treeNode.file) {
        return treeNode.file;
      }
      if (treeNode.children) {
        for (const child of treeNode.children) {
          const found = findFile(child);
          if (found) return found;
        }
      }
      return null;
    };

    const file = findFile(state.fileTree);
    if (file) {
      try {
        const content = await readFileAsText(file);
        setSelectedFile(file, content);
      } catch (e) {
          setSelectedFile(file, '');
        }
      }
  }, [state.fileTree, setSelectedFile]);

  const handleDownload = useCallback(() => {
    if (state.kagScripts.length === 0) {
      addLog('warn', '暂无可下载内容，请先完成转换');
      return;
    }
    addLog('info', `开始下载 ${state.kagScripts.length} 个 KAG 脚本`);
    const files = state.kagScripts.map(s => ({ name: s.name, content: s.content }));
    downloadZip(files).then(() => {
      addLog('info', '下载完成: galtrans-output.zip');
    }).catch((err) => {
      addLog('error', `下载失败: ${err.message}`);
    });
  }, [state.kagScripts, addLog]);

  const handleReset = useCallback(() => {
    if (isRunning) {
      addLog('warn', '转换进行中，无法重置');
      return;
    }
    reset();
  }, [reset, isRunning, addLog]);

  const handleStart = useCallback(() => {
    startPipeline();
  }, [startPipeline]);

  const handleDragEnterApp = useCallback((e: React.DragEvent) => {
    handleDragEnter(e);
    setIsDragOver(true);
  }, [handleDragEnter]);

  const handleDragLeaveApp = useCallback((e: React.DragEvent) => {
    handleDragLeave(e);
    setIsDragOver(false);
  }, [handleDragLeave]);

  const handleDropApp = useCallback((e: React.DragEvent) => {
    handleDrop(e);
    setIsDragOver(false);
  }, [handleDrop]);

  const hasFiles = state.files.length > 0;
  const hasKagOutput = state.kagScripts.length > 0;

  const assetMappings = useMemo(() => {
    if (!state.assetMap) return [];
    return Object.entries(state.assetMap).map(([sourceFile, outputPath]) => ({
      sourceFile,
      outputPath: outputPath as string,
    }));
  }, [state.assetMap]);

  const packageItems = useMemo(() => {
    const items: { name: string; size: number }[] = [];
    for (const script of state.kagScripts) {
      items.push({ name: script.name, size: new Blob([script.content]).size });
    }
    if (state.assetMap) {
      for (const key of Object.keys(state.assetMap)) {
        items.push({ name: key, size: 1024 });
      }
    }
    return items;
  }, [state.kagScripts, state.assetMap]);

  const getStatus = (): 'ready' | 'converting' | 'done' | 'error' => {
    if (isRunning) return 'converting';
    if (state.kagScripts.length > 0) return 'done';
    return 'ready';
  };

  return (
    <div
      className={styles.app}
      onDragEnter={handleDragEnterApp}
      onDragOver={(e) => { handleDragOver(e); }}
      onDragLeave={handleDragLeaveApp}
      onDrop={handleDropApp}
    >
      <Header
        engineName={state.engine || undefined}
        confidence={state.engineConfidence || undefined}
        onStart={handleStart}
        onReset={handleReset}
        onDownload={handleDownload}
        canDownload={hasKagOutput}
        isRunning={isRunning}
      />

      <div className={styles.statsWrapper}>
        <StatsRow
          totalFiles={stats.total}
          scriptCount={stats.script}
          spriteCount={stats.sprite}
          audioCount={stats.audio}
        />
      </div>

      <div className={styles.mainContent}>
        <FileTree
          nodes={treeNodes}
          selectedPath={state.selectedFile ? (state.selectedFile as any).webkitRelativePath || state.selectedFile.name : undefined}
          onSelect={handleFileSelect}
        />

        <div className={styles.centerPanel}>
          <div className={styles.editorArea}>
            {!hasFiles && (
              <div className={styles.dropOverlay}>
                <DropZone
                  onFolderSelect={openFileDialog}
                  onFilesSelect={openFileDialogSingle}
                />
              </div>
            )}

            {hasFiles && !hasKagOutput && state.selectedFile && (
              <CodeViewer
                value={state.selectedFileContent}
                fileName={state.selectedFile.name}
                readOnly
              />
            )}

            {hasFiles && hasKagOutput && (
              <OutputTabs
                kagScripts={state.kagScripts}
                assetMappings={assetMappings}
                packageItems={packageItems}
              />
            )}

            {hasFiles && !hasKagOutput && !state.selectedFile && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📁</div>
                <div className={styles.emptyText}>选择左侧文件查看内容</div>
                <div className={styles.emptyHint}>或点击"开始转换"生成 KAG 脚本</div>
              </div>
            )}
          </div>
        </div>

        <Pipeline stages={state.pipelineState.stages as any} />
      </div>

      <Console
        logs={state.logs}
        expanded={state.consoleExpanded}
      />

      <StatusBar
        status={getStatus()}
        fileCount={state.files.length}
        projectName={state.projectName || '未命名项目'}
      />

      {isDragOver && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(233, 69, 96, 0.1)',
          border: '3px dashed var(--accent)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '2rem', color: 'var(--accent)', fontWeight: 'bold' }}>
            📂 释放文件以上传
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

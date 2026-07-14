import { useState } from 'react';
import CodeViewer from './CodeViewer';
import styles from './OutputTabs.module.css';

interface KagScript {
  name: string;
  content: string;
}

interface AssetMapping {
  sourceFile: string;
  outputPath: string;
}

interface PackageItem {
  name: string;
  size: number;
}

interface OutputTabsProps {
  kagScripts?: KagScript[];
  assetMappings?: AssetMapping[];
  packageItems?: PackageItem[];
}

type TabType = 'kag' | 'assets' | 'package';

export default function OutputTabs({
  kagScripts = [],
  assetMappings = [],
  packageItems = [],
}: OutputTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('kag');
  const [selectedScript, setSelectedScript] = useState<string>(kagScripts[0]?.name || '');

  const currentScript = kagScripts.find((s) => s.name === selectedScript);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'kag' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('kag')}
        >
          KAG脚本
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'assets' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          资产映射表
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'package' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('package')}
        >
          封包清单
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'kag' && (
          <div className={styles.kagPanel}>
            <div className={styles.scriptList}>
              {kagScripts.length === 0 ? (
                <div className={styles.emptyState}>暂无脚本文件</div>
              ) : (
                kagScripts.map((script) => (
                  <div
                    key={script.name}
                    className={`${styles.scriptItem} ${selectedScript === script.name ? styles.selectedScript : ''}`}
                    onClick={() => setSelectedScript(script.name)}
                  >
                    <span className={styles.scriptIcon}>📄</span>
                    <span className={styles.scriptName}>{script.name}</span>
                  </div>
                ))
              )}
            </div>
            <div className={styles.codeViewerWrapper}>
              {currentScript ? (
                <CodeViewer
                  value={currentScript.content}
                  fileName={currentScript.name}
                  readOnly
                />
              ) : (
                <div className={styles.emptyState}>选择一个脚本文件查看内容</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assets' && (
          <div className={styles.assetsPanel}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>源文件</th>
                  <th className={styles.th}>输出路径</th>
                </tr>
              </thead>
              <tbody>
                {assetMappings.length === 0 ? (
                  <tr>
                    <td colSpan={2} className={styles.emptyCell}>
                      暂无资产映射
                    </td>
                  </tr>
                ) : (
                  assetMappings.map((mapping, index) => (
                    <tr key={index} className={styles.tr}>
                      <td className={styles.td}>{mapping.sourceFile}</td>
                      <td className={styles.tdMono}>{mapping.outputPath}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'package' && (
          <div className={styles.packagePanel}>
            <div className={styles.packageSummary}>
              <span>共 {packageItems.length} 个文件</span>
              <span>
                总大小: {formatSize(packageItems.reduce((sum, item) => sum + item.size, 0))}
              </span>
            </div>
            <div className={styles.packageList}>
              {packageItems.length === 0 ? (
                <div className={styles.emptyState}>暂无封包文件</div>
              ) : (
                packageItems.map((item, index) => (
                  <div key={index} className={styles.packageItem}>
                    <span className={styles.packageName}>{item.name}</span>
                    <span className={styles.packageSize}>{formatSize(item.size)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import styles from './Header.module.css';

export interface HeaderProps {
  engineName?: string;
  confidence?: number;
  onStart?: () => void;
  onReset?: () => void;
  onDownload?: () => void;
  canDownload?: boolean;
  isRunning?: boolean;
}

export default function Header({ engineName, confidence, onStart, onReset, onDownload, canDownload = false, isRunning = false }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>G</div>
        <h1 className={styles.title}>GalTrans</h1>
      </div>

      <div className={styles.center}>
        {engineName && (
          <div className={styles.engineBadge}>
            <span>⚙️</span>
            <span className={styles.engineName}>{engineName}</span>
            {confidence !== undefined && (
              <span className={styles.confidence}>{Math.round(confidence * 100)}%</span>
            )}
          </div>
        )}
      </div>

      <div className={styles.right}>
        <button
          className={`${styles.button} ${styles.primary} ${isRunning ? styles.disabled : ''}`}
          onClick={onStart}
          title={isRunning ? '转换进行中...' : '开始转换游戏资源'}
        >
          <span>▶</span>
          {isRunning ? '转换中...' : '开始转换'}
        </button>
        <button
          className={`${styles.button} ${styles.secondary} ${isRunning ? styles.disabled : ''}`}
          onClick={onReset}
          title={isRunning ? '转换中无法重置' : '重置所有状态'}
        >
          <span>↺</span>
          重置
        </button>
        <button
          className={`${styles.button} ${styles.secondary} ${!canDownload ? styles.disabled : ''}`}
          onClick={onDownload}
          title={canDownload ? '下载转换后的 KAG 脚本' : '请先完成转换后再下载'}
        >
          <span>⬇</span>
          下载
        </button>
      </div>
    </header>
  );
}

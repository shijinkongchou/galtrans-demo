import styles from './StatusBar.module.css';

export type StatusType = 'ready' | 'converting' | 'done' | 'error';

interface StatusBarProps {
  status?: StatusType;
  fileCount?: number;
  projectName?: string;
}

export default function StatusBar({
  status = 'ready',
  fileCount = 0,
  projectName = '未命名项目',
}: StatusBarProps) {
  const getStatusText = (): string => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'converting':
        return 'Converting...';
      case 'done':
        return 'Done';
      case 'error':
        return 'Error';
      default:
        return 'Ready';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <div className={`${styles.statusIndicator} ${styles[status]}`}>
          <span className={styles.statusDot}></span>
          <span className={styles.statusText}>{getStatusText()}</span>
        </div>
      </div>

      <div className={styles.centerSection}>
        <span className={styles.fileCount}>
          {fileCount > 0 ? `${fileCount} 个文件` : '未选择文件'}
        </span>
      </div>

      <div className={styles.rightSection}>
        <span className={styles.projectName}>{projectName}</span>
      </div>
    </div>
  );
}

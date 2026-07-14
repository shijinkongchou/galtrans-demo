import styles from './Pipeline.module.css';

export type PipelineStage = 'detect' | 'parse' | 'generate' | 'assets' | 'package';
export type PipelineStatus = 'idle' | 'running' | 'done' | 'error';

interface StageInfo {
  label: string;
  icon: string;
}

const STAGE_INFO: Record<PipelineStage, StageInfo> = {
  detect: { label: '引擎检测', icon: '🔍' },
  parse: { label: '脚本解析', icon: '📜' },
  generate: { label: 'KAG生成', icon: '⚙️' },
  assets: { label: '资源处理', icon: '🖼️' },
  package: { label: '封包准备', icon: '📦' },
};

const STAGES: PipelineStage[] = ['detect', 'parse', 'generate', 'assets', 'package'];

interface PipelineStageState {
  status: PipelineStatus;
  progress: number;
  message: string;
}

interface PipelineProps {
  stages: Record<PipelineStage, PipelineStageState>;
}

export default function Pipeline({ stages }: PipelineProps) {
  const getStatusIcon = (status: PipelineStatus): string => {
    switch (status) {
      case 'idle':
        return '○';
      case 'running':
        return '◐';
      case 'done':
        return '✓';
      case 'error':
        return '✕';
      default:
        return '○';
    }
  };

  const getStatusText = (status: PipelineStatus): string => {
    switch (status) {
      case 'idle':
        return '等待中';
      case 'running':
        return '进行中';
      case 'done':
        return '已完成';
      case 'error':
        return '出错';
      default:
        return '等待中';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>⚙️ 转换流水线</span>
      </div>

      <div className={styles.stages}>
        {STAGES.map((stage, index) => {
          const stageData = stages[stage];
          const info = STAGE_INFO[stage];

          return (
            <div key={stage} className={styles.stageItem}>
              <div className={styles.stageHeader}>
                <div className={`${styles.statusIcon} ${styles[stageData.status]}`}>
                  <span className={styles.iconInner}>{getStatusIcon(stageData.status)}</span>
                </div>
                <div className={styles.stageInfo}>
                  <div className={styles.stageName}>
                    <span className={styles.stageIcon}>{info.icon}</span>
                    <span>{info.label}</span>
                  </div>
                  <div className={`${styles.stageStatus} ${styles[stageData.status + 'Text']}`}>
                    {stageData.message || getStatusText(stageData.status)}
                  </div>
                </div>
              </div>

              <div className={styles.progressBarContainer}>
                <div
                  className={`${styles.progressBar} ${styles[stageData.status]}`}
                  style={{ width: `${stageData.progress}%` }}
                >
                  {stageData.status === 'running' && (
                    <div className={styles.progressStripes}></div>
                  )}
                </div>
              </div>

              <div className={styles.progressText}>
                {Math.round(stageData.progress)}%
              </div>

              {index < STAGES.length - 1 && (
                <div className={`${styles.connector} ${stages[stage].status === 'done' ? styles.connectorDone : ''}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

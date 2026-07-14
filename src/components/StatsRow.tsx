import styles from './StatsRow.module.css';

export interface StatsRowProps {
  totalFiles: number;
  scriptCount: number;
  spriteCount: number;
  audioCount: number;
}

export default function StatsRow({ totalFiles, scriptCount, spriteCount, audioCount }: StatsRowProps) {
  return (
    <div className={styles.statsRow}>
      <div className={styles.card}>
        <div className={`${styles.icon} ${styles.iconFiles}`}>📁</div>
        <div className={styles.content}>
          <span className={styles.number}>{totalFiles}</span>
          <span className={styles.label}>总文件数</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={`${styles.icon} ${styles.iconScripts}`}>📜</div>
        <div className={styles.content}>
          <span className={styles.number}>{scriptCount}</span>
          <span className={styles.label}>脚本数</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={`${styles.icon} ${styles.iconSprites}`}>🎭</div>
        <div className={styles.content}>
          <span className={styles.number}>{spriteCount}</span>
          <span className={styles.label}>立绘数</span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={`${styles.icon} ${styles.iconAudio}`}>🎵</div>
        <div className={styles.content}>
          <span className={styles.number}>{audioCount}</span>
          <span className={styles.label}>音频数</span>
        </div>
      </div>
    </div>
  );
}

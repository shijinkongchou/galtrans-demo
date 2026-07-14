import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import styles from './Console.module.css';

export type LogLevel = 'info' | 'warn' | 'error';

interface SimpleLogEntry {
  level: string;
  message: string;
  time: string;
}

interface ConsoleProps {
  logs?: SimpleLogEntry[];
  expanded?: boolean;
  defaultHeight?: number;
}

export default function Console({ logs = [], expanded: externalExpanded, defaultHeight = 150 }: ConsoleProps) {
  const { toggleConsole, addLog } = useAppContext();
  const [isCollapsed, setIsCollapsed] = useState(!externalExpanded);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  useEffect(() => {
    if (externalExpanded !== undefined) {
      setIsCollapsed(!externalExpanded);
    }
  }, [externalExpanded]);

  useEffect(() => {
    if (logContainerRef.current && isAtBottomRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleScroll = () => {
    if (logContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
      isAtBottomRef.current = scrollTop + clientHeight >= scrollHeight - 10;
    }
  };

  const getLevelLabel = (level: string): string => {
    switch (level) {
      case 'info':
        return 'INFO';
      case 'warn':
        return 'WARN';
      case 'error':
        return 'ERROR';
      default:
        return 'INFO';
    }
  };

  const handleClear = () => {
    addLog('clear', '');
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    toggleConsole();
  };

  const displayLogs = logs.filter((l) => l.level !== 'clear');

  return (
    <div
      className={`${styles.container} ${isCollapsed ? styles.collapsed : ''}`}
      style={{ height: isCollapsed ? '32px' : `${defaultHeight}px` }}
    >
      <div className={styles.toolbar}>
        <div className={styles.title}>
          <span className={styles.titleIcon}>▸</span>
          <span>控制台</span>
          <span className={styles.logCount}>{displayLogs.length}</span>
        </div>
        <div className={styles.toolbarActions}>
          <button
            className={styles.toolbarButton}
            onClick={handleClear}
            title="清空日志"
          >
            清空
          </button>
          <button
            className={styles.toolbarButton}
            onClick={toggleCollapse}
            title={isCollapsed ? '展开' : '折叠'}
          >
            {isCollapsed ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div
          ref={logContainerRef}
          className={styles.logContainer}
          onScroll={handleScroll}
        >
          {displayLogs.length === 0 ? (
            <div className={styles.emptyLogs}>暂无日志输出</div>
          ) : (
            displayLogs.map((log, index) => (
              <div
                key={index}
                className={`${styles.logEntry} ${styles[log.level as LogLevel] || styles.info}`}
              >
                <span className={styles.timestamp}>[{log.time}]</span>
                <span className={`${styles.level} ${styles[log.level + 'Level'] || styles.infoLevel}`}>
                  [{getLevelLabel(log.level)}]
                </span>
                <span className={styles.message}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

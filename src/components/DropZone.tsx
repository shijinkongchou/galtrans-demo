import { useRef, DragEvent } from 'react';
import styles from './DropZone.module.css';

export interface DropZoneProps {
  onFolderSelect?: () => void;
  onFilesSelect?: () => void;
  fullscreen?: boolean;
}

export default function DropZone({
  onFolderSelect,
  onFilesSelect,
  fullscreen = false,
}: DropZoneProps) {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);

  const handleFolderClick = () => {
    if (onFolderSelect) {
      onFolderSelect();
    } else {
      folderInputRef.current?.click();
    }
  };

  const handleFilesClick = () => {
    if (onFilesSelect) {
      onFilesSelect();
    } else {
      filesInputRef.current?.click();
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={`${styles.dropZone} ${fullscreen ? styles.fullscreen : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <span>📂</span>
        </div>
        <div className={styles.text}>
          <p className={styles.title}>
            拖拽文件到此处，或选择上传方式
          </p>
          <p className={styles.subtitle}>
            支持 Ren'Py / KiriKiri2 / ONScripter 等引擎
          </p>
        </div>
        <div className={styles.buttons}>
          <button className={styles.primaryBtn} onClick={handleFolderClick}>
            📁 选择文件夹
          </button>
          <button className={styles.secondaryBtn} onClick={handleFilesClick}>
            📄 选择多文件
          </button>
        </div>
        <div className={styles.hint}>
          <span className={styles.hintTag}>Ren'Py (.rpy)</span>
          <span className={styles.hintTag}>KiriKiri (.ks)</span>
          <span className={styles.hintTag}>图片资源</span>
          <span className={styles.hintTag}>音频资源</span>
        </div>
      </div>

      <input
        ref={folderInputRef}
        className={styles.input}
        type="file"
        multiple
        // @ts-ignore
        webkitdirectory=""
        directory=""
        style={{ display: 'none' }}
      />
      <input
        ref={filesInputRef}
        className={styles.input}
        type="file"
        multiple
        style={{ display: 'none' }}
      />
    </div>
  );
}

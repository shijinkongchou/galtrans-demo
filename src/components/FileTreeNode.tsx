import { useState } from 'react';
import styles from './FileTree.module.css';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  extension?: string;
  children?: FileNode[];
}

interface FileTreeNodeProps {
  node: FileNode;
  selectedPath?: string;
  level?: number;
  onSelect?: (node: FileNode) => void;
}

function getFileIcon(extension?: string): { icon: string; color: string } {
  if (!extension) return { icon: '📄', color: '#8888a8' };

  const ext = extension.toLowerCase();

  const scriptExts = ['.rpy', '.rpym', '.ks', '.tjs', '.js', '.ts', '.json', '.xml'];
  const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tga'];
  const audioExts = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma'];
  const videoExts = ['.mp4', '.avi', '.mkv', '.webm', '.mov'];
  const fontExts = ['.ttf', '.otf', '.woff', '.woff2'];

  if (scriptExts.includes(ext)) return { icon: '📜', color: '#667eea' };
  if (imageExts.includes(ext)) return { icon: '🖼️', color: '#ea66b4' };
  if (audioExts.includes(ext)) return { icon: '🎵', color: '#66c8ea' };
  if (videoExts.includes(ext)) return { icon: '🎬', color: '#eab466' };
  if (fontExts.includes(ext)) return { icon: '🔤', color: '#66eab4' };

  return { icon: '📄', color: '#8888a8' };
}

export default function FileTreeNode({ node, selectedPath, level = 0, onSelect }: FileTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const isSelected = selectedPath === node.path;
  const isDirectory = node.type === 'directory';
  const { icon, color } = getFileIcon(node.extension);

  const handleClick = () => {
    if (isDirectory) {
      setIsExpanded(!isExpanded);
    } else {
      onSelect?.(node);
    }
  };

  return (
    <div className={styles.nodeContainer}>
      <div
        className={`${styles.node} ${isSelected ? styles.selected : ''} ${isDirectory ? styles.directory : styles.file}`}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={handleClick}
      >
        {isDirectory && (
          <span className={styles.arrow}>
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
        {!isDirectory && <span className={styles.arrowPlaceholder}></span>}

        <span className={styles.icon} style={{ color }}>
          {isDirectory ? (isExpanded ? '📂' : '📁') : icon}
        </span>

        <span className={styles.name} title={node.name}>
          {node.name}
        </span>
      </div>

      {isDirectory && isExpanded && node.children && node.children.length > 0 && (
        <div className={styles.children}>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

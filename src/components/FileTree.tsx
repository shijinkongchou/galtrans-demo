import styles from './FileTree.module.css';
import FileTreeNode from './FileTreeNode';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  extension?: string;
  children?: FileNode[];
}

export interface FileTreeProps {
  nodes: FileNode[];
  selectedPath?: string;
  onSelect?: (node: FileNode) => void;
}

export default function FileTree({ nodes, selectedPath, onSelect }: FileTreeProps) {
  return (
    <aside className={styles.fileTree}>
      <div className={styles.header}>
        <span>📁</span>
        <span>项目文件</span>
      </div>

      <div className={styles.treeContainer}>
        {nodes.length === 0 ? (
          <div className={styles.empty}>暂无文件</div>
        ) : (
          nodes.map((node) => (
            <FileTreeNode
              key={node.path}
              node={node}
              selectedPath={selectedPath}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </aside>
  );
}

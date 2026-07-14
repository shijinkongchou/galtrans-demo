export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FileTreeNode[];
  file?: File;
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function buildFileTree(files: File[]): FileTreeNode {
  const root: FileTreeNode = {
    name: 'root',
    path: '',
    type: 'dir',
    children: [],
  };

  for (const file of files) {
    const filePath = (file as any).webkitRelativePath || file.name;
    const parts = filePath.split('/');
    let currentNode = root;
    let currentPath = '';

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (isLast) {
        const fileNode: FileTreeNode = {
          name: part,
          path: currentPath,
          type: 'file',
          file,
        };
        if (!currentNode.children) {
          currentNode.children = [];
        }
        currentNode.children.push(fileNode);
      } else {
        let childNode = currentNode.children?.find(
          (child) => child.name === part && child.type === 'dir'
        );
        if (!childNode) {
          childNode = {
            name: part,
            path: currentPath,
            type: 'dir',
            children: [],
          };
          if (!currentNode.children) {
            currentNode.children = [];
          }
          currentNode.children.push(childNode);
        }
        currentNode = childNode;
      }
    }
  }

  const sortTree = (node: FileTreeNode): void => {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.type === 'dir' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'dir') return 1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortTree);
    }
  };

  sortTree(root);

  return root;
}

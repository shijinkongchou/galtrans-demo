import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function downloadZip(files: { name: string; content: string }[]): Promise<void> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.name, file.content);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'galtrans-output.zip');
}

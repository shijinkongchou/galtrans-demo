import { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import { readFileAsDataURL } from '../utils/file-reader';
import styles from './SpriteCards.module.css';

interface SpriteCardProps {
  name: string;
  expressions: string[];
  files: File[];
}

function SpriteCard({ name, expressions, files }: SpriteCardProps) {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  const expressionFiles = useMemo(() => {
    const result: { expression: string; file: File | null }[] = [];
    for (const expr of expressions) {
      const matchingFile = files.find((f) => {
        const baseName = f.name.replace(/\.[^.]+$/, '').toLowerCase();
        return baseName.includes(name.toLowerCase()) && baseName.includes(expr.toLowerCase());
      });
      result.push({ expression: expr, file: matchingFile || null });
    }
    return result;
  }, [name, expressions, files]);

  useEffect(() => {
    let cancelled = false;

    async function loadThumbnails() {
      const thumbs: Record<string, string> = {};
      for (const item of expressionFiles) {
        if (item.file && !cancelled) {
          try {
            const dataUrl = await readFileAsDataURL(item.file);
            if (!cancelled) {
              thumbs[item.expression] = dataUrl;
            }
          } catch {
            // skip
          }
        }
      }
      if (!cancelled) {
        setThumbnails(thumbs);
      }
    }

    loadThumbnails();

    return () => {
      cancelled = true;
    };
  }, [expressionFiles]);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.characterName}>{name}</span>
        <span className={styles.expressionCount}>{expressions.length} 个表情</span>
      </div>
      <div className={styles.thumbGrid}>
        {expressionFiles.map(({ expression }) => (
          <div key={expression} className={styles.thumbItem} title={expression}>
            {thumbnails[expression] ? (
              <img src={thumbnails[expression]} alt={expression} className={styles.thumbImage} />
            ) : (
              <div className={styles.thumbPlaceholder}>
                <span className={styles.thumbText}>{expression}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SpriteCards() {
  const { state } = useAppContext();
  const { spriteList, files } = state;

  if (spriteList.length === 0) {
    return (
      <div className={styles.empty}>
        <p>暂无立绘数据</p>
        <p className={styles.emptyHint}>导入包含角色立绘的游戏资源目录以查看</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>立绘差分</h3>
        <span className={styles.count}>共 {spriteList.length} 个角色</span>
      </div>
      <div className={styles.scrollArea}>
        <div className={styles.cardGrid}>
          {spriteList.map((sprite: any) => (
            <SpriteCard
              key={sprite.name}
              name={sprite.name}
              expressions={sprite.expressions || []}
              files={files}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SpriteCards;

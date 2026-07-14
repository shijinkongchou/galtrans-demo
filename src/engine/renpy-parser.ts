import type { ASTNode, Token, LabelNode, DialogueNode, ShowNode, HideNode, MenuNode, MenuItemNode, JumpNode, CallNode, ReturnNode, PlayNode, StopNode, IfNode, AssignNode, CommentNode, SceneNode } from './types';

const INDENT_SIZE = 4;

export function tokenize(lines: string[]): Token[] {
  const tokens: Token[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (!line.trim()) {
      continue;
    }

    const indent = getIndentLevel(line);
    const trimmed = line.trim();

    if (trimmed.startsWith('#')) {
      tokens.push({
        type: 'comment',
        value: trimmed.slice(1).trim(),
        line: lineNum,
        indent
      });
      continue;
    }

    const labelMatch = trimmed.match(/^label\s+(\w+)\s*:/);
    if (labelMatch) {
      tokens.push({
        type: 'label',
        value: labelMatch[1],
        line: lineNum,
        indent
      });
      continue;
    }

    const menuMatch = trimmed.match(/^menu\s*:/);
    if (menuMatch) {
      tokens.push({
        type: 'menu',
        value: '',
        line: lineNum,
        indent
      });
      continue;
    }

    const menuItemMatch = trimmed.match(/^"([^"]+)"\s*:\s*jump\s+(\w+)/);
    if (menuItemMatch) {
      tokens.push({
        type: 'menuitem',
        value: `${menuItemMatch[1]}|${menuItemMatch[2]}`,
        line: lineNum,
        indent
      });
      continue;
    }

    const menuItemSimpleMatch = trimmed.match(/^"([^"]+)"\s*:/);
    if (menuItemSimpleMatch) {
      tokens.push({
        type: 'menuitem_text',
        value: menuItemSimpleMatch[1],
        line: lineNum,
        indent
      });
      continue;
    }

    const jumpMatch = trimmed.match(/^jump\s+(\w+)/);
    if (jumpMatch) {
      tokens.push({
        type: 'jump',
        value: jumpMatch[1],
        line: lineNum,
        indent
      });
      continue;
    }

    const callMatch = trimmed.match(/^call\s+(\w+)/);
    if (callMatch) {
      tokens.push({
        type: 'call',
        value: callMatch[1],
        line: lineNum,
        indent
      });
      continue;
    }

    const returnMatch = trimmed.match(/^return/);
    if (returnMatch) {
      tokens.push({
        type: 'return',
        value: '',
        line: lineNum,
        indent
      });
      continue;
    }

    const showMatch = trimmed.match(/^show\s+(\w+)(?:\s+(\w+))?/);
    if (showMatch) {
      const sprite = showMatch[1];
      const expression = showMatch[2] || '';
      tokens.push({
        type: 'show',
        value: `${sprite}|${expression}`,
        line: lineNum,
        indent
      });
      continue;
    }

    const hideMatch = trimmed.match(/^hide\s+(\w+)/);
    if (hideMatch) {
      tokens.push({
        type: 'hide',
        value: hideMatch[1],
        line: lineNum,
        indent
      });
      continue;
    }

    const sceneMatch = trimmed.match(/^scene\s+(\w+)/);
    if (sceneMatch) {
      tokens.push({
        type: 'scene',
        value: sceneMatch[1],
        line: lineNum,
        indent
      });
      continue;
    }

    const playMatch = trimmed.match(/^play\s+(\w+)\s+["']?([^"'\s]+)["']?(?:\s+loop)?/);
    if (playMatch) {
      const channel = playMatch[1];
      const file = playMatch[2];
      const loop = trimmed.includes('loop');
      tokens.push({
        type: 'play',
        value: `${channel}|${file}|${loop}`,
        line: lineNum,
        indent
      });
      continue;
    }

    const stopMatch = trimmed.match(/^stop\s+(\w+)/);
    if (stopMatch) {
      tokens.push({
        type: 'stop',
        value: stopMatch[1],
        line: lineNum,
        indent
      });
      continue;
    }

    const ifMatch = trimmed.match(/^if\s+(.+?)\s*:/);
    if (ifMatch) {
      tokens.push({
        type: 'if',
        value: ifMatch[1],
        line: lineNum,
        indent
      });
      continue;
    }

    const elseMatch = trimmed.match(/^else\s*:/);
    if (elseMatch) {
      tokens.push({
        type: 'else',
        value: '',
        line: lineNum,
        indent
      });
      continue;
    }

    const assignMatch = trimmed.match(/^\$\s+(\w+)\s*=\s*(.+)/);
    if (assignMatch) {
      tokens.push({
        type: 'assign',
        value: `${assignMatch[1]}|${assignMatch[2]}`,
        line: lineNum,
        indent
      });
      continue;
    }

    const dialogueMatch = trimmed.match(/^(?:(\w+)\s+)?"([^"]+)"$/);
    if (dialogueMatch) {
      const speaker = dialogueMatch[1] || '';
      const text = dialogueMatch[2];
      tokens.push({
        type: 'dialogue',
        value: `${speaker}|${text}`,
        line: lineNum,
        indent
      });
      continue;
    }

    const narrationMatch = trimmed.match(/^"([^"]+)"$/);
    if (narrationMatch) {
      tokens.push({
        type: 'dialogue',
        value: `|${narrationMatch[1]}`,
        line: lineNum,
        indent
      });
      continue;
    }

    tokens.push({
      type: 'unknown',
      value: trimmed,
      line: lineNum,
      indent
    });
  }

  return tokens;
}

export function buildAST(tokens: Token[]): ASTNode[] {
  const ast: ASTNode[] = [];
  let index = 0;

  function parseBlock(currentIndent: number): ASTNode[] {
    const block: ASTNode[] = [];

    while (index < tokens.length) {
      const token = tokens[index];

      if (token.indent < currentIndent) {
        break;
      }

      if (token.indent > currentIndent) {
        index++;
        continue;
      }

      index++;

      switch (token.type) {
        case 'label':
          block.push({
            type: 'label',
            name: token.value,
            line: token.line
          } as LabelNode);
          break;

        case 'dialogue': {
          const [speaker, text] = splitValue(token.value);
          block.push({
            type: 'dialogue',
            speaker: speaker || undefined,
            text,
            line: token.line
          } as DialogueNode);
          break;
        }

        case 'show': {
          const [sprite, expression] = splitValue(token.value);
          block.push({
            type: 'show',
            sprite,
            expression: expression || undefined,
            line: token.line
          } as ShowNode);
          break;
        }

        case 'hide':
          block.push({
            type: 'hide',
            sprite: token.value,
            line: token.line
          } as HideNode);
          break;

        case 'scene':
          block.push({
            type: 'scene',
            background: token.value,
            line: token.line
          } as SceneNode);
          break;

        case 'menu': {
          const menuItems: MenuItemNode[] = [];
          const menuIndent = token.indent + 1;

          while (index < tokens.length && tokens[index].indent >= menuIndent) {
            const menuToken = tokens[index];

            if (menuToken.indent === menuIndent && (menuToken.type === 'menuitem' || menuToken.type === 'menuitem_text')) {
              index++;

              if (menuToken.type === 'menuitem') {
                const [text, target] = splitValue(menuToken.value);
                menuItems.push({
                  type: 'menuitem',
                  text,
                  target,
                  line: menuToken.line
                });
              } else {
                const text = menuToken.value;
                let target = '';

                while (index < tokens.length && tokens[index].indent > menuIndent) {
                  const subToken = tokens[index];
                  if (subToken.type === 'jump') {
                    target = subToken.value;
                    index++;
                    break;
                  }
                  index++;
                }

                menuItems.push({
                  type: 'menuitem',
                  text,
                  target,
                  line: menuToken.line
                });
              }
            } else {
              index++;
            }
          }

          block.push({
            type: 'menu',
            items: menuItems,
            line: token.line
          } as MenuNode);
          break;
        }

        case 'jump':
          block.push({
            type: 'jump',
            target: token.value,
            line: token.line
          } as JumpNode);
          break;

        case 'call':
          block.push({
            type: 'call',
            target: token.value,
            line: token.line
          } as CallNode);
          break;

        case 'return':
          block.push({
            type: 'return',
            line: token.line
          } as ReturnNode);
          break;

        case 'play': {
          const [channel, file, loopStr] = splitValue(token.value, 3);
          block.push({
            type: 'play',
            channel,
            file,
            loop: loopStr === 'true',
            line: token.line
          } as PlayNode);
          break;
        }

        case 'stop':
          block.push({
            type: 'stop',
            channel: token.value,
            line: token.line
          } as StopNode);
          break;

        case 'if': {
          const condition = token.value;
          const ifIndent = token.indent + 1;
          const ifBody = parseBlock(ifIndent);
          let elseBody: ASTNode[] | undefined;

          if (index < tokens.length && tokens[index].type === 'else' && tokens[index].indent === token.indent) {
            index++;
            elseBody = parseBlock(ifIndent);
          }

          block.push({
            type: 'if',
            condition,
            body: ifBody,
            elseBody,
            line: token.line
          } as IfNode);
          break;
        }

        case 'assign': {
          const [variable, value] = splitValue(token.value);
          block.push({
            type: 'assign',
            variable,
            value,
            line: token.line
          } as AssignNode);
          break;
        }

        case 'comment':
          block.push({
            type: 'comment',
            text: token.value,
            line: token.line
          } as CommentNode);
          break;

        default:
          break;
      }
    }

    return block;
  }

  while (index < tokens.length) {
    const token = tokens[index];
    const blockNodes = parseBlock(token.indent);
    ast.push(...blockNodes);
  }

  return ast;
}

function getIndentLevel(line: string): number {
  let count = 0;
  for (const char of line) {
    if (char === ' ') {
      count++;
    } else if (char === '\t') {
      count += INDENT_SIZE;
    } else {
      break;
    }
  }
  return Math.floor(count / INDENT_SIZE);
}

function splitValue(value: string, parts: number = 2): string[] {
  const result: string[] = [];
  let current = '';
  let i = 0;
  let count = 0;

  while (i < value.length && count < parts - 1) {
    if (value[i] === '|') {
      result.push(current);
      current = '';
      count++;
    } else {
      current += value[i];
    }
    i++;
  }

  current += value.slice(i);
  result.push(current);

  while (result.length < parts) {
    result.push('');
  }

  return result;
}

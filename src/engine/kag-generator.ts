import type { ASTNode, LabelNode, DialogueNode, ShowNode, HideNode, MenuNode, JumpNode, CallNode, ReturnNode, PlayNode, StopNode, IfNode, AssignNode, CommentNode, SceneNode } from './types';

export function generateKAG(ast: ASTNode[]): string {
  const lines: string[] = [];
  lines.push('*start');
  lines.push('');

  for (const node of ast) {
    const generated = generateNode(node);
    if (generated) {
      lines.push(generated);
    }
  }

  lines.push('');
  lines.push('@end');

  return lines.join('\n');
}

function generateNode(node: ASTNode, indent: number = 0): string {
  const prefix = '\t'.repeat(indent);

  switch (node.type) {
    case 'label':
      return generateLabel(node as LabelNode);

    case 'dialogue':
      return generateDialogue(node as DialogueNode, prefix);

    case 'show':
      return generateShow(node as ShowNode, prefix);

    case 'hide':
      return generateHide(node as HideNode, prefix);

    case 'scene':
      return generateScene(node as SceneNode, prefix);

    case 'menu':
      return generateMenu(node as MenuNode, prefix);

    case 'jump':
      return generateJump(node as JumpNode, prefix);

    case 'call':
      return generateCall(node as CallNode, prefix);

    case 'return':
      return generateReturn(node as ReturnNode, prefix);

    case 'play':
      return generatePlay(node as PlayNode, prefix);

    case 'stop':
      return generateStop(node as StopNode, prefix);

    case 'if':
      return generateIf(node as IfNode, prefix, indent);

    case 'assign':
      return generateAssign(node as AssignNode, prefix);

    case 'comment':
      return generateComment(node as CommentNode, prefix);

    default:
      return '';
  }
}

function generateLabel(node: LabelNode): string {
  return `\n*${node.name}`;
}

function generateDialogue(node: DialogueNode, prefix: string): string {
  if (node.speaker) {
    return `${prefix}【${node.speaker}】${node.text}`;
  }
  return `${prefix}${node.text}`;
}

function generateShow(node: ShowNode, prefix: string): string {
  const layer = node.layer || 'message01';
  let storage = node.sprite;
  if (node.expression) {
    storage = `${node.sprite}_${node.expression}`;
  }
  return `${prefix}[image storage="${storage}" layer="${layer}"]`;
}

function generateHide(node: HideNode, prefix: string): string {
  const layer = node.layer || 'message01';
  return `${prefix}[image storage="" layer="${layer}" clear]`;
}

function generateScene(node: SceneNode, prefix: string): string {
  return `${prefix}[bg storage="${node.background}"]`;
}

function generateMenu(node: MenuNode, prefix: string): string {
  const lines: string[] = [];
  lines.push(`${prefix}[select]`);

  for (const item of node.items) {
    const target = item.target || '';
    lines.push(`${prefix}\t[item text="${item.text}" target="*${target}"]`);
  }

  lines.push(`${prefix}[endselect]`);
  return lines.join('\n');
}

function generateJump(node: JumpNode, prefix: string): string {
  return `${prefix}[jump storage="*${node.target}"]`;
}

function generateCall(node: CallNode, prefix: string): string {
  return `${prefix}[jump storage="*${node.target}" cond="*"]`;
}

function generateReturn(_node: ReturnNode, prefix: string): string {
  return `${prefix}[return]`;
}

function generatePlay(node: PlayNode, prefix: string): string {
  const loopAttr = node.loop ? ' loop' : '';
  return `${prefix}[play storage="${node.file}"${loopAttr}]`;
}

function generateStop(_node: StopNode, prefix: string): string {
  return `${prefix}[stop]`;
}

function generateIf(node: IfNode, prefix: string, indent: number = 0): string {
  const lines: string[] = [];
  lines.push(`${prefix}[if exp="${escapeQuotes(node.condition)}"]`);

  for (const child of node.body) {
    const generated = generateNode(child, indent + 1);
    if (generated) {
      lines.push(generated);
    }
  }

  if (node.elseBody && node.elseBody.length > 0) {
    lines.push(`${prefix}[else]`);
    for (const child of node.elseBody) {
      const generated = generateNode(child, indent + 1);
      if (generated) {
        lines.push(generated);
      }
    }
  }

  lines.push(`${prefix}[endif]`);
  return lines.join('\n');
}

function generateAssign(node: AssignNode, prefix: string): string {
  return `${prefix}[iscript] sf.${node.variable} = ${node.value}; [endscript]`;
}

function generateComment(node: CommentNode, prefix: string): string {
  return `${prefix}; ${node.text}`;
}

function escapeQuotes(text: string): string {
  return text.replace(/"/g, '\\"');
}

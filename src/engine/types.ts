export interface ASTNode {
  type: string;
  line: number;
}

export interface LabelNode extends ASTNode {
  type: 'label';
  name: string;
}

export interface DialogueNode extends ASTNode {
  type: 'dialogue';
  speaker?: string;
  text: string;
}

export interface ShowNode extends ASTNode {
  type: 'show';
  sprite: string;
  expression?: string;
  layer?: string;
}

export interface HideNode extends ASTNode {
  type: 'hide';
  sprite: string;
  layer?: string;
}

export interface MenuNode extends ASTNode {
  type: 'menu';
  items: MenuItemNode[];
}

export interface MenuItemNode extends ASTNode {
  type: 'menuitem';
  text: string;
  target: string;
}

export interface JumpNode extends ASTNode {
  type: 'jump';
  target: string;
}

export interface CallNode extends ASTNode {
  type: 'call';
  target: string;
}

export interface ReturnNode extends ASTNode {
  type: 'return';
}

export interface PlayNode extends ASTNode {
  type: 'play';
  channel: string;
  file: string;
  loop?: boolean;
}

export interface StopNode extends ASTNode {
  type: 'stop';
  channel: string;
}

export interface IfNode extends ASTNode {
  type: 'if';
  condition: string;
  body: ASTNode[];
  elseBody?: ASTNode[];
}

export interface AssignNode extends ASTNode {
  type: 'assign';
  variable: string;
  value: string;
}

export interface CommentNode extends ASTNode {
  type: 'comment';
  text: string;
}

export interface SceneNode extends ASTNode {
  type: 'scene';
  background: string;
}

export interface SpriteInfo {
  name: string;
  expressions: string[];
}

export interface AudioInfo {
  name: string;
  format: string;
  path: string;
}

export interface AssetMap {
  sprites: SpriteInfo[];
  backgrounds: string[];
  audio: AudioInfo[];
}

export interface Token {
  type: string;
  value: string;
  line: number;
  indent: number;
}

export type ASTNodeType =
  | LabelNode
  | DialogueNode
  | ShowNode
  | HideNode
  | MenuNode
  | MenuItemNode
  | JumpNode
  | CallNode
  | ReturnNode
  | PlayNode
  | StopNode
  | IfNode
  | AssignNode
  | CommentNode
  | SceneNode;

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { FileTreeNode } from '../utils/file-reader';
import { PipelineState, PipelineStage } from '../pipeline/pipeline';

export interface AppState {
  files: File[];
  fileTree: FileTreeNode | null;
  selectedFile: File | null;
  selectedFileContent: string;
  engine: string;
  engineConfidence: number;
  engineReasons: string[];
  pipelineState: PipelineState;
  kagScripts: { name: string; content: string }[];
  assetMap: any;
  spriteList: any[];
  logs: { level: string; message: string; time: string }[];
  outputTab: 'kag' | 'assets' | 'manifest';
  consoleExpanded: boolean;
  projectName: string;
}

type Action =
  | { type: 'SET_FILES'; payload: File[] }
  | { type: 'SET_FILE_TREE'; payload: FileTreeNode | null }
  | { type: 'SET_SELECTED_FILE'; payload: { file: File | null; content: string } }
  | { type: 'SET_ENGINE'; payload: { engine: string; confidence: number; reasons: string[] } }
  | { type: 'UPDATE_PIPELINE_STAGE'; payload: { stage: PipelineStage; status: string; progress: number; message: string } }
  | { type: 'ADD_LOG'; payload: { level: string; message: string } }
  | { type: 'SET_KAG_SCRIPTS'; payload: { name: string; content: string }[] }
  | { type: 'SET_ASSET_MAP'; payload: any }
  | { type: 'SET_SPRITE_LIST'; payload: any[] }
  | { type: 'SET_OUTPUT_TAB'; payload: 'kag' | 'assets' | 'manifest' }
  | { type: 'TOGGLE_CONSOLE' }
  | { type: 'SET_PROJECT_NAME'; payload: string }
  | { type: 'RESET_ALL' };

const initialPipelineState: PipelineState = {
  stages: {
    detect: { status: 'idle', progress: 0, message: '' },
    parse: { status: 'idle', progress: 0, message: '' },
    generate: { status: 'idle', progress: 0, message: '' },
    assets: { status: 'idle', progress: 0, message: '' },
    package: { status: 'idle', progress: 0, message: '' },
  },
};

const initialState: AppState = {
  files: [],
  fileTree: null,
  selectedFile: null,
  selectedFileContent: '',
  engine: '',
  engineConfidence: 0,
  engineReasons: [],
  pipelineState: initialPipelineState,
  kagScripts: [],
  assetMap: {},
  spriteList: [],
  logs: [],
  outputTab: 'kag',
  consoleExpanded: true,
  projectName: '',
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_FILES':
      return { ...state, files: action.payload };
    case 'SET_FILE_TREE':
      return { ...state, fileTree: action.payload };
    case 'SET_SELECTED_FILE':
      return {
        ...state,
        selectedFile: action.payload.file,
        selectedFileContent: action.payload.content,
      };
    case 'SET_ENGINE':
      return {
        ...state,
        engine: action.payload.engine,
        engineConfidence: action.payload.confidence,
        engineReasons: action.payload.reasons,
      };
    case 'UPDATE_PIPELINE_STAGE':
      return {
        ...state,
        pipelineState: {
          ...state.pipelineState,
          stages: {
            ...state.pipelineState.stages,
            [action.payload.stage]: {
              status: action.payload.status as any,
              progress: action.payload.progress,
              message: action.payload.message,
            },
          },
        },
      };
    case 'ADD_LOG': {
      const now = new Date();
      const time = now.toLocaleTimeString('zh-CN', { hour12: false });
      return {
        ...state,
        logs: [...state.logs, { level: action.payload.level, message: action.payload.message, time }],
      };
    }
    case 'SET_KAG_SCRIPTS':
      return { ...state, kagScripts: action.payload };
    case 'SET_ASSET_MAP':
      return { ...state, assetMap: action.payload };
    case 'SET_SPRITE_LIST':
      return { ...state, spriteList: action.payload };
    case 'SET_OUTPUT_TAB':
      return { ...state, outputTab: action.payload };
    case 'TOGGLE_CONSOLE':
      return { ...state, consoleExpanded: !state.consoleExpanded };
    case 'SET_PROJECT_NAME':
      return { ...state, projectName: action.payload };
    case 'RESET_ALL':
      return initialState;
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  setFiles: (files: File[]) => void;
  setFileTree: (tree: FileTreeNode | null) => void;
  setSelectedFile: (file: File | null, content: string) => void;
  setEngine: (engine: string, confidence: number, reasons: string[]) => void;
  updatePipelineStage: (stage: PipelineStage, status: string, progress: number, message: string) => void;
  addLog: (level: string, message: string) => void;
  setKagScripts: (scripts: { name: string; content: string }[]) => void;
  setAssetMap: (assetMap: any) => void;
  setSpriteList: (spriteList: any[]) => void;
  setOutputTab: (tab: 'kag' | 'assets' | 'manifest') => void;
  toggleConsole: () => void;
  setProjectName: (name: string) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setFiles = (files: File[]) => {
    dispatch({ type: 'SET_FILES', payload: files });
  };

  const setFileTree = (tree: FileTreeNode | null) => {
    dispatch({ type: 'SET_FILE_TREE', payload: tree });
  };

  const setSelectedFile = (file: File | null, content: string) => {
    dispatch({ type: 'SET_SELECTED_FILE', payload: { file, content } });
  };

  const setEngine = (engine: string, confidence: number, reasons: string[]) => {
    dispatch({ type: 'SET_ENGINE', payload: { engine, confidence, reasons } });
  };

  const updatePipelineStage = (stage: PipelineStage, status: string, progress: number, message: string) => {
    dispatch({ type: 'UPDATE_PIPELINE_STAGE', payload: { stage, status, progress, message } });
  };

  const addLog = (level: string, message: string) => {
    dispatch({ type: 'ADD_LOG', payload: { level, message } });
  };

  const setKagScripts = (scripts: { name: string; content: string }[]) => {
    dispatch({ type: 'SET_KAG_SCRIPTS', payload: scripts });
  };

  const setAssetMap = (assetMap: any) => {
    dispatch({ type: 'SET_ASSET_MAP', payload: assetMap });
  };

  const setSpriteList = (spriteList: any[]) => {
    dispatch({ type: 'SET_SPRITE_LIST', payload: spriteList });
  };

  const setOutputTab = (tab: 'kag' | 'assets' | 'manifest') => {
    dispatch({ type: 'SET_OUTPUT_TAB', payload: tab });
  };

  const toggleConsole = () => {
    dispatch({ type: 'TOGGLE_CONSOLE' });
  };

  const setProjectName = (name: string) => {
    dispatch({ type: 'SET_PROJECT_NAME', payload: name });
  };

  const resetAll = () => {
    dispatch({ type: 'RESET_ALL' });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        setFiles,
        setFileTree,
        setSelectedFile,
        setEngine,
        updatePipelineStage,
        addLog,
        setKagScripts,
        setAssetMap,
        setSpriteList,
        setOutputTab,
        toggleConsole,
        setProjectName,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

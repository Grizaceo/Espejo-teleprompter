// ============================================================================
// preload.ts — bridge seguro entre el renderer y el proceso main.
//
// Expone `window.api.onRenderModel(cb)` al renderer. El callback recibe el
// RenderModel cada vez que el StateStore emite una actualización (~10 Hz).
// Devuelve una función para desuscribirse (limpieza en useEffect).
// ============================================================================

import { contextBridge, ipcRenderer } from 'electron';
import type { RenderModel, DesktopApi } from '../src/types';

const api = {
  onRenderModel: (cb: (model: RenderModel) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, model: RenderModel): void => {
      cb(model);
    };
    ipcRenderer.on('render:model', listener);
    return () => {
      ipcRenderer.removeListener('render:model', listener);
    };
  },

  // Window controls
  minimize: (): Promise<{ ok: boolean }> => ipcRenderer.invoke('window:minimize'),
  close: (): Promise<{ ok: boolean }> => ipcRenderer.invoke('window:close'),
  setSize: (width: number, height: number): Promise<{ ok: boolean }> => ipcRenderer.invoke('window:setSize', width, height),
  getSize: (): Promise<{ ok: boolean; width: number; height: number }> => ipcRenderer.invoke('window:getSize'),

  loadLyrics: (title: string, artist: string): Promise<{ ok: boolean; error?: string }> =>
    ipcRenderer.invoke('lyrics:load', title, artist),

  setRecognitionPhase: (phase: 'LISTENING' | 'IDENTIFYING' | null): Promise<{ ok: boolean }> =>
    ipcRenderer.invoke('recognition:setPhase', phase),

  identifyAudio: (
    audio: ArrayBuffer,
    mimeType: string,
    recordStartedAt: number,
  ): Promise<{ ok: boolean; matched: boolean; error?: string }> =>
    ipcRenderer.invoke('recognition:identify', audio, mimeType, recordStartedAt),

  stopRecognition: (): Promise<{ ok: boolean }> => ipcRenderer.invoke('recognition:stop'),
};

contextBridge.exposeInMainWorld('api', api);

export type { DesktopApi };
export type PreloadApi = typeof api;

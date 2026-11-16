const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gameAPI', {
  saveCharacter: (character) => ipcRenderer.invoke('character:save', character),
  loadCharacter: (id) => ipcRenderer.invoke('character:load', id),
  deleteCharacter: (id) => ipcRenderer.invoke('character:delete', id),
  listCharacters: () => ipcRenderer.invoke('character:list'),
  applyWindowOptions: (options) => ipcRenderer.invoke('window:apply-options', options)
});

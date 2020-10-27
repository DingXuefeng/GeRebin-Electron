const { contextBridge, ipcRenderer } = require("electron");
let validSendChannels = ["toMain"];
let validReceiveChannels = ["fromMain"];

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
console.log("in the preload");
contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, data) => {
      if (validSendChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      if (validReceiveChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);


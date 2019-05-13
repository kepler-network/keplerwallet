var fs = require('fs');
import path from 'path';
import { app, remote } from 'electron';
import os from 'os'

let appRootDir = require('app-root-dir').get().replace('app.asar', '').replace(/(\s+)/g, '\\$1');
export const rootDir = require('app-root-dir').get()
function getPlatform(){
    switch (os.platform()) {
        case 'aix':
        case 'freebsd':
        case 'linux':
        case 'openbsd':
        case 'android':
          return 'linux';
        case 'darwin':
        case 'sunos':
          return 'mac';
        case 'win32':
          return 'win';
      }
}

export const platform = getPlatform()

const IS_PROD = process.env.NODE_ENV === 'production';
const root = process.cwd();
const APP = process.type === 'renderer' ? remote.app : app

const binariesPath =
  IS_PROD || APP.isPackaged
    ? path.join(process.resourcesPath, 'bin', platform)
    : path.join(root, 'resources', 'bin', platform);

const keplerBinaries = platform==='win'?'kepler.exe':'kepler'
export let keplerPath = path.join(binariesPath, keplerBinaries)
if(platform=='win'){
  keplerPath = '"' + path.resolve(keplerPath) + '"' 
}
export const chainType = 'main'
export const keplerNode = "http://node.keplerwallet.org:7413"
export const seedPath = path.join(APP.getPath('home'), '.kepler', chainType, 'wallet_data/wallet.seed')
export const walletTOMLPath = path.join(APP.getPath('home'), '.kepler', chainType, 'kepler-wallet.toml')
export const apiSecretPath = path.join(APP.getPath('home'), '.kepler', chainType, '.api_secret')
export const kwPath = path.join(APP.getPath('home'), '.keplerwallet')
export const logDir = path.join(kwPath, 'log')
export const configPath = path.join(kwPath, 'config.json')

export const releaseUrl = 'https://api.github.com/repos/xiaojay//keplerwallet/releases/latest'
export const downloadUrl = 'https://github.com/xiaojay/keplerwallet/releases/latest'

export function getConfig(){
  try{
    return JSON.parse(fs.readFileSync(configPath))
  }catch (e) {
    return {}
  }
}

export function setConfig(options){
  return fs.writeFileSync(configPath, JSON.stringify(options))
}

export function updateConfig(options){
  let options_ = getConfig()
  for(var key in options){
    options_[key] = options[key]
  }
  setConfig(options_)
}

//export const logLevel = getConfig()['debug']?'debug':'info'
export const logLevel = 'debug'

export const hedwigServer = 'https://v1.hedwig.im'
export const hedwigClient =  
  IS_PROD || APP.isPackaged
    ? path.resolve(path.join(process.resourcesPath, 'bin', 'hedwig', 'client.js'))
    : path.resolve(path.join(root, 'hedwig', 'client.js'))

export const hedwigApp = 'Niffler'
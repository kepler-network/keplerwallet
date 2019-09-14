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
const keplerWalletBinaries = platform==='win'?'kepler-wallet.exe':'kepler-wallet'

export let  keplerPath = path.join(binariesPath, keplerBinaries)
export let keplerWalletPath = path.join(binariesPath, keplerWalletBinaries)

if(platform=='win'){
  keplerPath = '"' + path.resolve(keplerPath) + '"' 
  keplerWalletPath = '"' + path.resolve(keplerWalletPath) + '"' 
}
export const chainType = 'main'
export const keplerDIR = path.join(APP.getPath('home'), '.kepler')
export const seedPath = path.join(APP.getPath('home'), '.kepler', chainType, 'wallet_data/wallet.seed')
export const nodeTOMLPath = path.join(APP.getPath('home'), '.kepler', chainType, 'kepler-server.toml')
export const walletTOMLPath = path.join(APP.getPath('home'), '.kepler', chainType, 'kepler-wallet.toml')
export const walletPath = path.join(APP.getPath('home'), '.kepler', chainType)
export const walletDataPath = path.join(APP.getPath('home'), '.kepler', chainType, 'wallet_data')
export const walletLogPath = path.join(APP.getPath('home'), '.kepler', chainType, 'kepler-wallet.log')
export const apiSecretPath = path.join(APP.getPath('home'), '.kepler', chainType, '.api_secret')
export const kwPath = path.join(APP.getPath('home'), '.keplerwallet')
export const logDir = path.join(kwPath, 'log')
export const tempTxDir = path.join(kwPath, 'temp_tx')
export const keplerNodeLog = path.join(APP.getPath('home'), '.kepler', chainType, 'kepler-server.log')
export const chainDataPath = path.join(APP.getPath('home'), '.kepler', chainType, 'chain_data')

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

export const grinRsWallet =  
  IS_PROD || APP.isPackaged
    ? path.resolve(path.join(process.resourcesPath, 'bin', 'grinRs', 'wallet.js'))
    : path.resolve(path.join(root, 'grinRs', 'wallet.js'))

export const nodeExecutable =  
    IS_PROD || APP.isPackaged
      ? path.resolve(path.join(process.resourcesPath, 'bin', 'grinRs', 'node.exe'))
      : path.resolve(path.join(root, 'grinRs', 'node.exe'))

function getLocale(){
  let locale = getConfig()['locale']
  if(locale)return locale
  locale = APP.getLocale().toLowerCase()
  if(locale.startsWith('zh'))return 'zh'
  if(locale.startsWith('ru'))return 'ru'
  return 'en'
}
export function setLocale(locale){
  updateConfig({'locale':locale})
}
export const locale = getLocale()
export const langs = {'zh':'简体中文', 'en':'English', 'ru': 'русский'}


import pkg from '../../package.json'
export const version = pkg.version

export const defaultGnodeOptions= {
  'useLocalGnode': true,
  //connnectMethod: localFirst, remoteFirst, localAllTime, remoteAllTime
  'connectMethod':'remoteFirst',
  'remoteAddr': 'http://node.keplerwallet.org:7413',
  'localAddr': 'http://127.0.0.1:7413',
  'background': true
}
export const gnodeOption = getConfig()['gnode']?getConfig()['gnode']: defaultGnodeOptions

export const keplerNode = gnodeOption.remoteAddr
export const keplerNode2 = gnodeOption.remoteAddr
export const keplerLocalNode = gnodeOption.localAddr
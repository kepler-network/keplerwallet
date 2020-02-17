import fs from 'fs'
import {exec, execFile} from 'child_process'

import axios from 'axios'
require('promise.prototype.finally').shim();

import log from './logger'
import {gnodeOption, keplerPath, nodeApiSecretPath, nodeTOMLPath, platform, keplerNode} from './config'

import { messageBus } from '../renderer/messagebus'

let client
let clietForRemote
let gnodeProcess
const gnodeHost = 'http://localhost:7413'

const gnodeRemoteHost = keplerNode

function disableTUI(){
    const re = /run_tui(\s)*=(\s)*true/
    if(fs.existsSync(nodeTOMLPath)){
        let c = fs.readFileSync(nodeTOMLPath).toString()
        if(c.search(re) != -1){
            log.debug('Disable tui.')
            c = c.replace(re, 'run_tui = false')
            fs.writeFileSync(nodeTOMLPath, c)
        }
    }
}

function enableArchiveMode(){
    const re = /archive_mode(\s)*=(\s)*false/
    if(fs.existsSync(nodeTOMLPath)){
        let c = fs.readFileSync(nodeTOMLPath).toString()
        if(c.search(re) != -1){
            log.debug('enable archive_mode.')
            c = c.replace(re, 'archive_mode = true')
            fs.writeFileSync(nodeTOMLPath, c)
        }
    }
}

class GnodeService {
    static initClient() {
        if(fs.existsSync(nodeApiSecretPath)){
            client = axios.create({
                baseURL: gnodeHost,
                auth: {
                    username: 'kepler',
                    password: fs.readFileSync(nodeApiSecretPath).toString()
                },
            })
        }else{
            client = axios.create({baseURL: gnodeHost})
        }	        
    }
    static getStatus(){
        return client.get('/v1/status')
    }
    static getPeersConnected(){
        return client.get('/v1/peers/connected')
    }

    static startGnode(){
        disableTUI()
        //enableArchiveMode()
        if(platform === 'linux'){
            gnodeProcess = execFile(keplerPath) 
        }else{
            gnodeProcess = exec(keplerPath) 
        }
        log.debug('gnodeProcess PID: ' + gnodeProcess.pid)
        if(platform==='win'){
            localStorage.setItem('gnodeProcessPID', gnodeProcess.pid)
        }
        gnodeProcess.stderr.on('data', (data) => {
            log.error('start kepler node got stderr: ' + data)
        })
        messageBus.$emit('gnodeStarting')
    }

    static stopGnode(){
        let pidName = 'gnodeProcessPID'
        const pid = localStorage.getItem(pidName)
        log.debug(`try to kill gnode process with pid (get from ${pidName}) : ${pid}`)
        localStorage.removeItem(pidName)

        if(platform==='win'&&pid){
            return exec(`taskkill /pid ${pid} /f /t`)
        }
        
        if(gnodeProcess){
            gnodeProcess.kill('SIGKILL')
            log.debug("killing gnodeProcess by gnodeProcess.kill('SIGKILL'). ")
        }
        if(pid) {
            try{
                process.kill(pid, 'SIGKILL')
            }catch(e){
                log.error(`error when kill ${processName} ${pid}: ${e}` )
            }
        }
    }

    static stopGnode2(){
        if(process.platform!=='win32'){
            exec('pkill kepler$')
        }else{
            exec('taskkill -f /im kepler.exe')
        }
    }

    static restartGnode(){
        GnodeService.stopGnode2()
        setTimeout(()=>GnodeService.startGnode(), 2000)
    }
}
GnodeService.initClient()
export default GnodeService

export class RemoteGnodeService{
    static initClient(nodeURL, apiSecret) {
        if(apiSecret){
            clietForRemote = axios.create({
                    baseURL: nodeURL,
                    auth: {
                        username: 'kepler',
                        password: apiSecret
                    },
                })
        }else{
            clietForRemote = axios.create({baseURL: nodeURL})
        }
    }
    static getStatus(){
        return clietForRemote.get('/v1/status')
    }
}
RemoteGnodeService.initClient(gnodeRemoteHost, null)

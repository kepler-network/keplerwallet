import fs from 'fs'
const path = require('path');
import {exec, execFile} from 'child_process'

import axios from 'axios'
require('promise.prototype.finally').shim();

import log from './logger'
import {platform, keplerPath, seedPath, keplerNode, chainType, apiSecretPath, walletTOMLPath} from './config'
import { messageBus } from '../renderer/messagebus'

let ownerAPI
let listenProcess
let client
let password_
const wallet_host = 'http://localhost:3420'
const jsonRPCUrl = 'http://localhost:3420/v2/owner'

function enableForeignApi(){
    const re = /owner_api_include_foreign(\s)*=(\s)*false/
    let c = fs.readFileSync(walletTOMLPath).toString()
    if(c.search(re) != -1){
        log.debug('Enable ForeignApi to true')
        c = c.replace(re, 'owner_api_include_foreign = true')
        fs.writeFileSync(walletTOMLPath, c)
    }
}

function execPromise(command) {
    return new Promise(function(resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
}

class WalletService {
    static initClient() {
        if(fs.existsSync(apiSecretPath)){
            client = axios.create({
                baseURL: wallet_host,
                auth: {
                    username: 'kepler',
                    password: fs.readFileSync(apiSecretPath).toString()
                },
            })
        }
    }
    
    static setPassword(password){
        password_ = password
    }

    static jsonRPC(method, params){
        const headers = {
            'Content-Type': 'application/json'
        }
        const body = {
            jsonrpc: "2.0",
            id: +new Date(),
            method: method,
            params: params,
        }
        return client.post(jsonRPCUrl, body, headers)
    }
    
    static getNodeHeight(){
        if(client){
            return client.get('/v1/wallet/owner/node_height')
        }
    }

    static getNodeHeight2(){
        return WalletService.jsonRPC('node_height', [])
    }
    
    static getSummaryInfo(minimum_confirmations){
        const url = `/v1/wallet/owner/retrieve_summary_info?refresh&minimum_confirmations=${minimum_confirmations}`
        return client.get(url)
    }
    static getTransactions(){
        return client.get('/v1/wallet/owner/retrieve_txs?refresh')
    }
    static getCommits(show_spent=true){
        const url = show_spent?
            '/v1/wallet/owner/retrieve_outputs?refresh&show_spent':
            '/v1/wallet/owner/retrieve_outputs?refresh'
        return client.get(url)
    }
    static cancelTransactions(tx_id){
        const url = `/v1/wallet/owner/cancel_tx?tx_id=${tx_id}`
        return client.post(url)
    }
    static receiveTransaction(tx_data){
        return client.post('/v1/wallet/foreign/receive_tx', tx_data)
    }
    static issueSendTransaction(tx_data){
        return client.post('/v1/wallet/owner/issue_send_tx', tx_data)
    }
    static issueSendTransaction2(tx_data){
        return WalletService.jsonRPC('initiate_tx', tx_data)
    }
    static finalizeTransaction(tx_data){
        return client.post('/v1/wallet/owner/finalize_tx', tx_data)
    }
    static postTransaction(tx_data, isFluff){
        const url = isFluff?
            '/v1/wallet/owner/post_tx?fluff':
            '/v1/wallet/owner/post_tx'
        return client.post(url, tx_data)
    }

    static start(password){
        WalletService.stop()
        enableForeignApi()

        if(platform === 'linux'){
            ownerAPI = execFile(keplerPath, ['wallet', '-r', keplerNode, 'owner_api']) 
        }else{
            const cmd = platform==='win'? `${keplerPath} wallet -r ${keplerNode} --pass ${password} owner_api`:
                                        `${keplerPath} wallet -r ${keplerNode} owner_api`
            //log.debug(`platform: ${platform}; start owner api cmd: ${cmd}`)
            ownerAPI =  exec(cmd)
        }

        if(platform==='win'){
            localStorage.setItem('OwnerAPIPID', ownerAPI.pid)
        }

        ownerAPI.stdout.on('data', (data)=>{
            if(platform!='win'){ownerAPI.stdin.write(password+'\n')}
            localStorage.setItem('OwnerAPIPID', ownerAPI.pid)
        })
        ownerAPI.stderr.on('data', (data) => {
            log.error('start owner_api got stderr: ' + data)
        })
    }

    static stop(){
        const pid = localStorage.getItem('OwnerAPIPID')
        localStorage.removeItem('OwnerAPIPID')
        if(platform==='win'&&pid){
            return exec(`taskkill /pid ${pid} /f /t`)
        }

        if(ownerAPI){
            ownerAPI.kill('SIGKILL')
            log.debug('kill owner_api')
        }
      
        if(pid) {
            try{
                process.kill(pid, 'SIGKILL')
            }catch(e){
                log.error(`error when kill ownerApi ${pid}: ${e}` )
            }
        }
    }
    
    static startListen(password=password_){
        WalletService.stopListen()
        if(platform==='linux'){
            listenProcess =  execFile(keplerPath, ['wallet', '-e', 'listen']) 
        }else{
            const cmd = platform==='win'? `${keplerPath} wallet -e --pass ${password} listen`:
                                        `${keplerPath} wallet -e listen`
            //log.debug(`platform: ${platform}; start listen cmd: ${cmd}`)
            listenProcess =  exec(cmd)
        }
        
        if(platform==='win'){
            localStorage.setItem('listenProcessPID', listenProcess.pid)
        }

        listenProcess.stdout.on('data', (data)=>{
            if(platform!='win'){
                listenProcess.stdin.write(password+'\n')
            }
            localStorage.setItem('listenProcessPID', listenProcess.pid)
        })
        listenProcess.stderr.on('data', (data) => {
            log.error('start wallet listen got stderr: ' + data)
        })
    }

    static stopListen(){
        const pid = localStorage.getItem('listenProcessPID')
        localStorage.removeItem('listenProcessPID')

        if(platform==='win'&&pid){
            return exec(`taskkill /pid ${pid} /f /t`)
        }
        
        if(listenProcess){
            listenProcess.kill('SIGKILL')
            log.debug('kill wallet listen process')
        }
        if(pid) {
            try{
                process.kill(pid, 'SIGKILL')
            }catch(e){
                log.error(`error when kill listen process ${pid}: ${e}` )
            }
        }
    }
    static stopAll(){
        WalletService.stop()
        WalletService.stopListen()
    }
    static isExist(){
        return fs.existsSync(seedPath)?true:false
    }

    static new(password){
        const cmd = platform==='win'? `${keplerPath} wallet -r ${keplerNode} --pass ${password} init`:
                                      `${keplerPath} wallet -r ${keplerNode} init`
        log.debug(`function new: platform: ${platform}; kepler bin: ${keplerPath}; kepler node: ${keplerNode}`); 
        let createProcess = exec(cmd)
        createProcess.stdout.on('data', (data) => {
            var output = data.toString()
            //log.debug('init process return: '+output)
            if (output.includes("Please enter a password for your new wallet")){
                log.debug('function new: time to entry password.')
                createProcess.stdin.write(password + "\n");
                createProcess.stdin.write(password + "\n");
            }
            if(output.includes("Invalid Arguments: Not creating wallet - Wallet seed file exists")){
                log.debug('function new: walletExisted')
                return messageBus.$emit('walletExisted')
            }
            if(output.includes("Please back-up these words in a non-digital format.")){
                var wordSeed = data.toString();
                
                wordSeed = wordSeed.replace("Your recovery phrase is:","");
                wordSeed = wordSeed.replace("Please back-up these words in a non-digital format.","");
                
                wordSeed = wordSeed.replace(/(\r\n|\n|\r)/gm, "");
                wordSeed = wordSeed.replace("wallet.seed","wallet.seed ==   ");
                var wordSeedWithLog = wordSeed;
                var wordSeedWithoutLog = wordSeedWithLog.substring(wordSeedWithLog.indexOf("==")+1);
                wordSeedWithoutLog = wordSeedWithoutLog.trim();
                wordSeedWithoutLog = wordSeedWithoutLog.replace("= ","").trim();
                //log.debug(`wordSeed: ${wordSeed}; wordSeedWithoutLog: ${wordSeedWithoutLog}`)
                log.debug(`function new: walletCreated with seed of length ${wordSeedWithoutLog.length}.`)
                return messageBus.$emit('walletCreated', wordSeedWithoutLog)
            }
        })
        createProcess.stderr.on('data', (data) => {
            log.error('Process:init new wallet got stderr: ' + data)
            return messageBus.$emit('walletCreateFailed', data)
        })
    }

    static send(amount, method, dest, version){
        const cmd = `${keplerPath} wallet -r ${keplerNode} -p ${password_} send -m ${method} -d ${dest} -v ${version} ${amount}`
        log.debug(cmd)
        return execPromise(cmd)
    }

    static finalize(fn){
        const cmd = `${keplerPath} wallet -r ${keplerNode} -p ${password_} finalize -i ${fn}`
        return execPromise(cmd)
    }

}
WalletService.initClient()
export default WalletService
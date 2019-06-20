import fs from 'fs'
const fse = require('fs-extra')
const path = require('path');
import {exec, execFile, spawn, fork} from 'child_process'

import axios from 'axios'
require('promise.prototype.finally').shim();

import log from './logger'
import {platform, keplerPath, seedPath, keplerNode, keplerNode2, chainType, apiSecretPath, walletTOMLPath, walletPath, grinRsWallet, nodeExecutable, tempTxDir} from './config'
import { messageBus } from '../renderer/messagebus'

let ownerAPI
let listenProcess
let checkProcess
//let initRProcess
let restoreProcess
let processes = {}
let client
let password_
const wallet_host = 'http://localhost:7420'
const jsonRPCUrl = 'http://localhost:7420/v2/owner'

function enableForeignApi(){
    const re = /owner_api_include_foreign(\s)*=(\s)*false/
    if(fs.existsSync(walletTOMLPath)){
        let c = fs.readFileSync(walletTOMLPath).toString()
        if(c.search(re) != -1){
            log.debug('Enable ForeignApi to true')
            c = c.replace(re, 'owner_api_include_foreign = true')
            fs.writeFileSync(walletTOMLPath, c)
        }
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

function addQuotations(s){
    return '"' + s +'"'
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

    static passwordUndefined(){
        if(!password_)return true
        return false
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
        WalletService.stopProcess('ownerAPI')
        enableForeignApi()

        if(platform === 'linux'){
            ownerAPI = execFile(keplerPath, ['-r', keplerNode, 'owner_api']) 
        }else{
            const cmd = platform==='win'? `${keplerPath} -r ${keplerNode} --pass ${addQuotations(password)} owner_api`:
                                        `${keplerPath} -r ${keplerNode} owner_api`
            //log.debug(`platform: ${platform}; start owner api cmd: ${cmd}`)
            ownerAPI =  exec(cmd)
        }
        processes['ownerAPI'] = ownerAPI
        log.debug('ownerAPIProcessPID: ' + ownerAPI.pid)
        if(platform==='win'){
            localStorage.setItem('ownerAPIProcessPID', ownerAPI.pid)
        }

        ownerAPI.stdout.on('data', (data)=>{
            if(platform!='win'){ownerAPI.stdin.write(password+'\n')}
            localStorage.setItem('ownerAPIProcessPID', ownerAPI.pid)
        })
        ownerAPI.stderr.on('data', (data) => {
            log.error('start owner_api got stderr: ' + data)
        })
    }

    static startListen(password=password_){
        WalletService.stopProcess('listen')
        if(platform==='linux'){
            listenProcess =  execFile(keplerPath, ['-e', 'listen']) 
        }else{
            const cmd = platform==='win'? `${keplerPath} -e --pass ${addQuotations(password)} listen`:
                                        `${keplerPath} -e listen`
            //log.debug(`platform: ${platform}; start listen cmd: ${cmd}`)
            listenProcess =  exec(cmd)
        }
        processes['listen'] = listenProcess
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

    static stopAll(){
        for(var ps in processes){
            log.debug('stopall ps: '+ ps)
            if(processes[ps]){
                log.debug('stopall try to kill '+ ps)
                WalletService.stopProcess(ps)
            }
        }
    }
    static isExist(){
        return fs.existsSync(seedPath)?true:false
    }

    static new(password){
        const cmd = platform==='win'? `${keplerPath} -r ${keplerNode} --pass ${addQuotations(password)} init`:
                                      `${keplerPath} -r ${keplerNode} init`
        log.debug(`function new: platform: ${platform}; kepler bin: ${keplerPath}; kepler node: ${keplerNode}`); 
        let createProcess = exec(cmd)
        createProcess.stdout.on('data', (data) => {
            let output = data.toString()
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
        let dest_ = '"' + path.resolve(dest) + '"'
        const cmd = `${keplerPath} -r ${keplerNode} -p ${addQuotations(password_)} send -m ${method} -d ${dest_} -v ${version} ${amount}`
        //log.debug(cmd)
        return execPromise(cmd)
    }

    static createSlate(amount, version){
        fse.ensureDirSync(tempTxDir)

        return new Promise(function(resolve, reject) {
            let fn = path.join(tempTxDir, String(Math.random()).slice(2) + '.temp.tx')
            WalletService.send(amount, 'file', fn, version).then((data)=>{
                fs.readFile(fn, function(err, buffer) {
                    if (err) return reject(err)
                    //fse.remove(fn)
                    return resolve(JSON.parse(buffer.toString()))
                });
            }).catch((err)=>{
                return reject(err)
            })
        })
    }

    static finalize(fn){
        let fn_ = '"' + path.resolve(fn) + '"'
        const cmd = `${keplerPath} -r ${keplerNode} -p ${addQuotations(password_)} finalize -i ${fn_}`
        //log.debug(cmd)
        return execPromise(cmd)
    }

    static finalizeSlate(slate){
        let fn = path.join(tempTxDir, String(Math.random()).slice(2) + '.temp.tx.resp')
        fs.writeFileSync(fn, JSON.stringify(slate))
        return WalletService.finalize(fn)
    }

    static recover(seeds, password){
        if(platform==='win'){
            return  WalletService.recoverOnWindows(seeds, password)
        }
        let rcProcess
        let args = ['--node_api_http_addr', keplerNode, 'node_api_secret_path', path.resolve(apiSecretPath),
            '--wallet_dir', path.resolve(walletPath), '--seeds', seeds,
            '--password', password]
        try{
            rcProcess = fork(grinRsWallet, args)
        }catch(e){
            return log.error('Error during fork to recover: ' + e )
        }
        rcProcess.on('message', (data) => {
            let ret = data['ret']
            log.debug('Recover message: ' + ret)
            messageBus.$emit('walletRecoverReturn', ret)
        });
          
        rcProcess.on('error', (err) => {
            log.error(`Recover stderr: ${err}`);
          });
          
        rcProcess.on('exit', (code, sginal) => {
            log.debug(`Recover exit: ${code}`);
        });
    }

    static recoverOnWindows(seeds, password){
        let args = [grinRsWallet, '--node_api_http_addr', keplerNode2,
            '--node_api_secret_path', path.resolve(apiSecretPath),
            '--wallet_dir', path.resolve(walletPath), 
            '--seeds', seeds, '--password', password]
        let rcProcess = spawn(nodeExecutable, args)
        rcProcess.stdout.on('data', function(data){
            let output = data.toString().trim()
            log.debug('rcProcess stdout:', output)
            let msg
            if(output ==='success'){
                msg = 'ok'
            }else if(output ==='"BIP39 Mnemonic (word list) Error"'){
                msg = 'invalidSeeds'
            }else{
                msg = data
            }
            log.debug('msg', msg)
            messageBus.$emit('walletRecoverReturn', msg)
        })
        rcProcess.stderr.on('data', function(data){
            let output = data.toString()
            log.debug('rcProcess stderr:', output)
        })
    }

    static check(cb){
        let k = keplerPath
        if(platform==='win'){
            k = keplerPath.slice(1,-1)
        }
        checkProcess = spawn(k, ['-r', keplerNode2, '-p', password_, 'check']);

        let ck = checkProcess
        processes['check'] = checkProcess
        localStorage.setItem('checkProcessPID', checkProcess.pid)

        ck.stdout.on('data', function(data){
            let output = data.toString()
            cb(output)
        })
        ck.stderr.on('data', function(data){
            let output = data.toString()
            cb(output)
        })
        ck.on('close', function(code){
            log.debug('kepler wallet check exists with code: ' + code);
            if(code==0){return messageBus.$emit('walletCheckFinished')}
        });
    }

    static restore(password, cb){
        let k = keplerPath
        if(platform==='win'){
            k = keplerPath.slice(1,-1)
        }
        restoreProcess = spawn(k, ['-r', keplerNode2, '-p', password, 'restore']);
        let rs = restoreProcess
        processes['restore'] = restoreProcess
        localStorage.setItem('restoreProcessPID', restoreProcess.pid)
        
        log.debug('kepler wallet restore process running with pid: ' + restoreProcess.pid);

        rs.stdout.on('data', function(data){
            let output = data.toString()
            cb(output)
        })
        rs.stderr.on('data', function(data){
            let output = data.toString()
            cb(output)
        })
        rs.on('close', function(code){
            log.debug('kepler wallet restore exists with code: ' + code);
            if(code==0){return messageBus.$emit('walletRestored')}
        });
    }


    static stopProcess(processName){
        let pidName = `${processName}ProcessPID`
        const pid = localStorage.getItem(pidName)
        log.debug(`try to kill ${processName} with pid (get from ${pidName}) : ${pid}`)
        localStorage.removeItem(pidName)

        if(platform==='win'&&pid){
            return exec(`taskkill /pid ${pid} /f /t`)
        }
        
        if(processes[processName]){
            processes[processName].kill('SIGKILL')
            log.debug(`kill ${processName}`)
        }
        if(pid) {
            try{
                process.kill(pid, 'SIGKILL')
            }catch(e){
                log.error(`error when kill ${processName} ${pid}: ${e}` )
            }
        }
    }
}
WalletService.initClient()
export default WalletService
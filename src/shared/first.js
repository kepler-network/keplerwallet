var fs = require('fs');
import { kwPath, logDir, getConfig, setConfig, updateConfig} from './config';

export function checkFirstTime(){
    console.log(kwPath)
    const isFirstTime = fs.existsSync(kwPath)?false:true
    if(isFirstTime){
        fs.mkdirSync(kwPath)
        fs.mkdirSync(logDir)
        setConfig({'firstTime':true})
    }
    else{
        updateConfig({'firstTime':false})
    }
}

export function isFirstTime(){
    return getConfig()['firstTime']
}


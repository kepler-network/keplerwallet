var fs = require('fs');
import { kwPath, logDir, getConfig, setConfig, updateConfig, tempTxDir, defaultGnodeOptions} from './config';

export function checkFirstTime(){
    const isFirstTime = fs.existsSync(kwPath)?false:true
    if(isFirstTime){
        fs.mkdirSync(kwPath)
        fs.mkdirSync(logDir)
        fs.mkdirSync(tempTxDir)
        setConfig({'firstTime':true})
        setConfig({'gnode': defaultGnodeOptions})
    }
    else{
        updateConfig({'firstTime':false})
    }
}

export function isFirstTime(){
    return getConfig()['firstTime']
}


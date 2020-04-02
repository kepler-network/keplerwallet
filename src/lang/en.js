const messages = {
  msg: {
    title: 'Kepler Wallet',
    password: 'Password',
    passwordAgain: 'Enter password again',
    wrongPassword: 'Failed to start Kepler owner api. May be Wrong password',
    login_: 'Login',
    logout: 'Logout',
    search: 'Search',
    clearup: 'Clearup',
    jump: 'Jump',

    confirmed: 'Confirmed',
    unconfirmed: 'Unconfirmed',
    locked: 'Locked',
    
    send: 'Send',
    receive: 'Receive',

    cancel:'Cancel',
    save: 'Save',

    welcome: 'Welcome to use Kepler wallet',
    back: 'Back',
    msg: 'Message',
    more: 'More',

    remote: 'remote',
    local: 'local',
    node: 'Node',
    remoteNode: 'Remote node',
    localNode: 'Local node',
    other: 'Others',
    loading: 'Updating status from Kepler node ...',

    login: {
      walletExist: 'Found kepler wallet data exists; login with original password :-)',
    },
    remove:{
      title: 'Remove Current Wallet',
      warning: 'Warning !',
      info: 'Before you remove current wallet, Make sure there is no kepler in this wallet or You write down the Seed Phrase !',
      help: 'Enter "remove" into the input box below to confirm',
      remove: 'Remove',
      success: 'Current wallet was removed. Click "OK" to restart KeplerWallet.'
    },

    create:{
      seedPhrase: 'Seed Phrase',
      toNewMsg: 'No wallet exists Found. Create a New One.',
      newWallet: 'Create new wallet',
      backupNote: 'Import！Please backup your seed phrase to restore your wallet',
      backupFinish: 'Ok, I backed up my seed phrase. Close wallet, then open it again',
      errorPasswdEmpty: 'Password cannot be empty',
      errorPasswdConsistency: 'Please enter the same password',
      errorCreateFailed: 'Error when try to create new wallet. Maybe restart wallet and Try it later.',
    },

    new_:{
      create: 'Create new wallet',
      restore: 'Restore wallet via seed phrase',
      import: 'Import wallet backup file'
    },
    
    restore:{
      seedPhrase: 'Seed Phrase',
      title: 'Restore wallet via seed phrase',
      addSeedsInfo: 'Add seed phrase one by one please',
      add: 'Add',
      invalid: 'Invalid Seed Phrase',
      failed: 'Recover wallet from seeds failed',
      delete: 'Delete',
      added: 'Finish enter seed phrase',
      newPassword: 'Set a new password',
      recover: 'Recover',
      reAdd: 'Re-enter seed phrase ',
      recovered: 'Wallet recovered, it is time to check balance from kepler blockchain',
      restoring: 'It will take 10-30 minutes to finish check. Be patient ......',
      restored: 'Wallet recovered and balance checked.',
      login: 'Close Wallet, then Open it again to Login',
    },

    app:{
      create: 'Create transaction file',
      finalize: 'Finalize',
      httpSend: 'Send via http/https',
      createRespFile: 'Create response transaction file',
      httpReceive: 'Open http listener to receive',
      height:'Height',
      updateTitle: 'Found new version',
      updateMsg: 'Found new version of Kepler wallet. Please update Right NOW.',
      yes: 'yes',
      no: 'no',
      hedwig: 'Receive via Hedwig'
    },

    info: {
      spendable: 'Spendable',
      total: 'Total',
      unfinalization: 'Unfinalization',
      immature: 'Immature',
    },

    txs:{
      tx: 'Transactions',
      canceled:'Canceled',
      noTxFound: 'No transactions Found',
      noTx:'No transactions',
      cancelSuccess:'This transaction canceled',
      CreateFailed: 'Failed to create new transcation file',
      NotEnough: 'Not enough amount. Keep 0.01 as fee'
    },

    commit:{
      unspentCmt: 'Unspent Output Commit',
      heightCreated: 'Block height when Created',
      unspent: 'Unspent',
      spent: 'Spent',
      noCmtFound: 'No Unspent Output Commit Found',
      noCmt:'No Unspent Output Commit',
      copied: 'Copied'
    },

    fileSend:{
      sendAmount: 'Amount to send',
      createTxFile: 'Create new transcation file',
      WrongAmount: 'Wrong amount',
      saveMsg: 'Save transcation file created',
      CreateFailed: 'Failed to create new transcation file'
    },

    httpSend:{
      sendAmount: 'Amount to send',
      sendMessage: 'Message',
      optional: 'optional',
      address:'Address',
      WrongAmount: 'Wrong amount',
      NotEnough: 'Not enough amount. Keep 0.01 as fee',
      WrongAddress: 'Wrong address',
      WrongTxData: 'Failed to build transaction',
      success: 'Transcation success',
      TxFailed: 'Send transcation failed',
      TxResponseFailed: 'Failed to get right respose from receiver',
      TxCreateFailed: 'Create transcation failed',
      salteVersion: 'Slate file version',
      salteVersionHelp: 'If you failed to send kepler, try change the Slate file version then resend'
    },

    fileReceive: {
      dropMsg: 'Drop transaction file received',
      WrongFileType: 'Wrong transaction file type',
      saveMsg: 'Save response transaction file created',
      CreateFailed: 'Failed to create new response transcation file',
      NoSavePlace: 'Please choose the location to save',
    },

    finalize: {
      finalize: 'Finalize',
      success: 'Transcation success',
      ok:'OK',
      sending: 'Sending',
      dropMsg: 'Drop response transaction file to finalize',
      WrongFileType: 'Wrong transaction file type',
      TxFailed: 'transcation failed',
    },

    httpReceive: {
      launchSucess: 'Started successful',
      listening: "Wallet's HTTP listen is running",
      address: 'Wallet Address',
      reachableMsg2: 'Make sure your ip is reachable by internet user',
      close: 'Stop listen',
      attention: 'Attention',
      reachableMsg: 'To start HTTP listen, you should have public ip, which is reachable by internet user.',
      password: 'Wallet Password (used to start HTTP listen)',
      start: 'Start',
      error: 'No password.',
      failed: 'Start Failed, Maybe wrong password',
      failed2: 'HTTP listen failed, your public ip could not reachable by internet user. Try trascation file Or Hedwig.',
      failed3: 'Failed to get your public ip; try it later',
      failed4: 'Localhost http listen is running(http://127.0.0.1:7415). Howerver, your public ip could not reachable by internet user. Try trascation file Or Hedwig.',
      ip: 'your public ip'
    },

    hedwig: {
      title: 'Receive via Hedwig(v1)',
      launchSucess: 'Started successful',
      reachable: 'Hedwig address is available',
      address: 'Address to receive',
      tip:'Please keep wallet online.',
      close: 'Stop Hedwig',
      introTitle: 'Introduction',
      intro1: 'Hedwig(v1) is a relay service for users without a public ip. It provides a temporary address to receive kepler.',
      intro2: 'When someone send kepler to the address, Hedwig(v1) will forward the send request to your wallet. So you will get your kepler.',
      start: 'Start',
      failed: 'Error when try to connect Hedwig server, try it latter maybe',
      failed2: 'Error when test Hedwig address, try it later maybe or restart wallet.',
      failed3: 'Failed to start local kepler receive service, try it later maybe or restart wallet.',
      copy: 'copy address',
      copied: 'address was copied in clipboard'
    },

    check: {
      title: 'Check Balance',
      checking: 'Checking, be patient ...',
      stop: 'Stop Check',

      tip:'It will take 10-30 minutes to finish check',
      introTitle: 'Introduction',

      intro1: 'Because of all of the possibilities listed in the cancel command, as well as the possibility of forks, it is quite possible for your wallet to end up in an inconsistent state',
      intro2: "For this reason, kepler provides a manual check command that scans the chain's UTXO set for any outputs belonging to your wallet, and ensures they're in a consistent state with your local wallet database.",
      
      start: 'Start',
      stopCheckMsg: 'Check was cancelled'
    },

    lang: {
      title: 'Select Language',
      lang: 'Language',
      select: 'Select'
    },

    gnode:{
      title: 'Local kepler node',
      tabStatus: 'Status',
      tabPeers: 'Peers',
      tabLog: 'Log',
      tabConfig: 'Settings',
      statusRunning: 'Running, Available',
      statusSyncing: 'Syncing ...',
      statusToStart: 'not Running',
      status:'Status',
      localRemoteHeight: 'Local Height/Networking Height',
      nodeVersion: 'Node Version',
      protocolVersion: 'Protocol Version',
      connectedCount: 'Connected Peers',
      location: 'Location where kepler blockchain data store',
      size: 'Size of kepler blockchain data',
      restart: 'Restart kepler node',
      height: 'height'
    },
      
    gnodeConfig:{
      warning: 'For General users, default setting is preferred!',
      useLocalorNot: '(Recommend)Use local  kepler node',
      connectMethod: 'Connect Method',
      remoteFirst: 'Remote kepler node is preferred, When remote node is not available, use local node.',
      localFirst:  '(Recommend)Local kepler node is preferred when it is synced. Otherwise, use remote node.',
      remoteAllTime: 'Use remote all the time',
      localAllTime: 'Use local all the time',
      background: '(Recommend)Running kepler node background when KeplerWallet is closed.',
      restoreToDefault: 'Restore to default setting',
      saved: 'Settings was saved, Restart KeplerWallet to take effect.'
    },
      
    gnodeConfigModal:{
      config: 'kepler Local Node Settings',
      title: 'kepler node settings'
    }
  }
}
export default messages

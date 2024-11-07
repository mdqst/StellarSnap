//import { OnRpcRequestHandler } from '@metamask/snap-types';



/**
 * This file defines all entry points for the snap.
 * this includes the onInstall, onRpcRequest, onUserInput, onCronJob and onHomePage functions
 * code cannot be executed without being called from one of these functions
 * 
 */
import type { OnInstallHandler, OnUserInputHandler,  OnRpcRequestHandler, OnHomePageHandler} from '@metamask/snaps-sdk';

import { Wallet, ImportAccountUI, showQrCode} from './Wallet';
import { fund, Client } from './Client';
import { TxnBuilder } from './TxnBuilder';
import { WalletFuncs } from './WalletFuncs';
import { Screens } from './screens';
import {lookupAddress, lookupFedAccount} from './federation'
import { NotificationEngine } from './notificationEngine';
import { OnCronjobHandler } from '@metamask/snaps-types';
import Utils from './Utils';
import { StateManager } from './stateManager';
import {getAssets, getDataPacket} from './assets';
import { Auth } from './Auth';
import HomeScreen from './screens/home';
import { sendXLM } from './screens/sendXLM';
import { renameAccountDialog } from './screens/renameAccount';
import { InteractionHandler } from './InteractionHandler';

export const onCronjob: OnCronjobHandler = async ({ request }) => {
  const wallet = await Wallet.getCurrentWallet();
  const mainnet_client = new Client("mainnet");
  const engine = new NotificationEngine(mainnet_client, wallet);
  switch (request.method) {
    case 'NotificationEngine':{
      console.log("notification check");
      await engine.checkForNotifications();
      return null;
    }
    default:
      throw new Error('Method not found.');
  }
};

export const onInstall: OnInstallHandler = async () => {
  const wallet = await Wallet.getCurrentWallet(false);
  await Screens.installedScreen(wallet);
};

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  InteractionHandler.setRequestOrigin(origin);
  if(request.method === "clearState"){
    console.log("clearing state");
    let confirm = await Screens.clearStateConfirmation();
    if(confirm){
      await StateManager.clearState();
    }
    else{
      return false;
    }
  }
  const wallet = await Wallet.getCurrentWallet();
  const params = request.params as any;
  let wallet_funded = false;
  let baseAccount;
  let testnet = false;
  const keyPair = wallet.keyPair;
  console.log("about to init client");
  const client = new Client();
  console.log("client init");
  console.log(request);
  console.log(params);
  if(params?.testnet && params?.futurenet){
    throw new Error("cannot use testnet and futurenet at the same time");
  }
  if(params?.testnet){
    console.log("testnet is true");
    client.setNetwork('testnet');
    testnet = true;
  }
  else if(params?.futurenet){
    console.log("futurenet is true");
    client.setNetwork('futurenet');
  }
  else{
    console.log("network is mainnet");
    client.setNetwork('mainnet');
  }
  try{
    console.log("attempting to get base account");
    baseAccount = await wallet.getBaseAccount(client);
    wallet_funded = true;
  }
  catch(e){
    console.log("Account not funded yet")
  }
  let txnBuilder: TxnBuilder;
  let operations: WalletFuncs | null;
  if(wallet_funded && baseAccount !== undefined){
    console.log("wallet funded");
    txnBuilder = new TxnBuilder(baseAccount, client);
    operations = new WalletFuncs(baseAccount, keyPair, txnBuilder, client);
  }
  else{
    operations = null;
  }
  
  switch (request.method) {
    // ------------------------------- Methods That Do not Require A funded Account ---------------------------------
    case 'getAddress':
      return wallet.address;
    case 'getCurrentAccount':
      return wallet.address;
    case 'getDataPacket':
      return await getDataPacket(wallet, client);
    case 'setCurrentAccount':
      //highlighted as entry point 1 for KYR-01-002 (Markdown and control characters) fix
      return await Wallet.setCurrentWallet(params.address, wallet.currentState);
    case 'showAddress':
      return await showQrCode(wallet);
    case 'createAccount':
      //highlighted as entry point 2 for KYR-01-002 (Markdown and control characters) fix
      return await Wallet.CreateNewAccountDialog(params.name); //returns simpleAccount object {name:string, address:string} also sets the current account to the created account
    case 'listAccounts':
      return await Wallet.listAccounts();
    case 'renameAccount':
      //highlighted as entry point 3 for KYR-01-002 (Markdown and control characters) fix
      return await renameAccountDialog(params.address);
    case 'importAccount':
      await ImportAccountUI(wallet.currentState);
      return true;
    case 'fund':
      console.log("fund called");
      return await fund(wallet);
    case 'getFederationName':
      const res = await lookupAddress(wallet.address);
      return res.stellar_address;
    case 'lookUpFedAccountByAddress':
        return await lookupAddress(params.address);
    case 'lookUpFedAccountByName':
        return await lookupFedAccount(params.url);
    case 'getBalance':
      if(!wallet_funded){
        return '0';
      }
      return await client.getBalance(wallet.address)
    case 'getAssets':
      return await getAssets(wallet, client);
    case 'sendAuthRequest':
      const auth_client = new Auth(wallet.keyPair);
      return await auth_client.signOnPost(params.url, params.data, params.challenge)
    case 'signStr':
      //highlighted as entry point 4 for KYR-01-002 (Markdown and control characters) fix
      const auth = new Auth(wallet.keyPair);
      return await auth.signData(params.challenge);
    case 'dispPrivateKey':
      return await Screens.revealPrivateKey(wallet);
    // -------------------------------- Methods That Require a funded Account ------------------------------------------
    case 'getAccountInfo':
      if(!wallet_funded){
        await Screens.RequiresFundedWallet(request.method, wallet.address);
        throw new Error('Method Requires Account to be funded');
      }
      return await client.getAccount(wallet.address)
    case 'transfer':
      if(!wallet_funded){
        await Screens.RequiresFundedWallet(request.method, wallet.address);
        throw new Error('Method Requires Account to be funded');
      }
      if(operations !== null){
        return await operations.transfer(params.to, params.amount);
      }

    case 'signTransaction':
      if(!wallet_funded){
        await Screens.RequiresFundedWallet(request.method, wallet.address);
        throw new Error('Method Requires Account to be funded');
      }
      if(operations !== null){
        const txn = await operations.signArbitaryTxn(params.transaction);
        return txn.toXDR();
      }

    case 'signAndSubmitTransaction':
      if(!wallet_funded){
        await Screens.RequiresFundedWallet(request.method, wallet.address);
      }
      if(operations !== null){
        return await operations.signAndSubmitTransaction(params.transaction);
      }

    case 'createFederationAccount':
      return await Screens.setUpFedAccount(wallet);


    case 'openSendXLM':
      /**
       * Mainly a test for future expansion shouldn't be used often, not really insured to work, but it should be safe
       * 
       * 
       */
      let dataPacket = await getDataPacket(wallet, client);
      console.log(operations);
      
      let interfaceId = await sendXLM(dataPacket, wallet, operations, testnet);
      let result = await Utils.openDialog(interfaceId);
      return result;
  

    default:
      throw new Error('Method not found.');
  }
};


export const onHomePage: OnHomePageHandler = async () => {
  return {
    content: await HomeScreen(),
  };
};




export const onUserInput: OnUserInputHandler = async ({id, event}) => { 
 
  console.log(id);
  console.log(event);
  console.log("interacton table is: ");
  console.log(InteractionHandler.interactionTable);
  if(event.name){


    InteractionHandler.handleCall(id, event.name);
    
  }
}; 

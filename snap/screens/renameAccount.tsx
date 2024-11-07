import {Box, Heading, Text, Copyable, Divider} from '@metamask/snaps-sdk/jsx';
import { InteractionHandler } from '../InteractionHandler';
import Utils from '../Utils';
import {Wallet} from '../Wallet';
import { SimpleAccount } from 'types';
export async function renameAccountDialog(address:string): Promise<boolean>{
    let account = (await Wallet.getAccount(address)) as SimpleAccount 
    //highlighted as KYR-01-002 (Markdown and control characters) fix
    //can only display accounts stored in the state object, which is off limits to a potential attacker
    
    //highlighted as KYR-01-004   (dApp origin not displayed in Snap UI) fix
    //the request origin is displayed and accessed through the InteractionHandler object
    let ui = (
        <Box>
            <Heading>Rename Account</Heading>
            <Text>{InteractionHandler.requestOrigin}</Text>
            <Divider/>
            <Box>
                <Heading>{account.name}</Heading>
                <Copyable value={account.address}/>
            </Box>
            <Divider/>
            
        </Box>
    )

    /**
     * 
     * KYR-01-003 (Accounts renamable without confirmation ) notes
     * this creates a prompt confirmation dialog for renaming an account
     * a user must then type their desired account name into the dialog
     */
    let newName = await Utils.openDialogWithContent(ui, "prompt");
    if(newName === null){
        Utils.throwError(400,"User Rejected Request");
        return false;
    }
    
    return await Wallet.renameWallet(address, newName as string);
}
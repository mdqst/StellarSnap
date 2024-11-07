import {Box, Heading, Text, Copyable, Divider} from '@metamask/snaps-sdk/jsx';
import { InteractionHandler } from '../InteractionHandler';

export async function CreateNewAccountConfimation(name:string): Promise<boolean>{
    //highlighted as entry point 1 for KYR-01-002 (Markdown and control characters) fix
    //account name is stored in a copyable component, which does not support markdown or control characters
    
    
    const ui = (
        <Box>
            <Heading>Create Account</Heading>
            <Divider/>
            <Copyable value={InteractionHandler.requestOrigin}/>
            <Text>Would Like to Create An Account Named:</Text>
            <Copyable value={name}/>
        </Box>
    );


    //highlighted as KYR-01-003 (accounts nameable without confimarion) fix. dialog-popup is used to confirm the account name
    
    let result = await snap.request({
        method: 'snap_dialog',
        params: {
            type: 'confirmation',
            content: ui,
        },
    }) as boolean;
    return result;
}



/*
Class for utility functions

wallet is a global in the metamask context
*/
import { ComponentOrElement, DialogResult } from '@metamask/snaps-sdk';
import { panel, text, heading, divider, copyable, Panel } from '@metamask/snaps-ui';
type interfaceId = string;
import { InteractionHandler } from './InteractionHandler';
import { SnapComponent } from '@metamask/snaps-sdk/jsx';
import type { SnapElement } from '@metamask/snaps-sdk/jsx';
export default class Utils {
    
    static throwError(code, msg){
        if(code === undefined){
            code = 0
        }
        //metamask overrides Error codes
        //This function encodes an arc complient error code
        //into the error message, and is then seperated by the SDK
        console.log(JSON.stringify(msg));
        throw new Error(`${code}\n${msg}`);
    }

    static async notify(message: string, type?:"native"|"inApp"): Promise<boolean>{
        if(!type){
            type = 'native';
        }
        try{
            
            const result = await snap.request({
                method: 'snap_notify',
                params: {
                  type: type,
                  message: message,
                },
              });
            return true;
        }
        catch(e){
            console.log(e);
            await snap.request({
                method: 'snap_notify',
                params: {
                  type: 'inApp',
                  message: message,
                },
              });
            return true;
        }


        
    }
    /**
     * KYR-01-0004 dApp origin not displayed in Snap UI
     * the sendConfirmation function now includes the request origin in the dialog
     */
    static async sendConfirmation(prompt: string, description: string, textAreaContent: string): Promise<boolean>{
        if(!textAreaContent){
            textAreaContent = ""
        }
        const confirm= await snap.request({
        method: 'snap_dialog',
        params: {
            type: 'confirmation',
            content: panel([
            text(`request origin: ${InteractionHandler.requestOrigin}`),
            divider(),
            heading(prompt),
            divider(),
            text(description),
            divider(),
            text(textAreaContent),
            ]),
        },
        });
        
        return confirm as boolean;
    }
    /**
     * KYR-01-0004 dApp origin not displayed in Snap UI
     * the send alert function now includes the request origin in the dialog
     */
    static async sendAlert(title: string, info: string): Promise<boolean>{
        const alert = await snap.request({
            method: 'snap_dialog',
            params:{
                type: 'alert',
                content: panel([
                    text(`request origin: ${InteractionHandler.requestOrigin}`),
                    divider(),
                    heading(title),
                    divider(),
                    text(info)
                ])
            }
        })
        return true;
    }
    
    static async openDialog(id:interfaceId): Promise<DialogResult>{
        const alert = await snap.request({
            method: 'snap_dialog',
            params:{
                type: 'alert',
                id: id
            }
        })
        return alert;
    }

    static async openDialogWithContent(content:ComponentOrElement, type:'confirmation' | "alert" | 'prompt'): Promise<DialogResult>{
        const disp = await snap.request({
            method: 'snap_dialog',
            params:{
                type: type,
                content:content
            }
        })
        return disp
    }
    
    /**
     * KYR-01-0004 dApp origin not displayed in Snap UI
     * the display pannel function now includes the request origin in the dialog
     */
    static async displayPanel(disppanel: Panel, type:"confirmation" | "alert" | "prompt" = "confirmation"): Promise<DialogResult>{
        const disp = await snap.request({
            method: 'snap_dialog',
            params:{
                type: type,
                content: panel([
                    disppanel,
                    divider(),
                    text(`request origin: ${InteractionHandler.requestOrigin}`), //this is a global variable for the request origin
                ])
            }
        })
        return disp
    }

    
}
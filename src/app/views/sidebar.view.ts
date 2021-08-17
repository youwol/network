import { child$, VirtualDOM } from "@youwol/flux-view";
import { AssetsBrowserClient } from "../assets-browser.client";


export function sideBarView(): VirtualDOM{

    return {
        class:'fv-bg-background-alt p-3 flex-shrink-0',
        children:[
            child$(
                AssetsBrowserClient.getGroups$(),
                (resp) => {
                    return { 
                        class:'fv-text-primary',
                        children: resp.groups
                        .filter( grp => grp.path != 'private')
                        .map( grp => {
                            return {
                                class:'d-flex align-items-center',
                                children:[
                                    {
                                        class:'fas fa-users pr-2'
                                    },
                                    {
                                        innerText: grp.path
                                    }
                                ]
                            }
                    })}
                })
        ]
    }
}
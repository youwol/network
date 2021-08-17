import { child$, VirtualDOM } from "@youwol/flux-view";
import { AppState } from "../state";


export function sideBarView(appState: AppState): VirtualDOM{

    return {
        class:'fv-bg-background-alt p-3 flex-shrink-0',
        children:[
            child$(
                appState.groups$,
                (groups) => {
                    return { 
                        class:'fv-text-primary',
                        children: groups
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
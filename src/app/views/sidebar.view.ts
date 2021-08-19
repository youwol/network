import { attr$, child$, VirtualDOM } from "@youwol/flux-view";
import { tap } from "rxjs/operators";
import { AppState } from "../state";


export function sideBarView(appState: AppState): VirtualDOM{

    return {
        class:'fv-bg-background-alt p-3 flex-shrink-0',
        children:[
            child$(
                appState.groups$,
                (groups) => {
                    return { 
                        class: 'fv-text-primary',
                        children: groups
                        .map( grp => {
                            return {
                                class: attr$( 
                                    appState.selectedGroup$,
                                    (selected) => grp.id == selected.id ? 'fv-text-focus': 'fv-text-primary',
                                    {wrapper: (d) => d + " rounded px-2 d-flex align-items-center fv-pointer fv-hover-bg-background"}
                                ),
                                onclick: (ev) => appState.selectGroup(grp.id),
                                children:[
                                    {
                                        class: grp.path == 'private' ? 'fas fa-user pr-2' :'fas fa-users pr-2'
                                    },
                                    {
                                        innerText: grp.path == 'private' ? 'myself' : grp.path
                                    }
                                ]
                            }
                    })}
                })
        ]
    }
}
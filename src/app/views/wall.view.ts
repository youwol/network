import { child$, VirtualDOM } from "@youwol/flux-view";
import { combineLatest } from "rxjs";
import { AppState } from "../state";
import { groupBannerView } from "./group-banner/group-banner.view";
import { newPostView } from "./new-post/new-post.view";


export function hRuleView(): VirtualDOM {

    return {
        tag: 'hr',
        class: 'fv-color-primary mx-5'
    }
}


export function wallView(appState: AppState): VirtualDOM {

    return {
        class: 'flex-grow-1 overflow-auto fv-bg-background',
        style:{width:'0px'},
        children:[
            child$(
                appState.selectedGroup$,
                (grp) => groupBannerView(grp, appState),
            ),
            child$(
                combineLatest([appState.selectedGroup$, appState.user$]),
                ( [grp, user] ) => newPostView(grp, user) 
            ),
            hRuleView()
        ]
    }
}
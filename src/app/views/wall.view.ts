import { child$, VirtualDOM } from "@youwol/flux-view";
import { combineLatest } from "rxjs";
import { AppState } from "../state";
import { groupBannerView } from "./group-banner/group-banner.view";
import { NewPostState } from "./new-post/models";
import { newPostView } from "./new-post/new-post.view";
import { postsView } from "./posts/posts.view";


export function hRuleView(): VirtualDOM {

    return {
        tag: 'hr',
        class: 'fv-color-primary ml-3 mr-2'
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
            hRuleView(),
            {
                class:'pl-3 pt-3 pr-2',
                children:[
                    child$(
                        combineLatest([appState.selectedGroup$, appState.user$]),
                        ( [grp, user] ) => postsView(grp, user, appState) 
                    )
                ]
            },
        ]
    }
}
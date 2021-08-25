import { VirtualDOM } from "@youwol/flux-view";
import { Client } from "../client";
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


export function wallView(grp, user, appState: AppState): VirtualDOM {

    return {
        class: 'flex-grow-1 overflow-auto fv-bg-background',onscroll:(ev) => {
            let elem = ev.target
            if (elem.scrollTop >= (elem.scrollHeight - elem.parentNode.clientHeight - 1)) {
                Client.getMorePosts(grp.id)
            }
        },
        style:{width:'0px'},
        children:[
            groupBannerView(grp, user, appState),
            {
                class:'pl-3 pt-3 pr-2',
                children:[
                    newPostView( new NewPostState(user, grp.id)) 
                ]
            },
            hRuleView(),
            {
                class:'pl-3 pt-3 pr-2',
                children:[
                    postsView(grp, user, appState) 
                ]
            },
        ]
    }
}
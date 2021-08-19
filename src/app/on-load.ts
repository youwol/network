require('./style.css');

import { child$, render } from '@youwol/flux-view';
import { createYouwolBanner } from './views/banner.view';
import { AppState } from './state';
import { sideBarView } from './views/sidebar.view';
import { wallView } from './views/wall.view';
import { discussionView } from './views/discussion/discussion.view';
import { combineLatest } from 'rxjs';

let appState = new AppState()
let vDOM = {
    class:'fv-bg-background fv-text-primary d-flex flex-column h-100',
    children:[
        createYouwolBanner(),
        {
            class:'d-flex flex-grow-1',
            style:{height:'0px'},
            children:[
                sideBarView(appState),
                child$(
                    combineLatest([appState.selectedGroup$, appState.user$]),
                    ([grp, user]) => wallView(grp, user, appState),
                ),
                child$(
                    combineLatest([appState.selectedDiscussion$, appState.user$]),
                    ([post, user]) => post ? discussionView(post, user, appState) : {}
                )
            ]
        }
    ]
}

document.getElementById("content").appendChild(render(vDOM))
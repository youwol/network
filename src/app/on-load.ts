require('./style.css');

import { render } from '@youwol/flux-view';
import { createYouwolBanner } from './views/banner.view';
import { AppState } from './state';
import { sideBarView } from './views/sidebar.view';
import { wallView } from './views/wall.view';

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
                wallView(appState)
            ]
        }
    ]
}

document.getElementById("content").appendChild(render(vDOM))
import { VirtualDOM } from "@youwol/flux-view";
import { AppState } from "../state";
import { writerMessageView } from "./new-post/message-write.view";


export function wallView(appState: AppState): VirtualDOM {

    return {
        class: 'fv-bg-background fv-text-primary flex-grow-1 px-5 pt-5',
        style:{width:'0px'},
        children:[
            writerMessageView()
        ]
    }
}
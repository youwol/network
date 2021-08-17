import { attr$, child$, VirtualDOM } from "@youwol/flux-view";
import { GroupResponse } from "@youwol/flux-youwol-essentials";
import { Subject } from "rxjs";
import { Client } from "../../client";
import { AppState } from "../../state";
import { attachFileExpandedView, attachFileIconView, fluxAppView } from "./attach-flux.view";
import { emojisExpandedView, emojisIconView } from "./emojis.view";
import { ActionFooter, RenderMode, NewPostState } from "./models";
import { templateView } from "./text-area.view";


export function actionsHeaderView(state: NewPostState): VirtualDOM {

    return {
        class:' d-flex align-items-center',
        children: [
            {
                tag:'i',
                class: attr$(
                    state.renderMode$,
                    (mode) => mode == RenderMode.View ? 'fv-text-focus' : '',
                    {wrapper: (d) => d + ' fas fa-eye px-2'}
                ),
                onclick: () => {
                    state.renderMode$.getValue() == RenderMode.Template 
                        ? state.toggleRender()      
                        : state.toggleTemplate()   
                 }
            },
            {
                class:'ml-auto',
                children:[
                    {
                        tag:'i',
                        class: 'fab fa-2x fa-telegram-plane fv-pointer rounded fv-text-success',
                        onclick: () => {
                           Client.post({
                               time: Date.now(),
                               author: state.user,
                               groupId: state.group.id,
                               content: state.getContent()
                           })      
                        }
                    }
                ]
            }
        ]
    }
}

export function actionsFooterView(state: NewPostState): VirtualDOM {

    let toggledAction$ = new Subject()

    let togglingIconFactory = {
        [ActionFooter.Emoji]: emojisIconView(),
        [ActionFooter.AttachFile]:attachFileIconView(),
    }
    let expandedFactory = {
        [ActionFooter.None]: () => ({}),
        [ActionFooter.Emoji]: () => emojisExpandedView(state.insertedEmojis$),
        [ActionFooter.AttachFile]: () => attachFileExpandedView(state.insertedFluxApp$),
    }
    return {
        children: [
            {
                class: 'd-flex w-100 align-items-center',
                children: [ActionFooter.Emoji,ActionFooter.AttachFile].map( (action) => {
                    return {
                        ... togglingIconFactory[action], 
                        ...{ onclick: (ev) => toggledAction$.next(action) }}
                })
            },
            {
                style: {
                    width: 'fit-content'
                },
                onmouseleave: () => { toggledAction$.next(ActionFooter.None) },
                children: [
                    child$(
                        toggledAction$,
                        (action: ActionFooter) => {
                            return expandedFactory[action]()
                        }
                    )
                ]
            }
        ]
    }
}


export function newPostView(group: GroupResponse, userId: string): VirtualDOM {

    let state = new NewPostState(userId, group)

    return {
        class:'overflow-auto px-5 pt-2',
        children: [
            actionsHeaderView(state),
            {
                class:'d-flex',
                children:[
                    templateView(state),
                    {
                        id:'render-div',
                        class: attr$(state.renderMode$,(mode) => mode==RenderMode.Template ? 'd-none' : 'd-block w-100')
                    }
                ]
            },
            child$(
                state.renderMode$,
                (mode:RenderMode) => {
                    return mode == RenderMode.Template 
                        ? actionsFooterView(state)
                        : {}
                }
            )
            
        ]
    }
}
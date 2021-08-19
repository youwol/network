import { attr$, child$, VirtualDOM } from "@youwol/flux-view";
import { Subject } from "rxjs";
import { attachFileExpandedView, attachFileIconView } from "./attach-flux.view";
import { emojisExpandedView, emojisIconView } from "../shared/emojis-browser.view";
import { ActionFooter, RenderMode, NewPostState } from "./models";
import { templateView } from "./text-area.view";


export function actionsHeaderView(state: NewPostState): VirtualDOM {

    return {
        class:' d-flex flex-column align-items-center',
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
                class:'',
                children:[
                    {
                        tag:'i',
                        class: 'fab fa-telegram-plane fa-2x fv-pointer rounded',
                        onclick: () => {
                            state.post({
                                author: state.user.name,
                                groupId: state.groupId,
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


export function newPostView(
    state: NewPostState
    ): VirtualDOM {

    return {
        class:'overflow-auto ',
        children: [
            {   class:'d-flex',

                children:[
                    actionsHeaderView(state),
                    {
                        class:'flex-grow-1',
                        style:{
                            width:'0px'
                        },
                        children:[
                            templateView(state),
                            {
                                id: state.renderDivId,
                                class: attr$(
                                    state.renderMode$,
                                    (mode) => mode==RenderMode.Template ? 'd-none' : 'd-block w-100',
                                    {wrapper: (d) => d + " fv-bg-background-alt rounded px-4 py-2"})
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
                ]
            },            
        ]
    }
}
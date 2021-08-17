import { attr$, child$, HTMLElement$, VirtualDOM } from "@youwol/flux-view";
import { BehaviorSubject, Subject } from "rxjs";
import { attachFileExpandedView, attachFileIconView, fluxAppView } from "./attach-flux.view";
import { emojisExpandedView, emojisIconView } from "./emojis.view";
import { ActionFooter, RenderMode, State } from "./models";
import { templateView } from "./text-area.view";



export function actionsHeaderView(state: State): VirtualDOM {

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
                tag:'i',
                class: 'fab fa-2x fa-telegram-plane fv-pointer rounded fv-text-success',
                onclick: () => {
                   state.toggleRender()         
                }
            }
        ]
    }
}

export function actionsFooterView(state: State): VirtualDOM {

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


export function writerMessageView(): VirtualDOM {

    let state = new State()

    return {
        class:'overflow-auto',
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
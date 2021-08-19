import { attr$, child$, VirtualDOM } from "@youwol/flux-view"
import { Interfaces } from "@youwol/flux-files"
import { BehaviorSubject, combineLatest, Subject } from "rxjs"
import { ExpandableGroup } from "@youwol/fv-group"
import { workspaceBrowserView } from "../shared/workspace-browser.view"



export function attachFileIconView(): VirtualDOM {

    return {
        tag: 'i',
        class: 'fv-pointer rounded m-1 fas fa-paperclip',
    }
}


export function attachFileExpandedView(file$: Subject<Interfaces.File>): VirtualDOM {

    return workspaceBrowserView(file$)
}


class FluxAppState extends ExpandableGroup.State{

    minWidth$ : BehaviorSubject<string>
    aspectRatio$ : BehaviorSubject<string>

    constructor(name, public readonly rawId, minWidth='100%', aspectRatio = '1'){
        super(name, false)
        this.minWidth$ = new BehaviorSubject<string>(minWidth)
        this.aspectRatio$ = new BehaviorSubject<string>(aspectRatio)
    }
}

export function headersParamsView( state : FluxAppState) {

    let attrView = (name, subject$) => {
        return {
            class:'d-flex px-2 align-items-center',
            children: [
                {   class:'px-2',
                    tag: 'span',
                    innerText: name
                },
                {
                    tag: 'input',
                    type: "text",
                    value: attr$(subject$, (s) => s ),
                    onchange: (ev) => subject$.next(ev.target.value)
                }
            ]
        }
    }

    return child$(
        state.expanded$,
        (expanded) => expanded 
            ?   { 
                    class: 'd-flex',                             
                    style: { fontSize:'x-small'}, 
                    children:[
                        attrView('min. width', state.minWidth$),
                        attrView('aspect ratio', state.aspectRatio$)
                    ],
                    onclick: (ev) => {ev.stopPropagation()}
                }
            :   {}
    )
}

export function headerView(
    state: FluxAppState,
    paramsView) {

    return {
        class: "fv-bg-background-alt fv-text-primary fv-color-primary rounded fv-pointer d-flex align-items-center justify-content-between",
        children: [
            {   
                children:[
                    {
                        tag: 'i',
                        class: attr$(state.expanded$,
                            d => d ? "fa-caret-down" : "fa-caret-right",
                            { wrapper: (d) => "px-2 fas " + d }
                        )
                    },
                    {   tag: 'span', class: 'px-2', innerText: state.name, 
                        style: { 'user-select': 'none'}
                    } 
                ]
            },
            headersParamsView( state ),
            child$(
                state.expanded$,
                (expanded) => expanded 
                    ?   { 
                            class: 'd-flex px-2 align-items-center',              
                            children:[
                                {   tag:'a', 
                                    href:`/ui/flux-builder/?id=${state.rawId}`,
                                    class:'fas fa-wrench px-2'
                                },
                                {   tag:'a',
                                    href:`/ui/flux-runner/?id=${state.rawId}`,
                                    class:'fas fa-expand px-2'
                                }
                            ],
                            onclick: (ev) => {ev.stopPropagation()}
                        }
                    :   {}
            )
        ]
    }
}

export function fluxAppView(name: string, rawId: string, minWidth = '100%', aspectRatio = "1"): VirtualDOM {

    let state = new FluxAppState(name, rawId, minWidth, aspectRatio)
    let view = new ExpandableGroup.View({
        state,
        class: "d-flex flex-column",
        headerView: (s) => headerView(s, headersParamsView(s)),
        contentView: (state:FluxAppState) => ({
            class:'w-100  overflow-auto',
            children:[
                {   
                    class:'fv-bg-background',
                    style:attr$(
                        combineLatest([state.minWidth$, state.aspectRatio$]),
                                    ([w,ratio]) => {
                                        return { minWidth:w, aspectRatio: ratio, position:'relative'}
                                    }
                    ),
                    children: [
                        {
                            tag: 'iframe',
                            style:{
                                position: 'absolute',
                            },
                            title: '',
                            width: '100%',
                            height: '100%',
                            src: `/ui/flux-runner/?id=${rawId}`
                        }
                    ]
                }
            ]
        }
        )
    } as any )
    return {
        class:'flux-app',
        id: rawId,
        data: attr$(
            combineLatest([state.minWidth$, state.aspectRatio$]),
                        ([w,h]) => {
                            return { name, minWidth:w, aspectRatio: h}
                        }
        ),
        contentEditable: false,
        children:[view] 
    }
}
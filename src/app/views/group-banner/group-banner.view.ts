import { Interfaces } from "@youwol/flux-files"
import { attr$, child$, VirtualDOM } from "@youwol/flux-view"
import { GroupResponse } from "@youwol/flux-youwol-essentials"
import { ReplaySubject, Subject } from "rxjs"
import { filter, map } from "rxjs/operators"
import { Client } from "../../client"
import { AppState } from "../../state"
import { popupWorkspaceBrowserModal, workspaceBrowserView } from "../shared/workspace-browser.view"




export class BannerState{

    static aspectRatio = 4
    coverApp$ = new ReplaySubject<string>(1)

    constructor(public readonly groupId){

        Client.getCoverAppUrl(this.groupId).pipe(
            filter( url => url != undefined)
        ).subscribe( (url) => this.coverApp$.next(url))
    }

    setCoverApp( file : Interfaces.File){
        Client.setCoverApp(this.groupId, file['metadata'].rawId).subscribe(
            (url) => this.coverApp$.next(url)
        )
    }
}

export enum ActionFooter {
    None = "None",
    AttachFile = "AttachFile",
    BuildApp = "BuildApp"
}



export function actionsFooterView(bannerState: BannerState): VirtualDOM {

    let toggledAction$ = new Subject()

    let togglingIconFactory = {
        [ActionFooter.AttachFile]:{
            class:'d-flex align-items-center mx-2 fv-hover-bg-background fv-pointer rounded p-2',
            children:[
                {
                    tag: 'i',
                    class: 'fv-pointer rounded m-1 fas fa-paperclip'
                },{
                    innerText:'cover app.'
                }
            ]
        },
        [ActionFooter.BuildApp]:{
            class:'d-flex align-items-center mx-2 fv-hover-bg-background fv-pointer  rounded p-2',
            children:[
                {
                    tag: 'i',
                    class: 'fv-pointer rounded m-1 fas fa-wrench'
                },{
                    innerText:'build app.'
                }
            ]
        },
    }
    let expandedFactory = {
        [ActionFooter.AttachFile]: () => {
            let selectedFile$ = new Subject<Interfaces.File>()
            popupWorkspaceBrowserModal(selectedFile$)
            selectedFile$.subscribe( file => {
                bannerState.setCoverApp(file)
            })
        },
    }
    return {
        style:{
            zIndex: 1,
            backgroundColor: "rgba(125,125,125,0.5)",
            width: 'fit-content'
        },
        class:'p-2 fv-text-primary rounded mx-auto mb-2',
        children: [
            {
                class: 'd-flex align-items-center',
                children: [ActionFooter.AttachFile, ActionFooter.BuildApp].map( (action) => {
                    return {
                        ... togglingIconFactory[action], 
                        ...{ onclick: (ev) => expandedFactory[action]() }}
                })
            }
        ]
    }
}


export function coverView(bannerState: BannerState): VirtualDOM{

    return {
        class:'w-100  overflow-auto',
        style:{ minWidth:'100%', aspectRatio: `${BannerState.aspectRatio}`, position:'absolute'},
        children:[{
            tag: 'iframe',
            allow: "cross-origin-isolated",
            style:{
                position: 'absolute',
            },
            title: '',
            width: '100%',
            height: '100%',
            src: attr$(
                bannerState.coverApp$,
                (url) => url
            )
        }
        ]
    }
}

export function groupBannerView( group: GroupResponse, appState: AppState): VirtualDOM {

    let bannerState = new BannerState(group.id)

    return {
        style:{
            position: 'relative',aspectRatio:  `${BannerState.aspectRatio}`,
        },
        class: 'd-flex justify-content-between fv-text-focus flex-column w-100',
        children:[
            {
                class: 'mx-auto',
                innerText: group.path
            },
            coverView(bannerState),
            actionsFooterView(bannerState)
        ]
    }
}

import { Interfaces } from "@youwol/flux-files"
import { attr$, child$, HTMLElement$, VirtualDOM } from "@youwol/flux-view"
import { GroupResponse } from "@youwol/flux-youwol-essentials"
import { ExpandableGroup } from "@youwol/fv-group"
import { BehaviorSubject, Observable, Subject } from "rxjs"
import { filter, map } from "rxjs/operators"
import { Client, GroupInfo, } from "../../client"
import { AppState } from "../../state"
import { popupEmojisBrowserModal } from "../modals/emojis-browser.view"
import { popupWorkspaceBrowserModal } from "../modals/workspace-browser.view"




export class BannerState {

    static aspectRatio = 4
    coverApp$ : Observable<string>

    constructor(groupId: string) {
        this.coverApp$ = Client.getProfileSettings$(groupId).pipe(
            map( profile => profile.coverApp),
            filter( url => url != "")
        )
    }

}

export enum ActionFooter {
    None = "None",
    AttachFile = "AttachFile",
    BuildApp = "BuildApp"
}

export function profileView(group, user): VirtualDOM {

    let rowView = (title, value, child = {}) => {
        return {
            class: 'd-flex align-items-center',
            children: [
                {
                    tag: 'span',
                    style: { width: '150px' },
                    innerText: title
                },
                {
                    tag: 'span',
                    innerText: value
                },
                child
            ]
        }
    }
    let inputView = (labelContent: string, propertyName: string, edition$, settings) => {
        return {
            class: 'd-flex align-items-center',
            children: [
                {
                    tag: 'span',
                    style: { width: '150px' },
                    innerText: labelContent
                },
                child$(
                    edition$,
                    (editing) => editing
                        ? {
                            tag: 'input', type:'text',
                            value: settings[propertyName],
                            onchange: (ev) => {
                                let profile = {...settings, ...{[propertyName]:ev.target.value}}
                                Client.setProfile(profile)
                            }
                        } :
                        {
                            tag: 'span',
                            innerText: settings[propertyName]
                        }
                ),
                {
                    tag:'i',
                    class:'fas fa-pen fv-hover-text-focus fv-pointer ml-2',
                    onclick: () => edition$.next(true)
                }
            ]
        }
    }
    let state = new ExpandableGroup.State("Profile settings")
    let view = new ExpandableGroup.View({
        state,
        headerView: ExpandableGroup.defaultHeaderView,
        contentView: (state) => {
            return {
                class: 'px-5 py-3',
                children: [
                    child$(
                        Client.getProfileSettings$(group.id),
                        (settings: GroupInfo) => {
                            let insertedEmojis$ = new Subject()
                            let coverApp$ = new Subject<Interfaces.File>()
                            let nameEdition$ = new BehaviorSubject(false)
                            let titleEdition$ = new BehaviorSubject(false)
                            return {
                                children:[
                                    rowView('id', group.id),
                                    inputView("name", "displayName", nameEdition$, settings),
                                    rowView('icon', settings.icon, {
                                        tag:'i',
                                        class:'fas fa-pen fv-hover-text-focus fv-pointer ml-2',
                                        onclick: () => popupEmojisBrowserModal(insertedEmojis$)
                                    }),
                                    inputView("title", "title", titleEdition$, settings),
                                    rowView('cover app.', settings.coverApp, {
                                        tag:'i',
                                        class:'fas fa-pen fv-hover-text-focus fv-pointer ml-2',
                                        onclick: () => popupWorkspaceBrowserModal(coverApp$)
                                    })
                                ],
                                connectedCallback: (elem: HTMLElement$) => {
                                    let sub0 = insertedEmojis$.subscribe( (emoji) => {
                                        let profile = {...settings, ...{icon:emoji}}
                                        Client.setProfile(profile)
                                    })
                                    let sub1 = coverApp$.subscribe( (file) => {
                                        let profile = {...settings, ...{coverApp:`/ui/flux-runner/?id=${file['metadata'].rawId}`}}
                                        Client.setProfile(profile)
                                    })
                                    elem.ownSubscriptions(sub0, sub1)
                                }
                            }
                        }
                    )
                ]
            }
        }
    })
    return view
}


export function actionsFooterView(bannerState: BannerState): VirtualDOM {

    let iconFactory = {
        [ActionFooter.BuildApp]: {
            children: [child$(
                bannerState.coverApp$,
                () => ({
                    class: 'd-flex align-items-center mx-2 fv-hover-bg-background fv-pointer  rounded p-2',
                    children: [
                        {
                            tag: 'i',
                            class: 'fv-pointer rounded m-1 fas fa-wrench'
                        }, {
                            innerText: 'build app.'
                        }
                    ]
                })
            )]
        },
    }
    let actionsFactory = {
    }
    return {
        style: {
            zIndex: 1,
            backgroundColor: "rgba(125,125,125,0.5)",
            width: 'fit-content'
        },
        class: 'p-2 fv-text-primary rounded mx-auto mb-2',
        children: [
            {
                class: 'd-flex align-items-center',
                children: [ActionFooter.BuildApp].map((action) => {
                    return {
                        ...iconFactory[action],
                        ...{ onclick: (ev) => actionsFactory[action]() }
                    }
                })
            }
        ]
    }
}


export function coverView(src): VirtualDOM {

    return {
        class: 'w-100  overflow-auto',
        style: { minWidth: '100%', aspectRatio: `${BannerState.aspectRatio}`, position: 'absolute' },
        children: [{
            tag: 'iframe',
            allow: "cross-origin-isolated",
            style: {
                position: 'absolute',
            },
            title: '',
            width: '100%',
            height: '100%',
            src
        }
        ]
    }
}

export function groupBannerView(group: GroupResponse, user, appState: AppState): VirtualDOM {

    let bannerState = new BannerState(group.id)
    let coverApp$ = Client.getProfileSettings$(group.id).pipe(
        map( d => d.coverApp),
        filter( d => d!="")
    )
    return {
        children: [
            profileView(group, user),
            child$( 
                coverApp$,
                (src) => ({
                    children:[
                        {
                            style: {
                                position: 'relative', aspectRatio: `${BannerState.aspectRatio}`,
                            },
                            class: 'd-flex justify-content-between fv-text-focus flex-column w-100',
                            children: [
                                {
                                    class: 'mx-auto',
                                    innerText: group.path
                                },
                                coverView(src),
                                actionsFooterView(bannerState)
                            ]
                        }
                    ]
                })
            )
        ]
    }
}

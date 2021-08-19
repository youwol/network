import { Interfaces } from "@youwol/flux-files"
import { attr$, child$, HTMLElement$, VirtualDOM } from "@youwol/flux-view"
import { GroupResponse } from "@youwol/flux-youwol-essentials"
import { ExpandableGroup } from "@youwol/fv-group"
import { BehaviorSubject, Observable, ReplaySubject, Subject } from "rxjs"
import { filter, map } from "rxjs/operators"
import { Client, ProfileDocument } from "../../client"
import { AppState } from "../../state"
import { popupEmojisBrowserModal } from "../shared/emojis-browser.view"
import { popupWorkspaceBrowserModal } from "../shared/workspace-browser.view"




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
    let titleView = (titleEdition$, settings) => {
        return {
            class: 'd-flex align-items-center',
            children: [
                {
                    tag: 'span',
                    style: { width: '150px' },
                    innerText: 'title'
                },
                child$(
                    titleEdition$,
                    (editing) => editing
                        ? {
                            tag: 'input', type:'text',
                            value: settings.title,
                            onchange: (ev) => {
                                Client.setProfile({groupId: group.id, title: ev.target.value, icon: settings.icon,
                                    coverApp:settings.coverApp})
                            }
                        } :
                        {
                            tag: 'span',
                            innerText: settings.title
                        }
                ),
                {
                    tag:'i',
                    class:'fas fa-pen fv-hover-text-focus fv-pointer ml-2',
                    onclick: () => titleEdition$.next(true)
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
                        (settings: ProfileDocument) => {
                            let name = group.id.includes('private')
                                ? user.name
                                : group.path
                            let insertedEmojis$ = new Subject()
                            let coverApp$ = new Subject<Interfaces.File>()
                            let titleEdition$ = new BehaviorSubject(false)
                            return {
                                children:[
                                    rowView('id', group.id),
                                    rowView('name', name),
                                    rowView('icon', settings.icon, {
                                        tag:'i',
                                        class:'fas fa-pen fv-hover-text-focus fv-pointer ml-2',
                                        onclick: () => popupEmojisBrowserModal(insertedEmojis$)
                                    }),
                                    titleView(titleEdition$, settings),
                                    rowView('cover app.', settings.coverApp, {
                                        tag:'i',
                                        class:'fas fa-pen fv-hover-text-focus fv-pointer ml-2',
                                        onclick: () => popupWorkspaceBrowserModal(coverApp$)
                                    })
                                ],
                                connectedCallback: (elem: HTMLElement$) => {
                                    let sub0 = insertedEmojis$.subscribe( (emoji) => {
                                        Client.setProfile({groupId: group.id, title: settings.title, icon: emoji,
                                            coverApp:settings.coverApp})
                                    })
                                    let sub1 = coverApp$.subscribe( (file) => {
                                        Client.setProfile({groupId: group.id, title: settings.title, icon: settings.icon,
                                            coverApp:`/ui/flux-runner/?id=${file['metadata'].rawId}`})
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


export function coverView(groupId): VirtualDOM {

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
            src: attr$(
                Client.getProfileSettings$(groupId).pipe(
                    map( d => d.coverApp),
                    filter( d => d!="")
                ),
                (url) => url
            )
        }
        ]
    }
}

export function groupBannerView(group: GroupResponse, user, appState: AppState): VirtualDOM {

    let bannerState = new BannerState(group.id)

    return {
        children: [
            profileView(group, user),
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
                    coverView(group.id),
                    actionsFooterView(bannerState)
                ]
            }
        ]
    }
}

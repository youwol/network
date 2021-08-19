import { child$, children$, childrenAppendOnly$, HTMLElement$, render, VirtualDOM } from "@youwol/flux-view"
import { GroupResponse } from "@youwol/flux-youwol-essentials"
import { ExpandableGroup } from "@youwol/fv-group";
import { Subject } from "rxjs";
import { filter, scan } from "rxjs/operators";
import { Client, CommentDocument, EmojiDocument, PostDocument } from "../../client"
import { AppState } from "../../state";
import { fluxAppView } from "../new-post/attach-flux.view";
import { newPostView } from "../new-post/new-post.view";
import { popupEmojisBrowserModal } from "../shared/emojis-browser.view";


export function headerView(user): VirtualDOM {

    return {
        class:"border-bottom d-flex align-items-center",
        children:[
            {
                style:{fontSize:'xx-large'},
                innerText:'🦃'
            },
            {   class:'pl-3',
                style:{
                    fontFamily: 'fangsong'
                },
                children:[
                    {
                        style:{
                            fontSize: 'large',
                            fontWeight: 'bolder'
                        },
                        innerText: user.name
                    },
                    {   
                        style:{
                            fontStyle: 'oblique'
                        },
                        innerText: "Software architect @ YouWol"
                    }
                ]
            }
        ]
    }
}

export function contentView(post: PostDocument) : VirtualDOM {

    return {
        connectedCallback: (elem: HTMLElement$ & HTMLDivElement) => {

            elem.innerHTML = window['marked'](post.content);
            window['MathJax']
                .typesetPromise([elem])
                .then(() => {
                    Array.from(elem.querySelectorAll('p'))
                        .filter(node => {
                            return node.innerText.includes('--flux-app')
                        })
                        .map(node => {
                            let code = node.innerText.split('|')[1]
                            let params = new Function(code)()
                            let view = fluxAppView(params.name, params.rawId, params.minWidth, params.aspectRatio)
                            let div = render(view)
                            node.replaceWith(div)
                        })
                })
        }
    }
}


export function leftMenuView(
    post:PostDocument, 
    user, 
    extraActions
    //appState: AppState
    ):  VirtualDOM {

    return {
        class:'d-flex flex-column pt-1 left-menu',
        children:[
            { 
                tag:'i',
                class:'far fa-smile p-1 m-1 fv-pointer rounded fv-color-background-alt fv-hover-color-primary',
                onclick: () => {
                    let emoji$ = new Subject()
                    emoji$.subscribe( (emoji: string) => {
                        Client.postEmoji(post.id, emoji, user.name)
                    })
                    popupEmojisBrowserModal(emoji$)
                }
            },
            ...extraActions.map( (action)=> {
                return {
                    tag: action.tag,
                    class: action.class,
                    onclick: (ev) => action.onclick(post, ev)
                }
            })
        ]
    }
}


export function footerView(post: PostDocument, user, appState: AppState): VirtualDOM {

    return {
        class: 'd-flex align-items-center w-100 border-top',
        children:[
            {
                class:'d-flex',
                style:{
                    'font-size': 'smaller'
                },
                children: children$(
                    Client.getEmojis$(post.id).pipe(
                        scan( (store, docs) => {
                            docs.forEach( (doc: EmojiDocument) => {
                                let count = store.has(doc.emoji) ? store.get(doc.emoji) + 1 : 1
                                store.set(doc.emoji,count)
                            })
                            return store
                        }, new Map<string,  number>())
                    ),
                    (store: Map<string,  number> ) => {
                        return Array.from(store.entries()).map( ([emoji, count]: [string, number] ) => {
                            return {
                                class:'d-flex rounded-circle p-1 mt-1 mr-1 border fv-pointer fv-bg-background fv-hover-text-focus',
                                children:[
                                    {
                                        innerText:emoji
                                    },
                                    {
                                        class:'pl-1',
                                        innerText:count
                                    }
                                ],
                                onclick:() => Client.postEmoji(post.id, emoji, user.name)
                            }
                        })
                    }
                )
            },
            child$(
                Client.getComment$(post.id).pipe( 
                    scan( (acc,e) =>  acc + e.length , 0),
                    filter( count => count > 0)
                    ),
                (count) => {
                    return {
                        class:'ml-3 my-auto border rounded fv-hover-text-focus fv-pointer px-1 d-flex align-items-center',
                        children:[
                            {
                                tag:'i',
                                class:'far fa-comment-dots mr-1'
                            },
                            {
                                innerText: `${count}`
                            }
                        ],
                        onclick: () => appState.toggleDiscussion(post) 
                    }
                }
            )
        ]
        
    }
}



export function postView(
    post: PostDocument, 
    user: string, 
    extraActions,
    appState: AppState
    ): VirtualDOM {

    
    return {
        class:'d-flex w-100 post-view',
        children:[
            leftMenuView(post, user, extraActions),
            {
                class: 'fv-bg-background-alt rounded py-2 px-3 mt-2 fv-hover-color-focus flex-grow-1',
                style:{position:'relative', width: '0px'},
                children: [
                    headerView(user),
                    contentView(post),
                    footerView(post, user, appState)
                ]
            }
        ],
    }
}

export function postsView(group: GroupResponse, user: string, appState: AppState): VirtualDOM {

    let extraActions = [
        { 
            tag:'i',
            class:'far fa-comment-dots  p-1 m-1 fv-pointer rounded fv-color-background-alt  fv-hover-color-primary',
            onclick: (post, ev) => {
                appState.toggleDiscussion(post) 
            }
        }
    ]
    return {
        class: 'overflow-auto',
        children: childrenAppendOnly$(
            Client.getPosts$(group.id),
            (post) => {
                return postView(post, user, extraActions, appState)
            },
            {
                orderingIndex: (post: PostDocument) => -post.time
            }
        )
    }
}

import { child$, HTMLElement$, render, VirtualDOM } from "@youwol/flux-view"
import { Modal } from "@youwol/fv-group"
import { merge } from "rxjs"
import { Client } from "../../client"
import { Tabs } from '@youwol/fv-tabs'
import { modalView } from "./modal.view"


export function emojisIconView() : VirtualDOM{

    return {
        tag: 'i',
        class: 'fv-pointer rounded m-1 fas fa-smile'
    }
}


export function emojisListView(emojiList, insertedEmojis$ ) : VirtualDOM {

    let icons =  emojiList.map((char: string) => {
        return {
            tag: 'label', 
            innerText: char.replace(/&zwj;/g, ""), 
            class: 'p-1 rounded fv-pointer fv-hover-bg-focus', 
            onclick: (ev) => {
                insertedEmojis$.next(ev.srcElement.innerText)
            }
        }
    })
    return {
        class: 'fv-bg-background-alt rounded overflow-auto w-100 h-100',
        children: icons
    }
}


export function popupEmojisBrowserModal(insertedEmojis$) {
    let tabState = new Tabs.State([
        new Tabs.TabData("smileys_people", "😃"),
        new Tabs.TabData("animals", "🐻"),
        new Tabs.TabData("foods", "🍔"),
        new Tabs.TabData("activities", "⚽"),
        new Tabs.TabData("travel", "🌇"),
        new Tabs.TabData("objects", "💡"),
        new Tabs.TabData("symbols", "🔣"),
        new Tabs.TabData("flags", "🎌")
    ])
    let tabView = new Tabs.View({
        state: tabState,
        contentView: (state, tab) => { return {
            style: { aspectRatio: '2',  },
            children:[
                child$(
                    Client.emojisList$(tab.id),
                    (emojis: Array<any>) => {
                        return emojisListView(emojis, insertedEmojis$)
                    }
                )
            ]
        }},
        headerView: (state, tab) => { return {
            class:'px-2 rounded',
            innerText: tab.name
        }}
    })
    let view = modalView(insertedEmojis$, tabView)
    return view.state.ok$
}
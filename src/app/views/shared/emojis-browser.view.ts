import { render, VirtualDOM } from "@youwol/flux-view"
import { Modal } from "@youwol/fv-group"
import { merge } from "rxjs"

export let animalsEmojiList = [
    "😺","😸","😹","😻","😼","😽","🙀","😿","😾","🙈","🙉","🙊","💥","🐵","🐒","🦍","🐶","🐕","🐩","🐺","🦊","🐱","🐈","🦁","🐯","🐅","🐆","🐴","🐎","🦄","🦓","🐮",
    "🐂","🐃","🐄","🐷","🐖","🐗","🐽","🐏","🐑","🐐","🐪","🐫","🦒","🐘","🦏","🐭","🐁","🐀","🐹","🐰","🐇","🐿","🦔","🦇","🐻","🐨","🐼","🐾","🦃","🐔","🐓","🐣",
    "🐤","🐥","🐦","🐧","🕊","🦅","🦆","🦉","🐸","🐊","🐢","🦎","🐍","🐲","🐉","🦕","🦖","🐳","🐋","🐬","🐟","🐠","🐡","🦈","🐙","🐚","🦀","🦐","🦑","🐌","🦋","🐛",
    "🐜","🐝","🐞","🦗","🕷","🕸","🦂"
]

export let emojiList = [
    "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "😘", "😗", "😙", "😚", "🙂", "🤗", "🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏",
    "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "☹", "🙁", "😖", "😞", "😟", "😤", "😢",
    "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "😳", "🤪", "😵", "😡", "😠", "🤬", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "😇", "🤠", "🤡", "🤥", "🤫", "🤭",
    "🧐", "🤓", "😈", "👿", "💀", "👻", "💩", "👹", "👺", "👽", "🤖", ...animalsEmojiList
]


export function emojisIconView() : VirtualDOM{

    return {
        tag: 'i',
        class: 'fv-pointer rounded m-1 fas fa-smile'
    }
}


export function emojisExpandedView(insertedEmojis$ ) : VirtualDOM {

    let icons =  emojiList.map((char) => {
        return {
            tag: 'label', 
            innerText: char, 
            class: 'p-1 rounded fv-pointer fv-hover-bg-focus', 
            onclick: (ev) => {
                insertedEmojis$.next(ev.srcElement.innerText)
            }
        }
    })
    return {
        class: 'fv-bg-background-alt rounded overflow-auto',
        style: { width: '250px', height: '250px' },
        children: icons
    }
}


export function popupEmojisBrowserModal(insertedEmojis$) {

    let modalState = new Modal.State()
    let modalView = new Modal.View({
        state: modalState,
        contentView: () => {
            return emojisExpandedView(insertedEmojis$)
        },
        connectedCallback: (elem) => {
            let sub = merge(modalState.cancel$, modalState.ok$, insertedEmojis$).subscribe( () =>{
                modalDiv.remove()
                insertedEmojis$.complete()
            })
            elem.ownSubscriptions(sub)
        }
    } as any)
    let modalDiv = render(modalView)
    document.querySelector("body").appendChild(modalDiv)
    return modalState.ok$
}
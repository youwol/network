import { VirtualDOM } from "@youwol/flux-view"


export let emojiList = [
    "😀", "😁", "😂", "🤣", "😃", "😄", "😅", "😆", "😉", "😊", "😋", "😎", "😍", "😘", "😗", "😙", "😚", "🙂", "🤗", "🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏",
    "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "☹", "🙁", "😖", "😞", "😟", "😤", "😢",
    "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "😳", "🤪", "😵", "😡", "😠", "🤬", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "😇", "🤠", "🤡", "🤥", "🤫", "🤭",
    "🧐", "🤓", "😈", "👿", "💀", "👻", "💩", "👹", "👺", "👽", "🤖"
]


export function emojisIconView() : VirtualDOM{

    return {
        tag: 'span',
        class: 'fv-pointer rounded m-1',
        innerText: '🙂'
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
import { attr$, HTMLElement$, render, VirtualDOM } from "@youwol/flux-view";
import { fluxAppView } from "./attach-flux.view";
import { RenderMode, State } from "./models";


let currentNode : HTMLElement = undefined
let currentPosition = undefined

export function templateView(
    state: State,
    ): VirtualDOM {

    return {
        class: attr$(
            state.renderMode$,
            (mode) => mode==RenderMode.Template ? 'd-block' : 'd-none',
            {wrapper: (d) => d + ' w-100 py-2 fv-bg-background-alt fv-text-primary fv-color-focus rounded px-4'}),
        id:'template-div',
        style :{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
        },
        contentEditable: true,
        role:"textbox",
        onkeydown: (ev) => {
            setTimeout(function () {
                currentNode =  window.getSelection()['baseNode']
                currentPosition =  window.getSelection().getRangeAt(0).startOffset
            }, 0);
        },
        onmousedown: (ev) => {
            setTimeout(function () {
                currentNode =  window.getSelection()['baseNode']
                currentPosition =  window.getSelection().getRangeAt(0).startOffset
            }, 0);
        },
        children: [
            {tag:'p', innerHTML: "<br>"}
        ],
        connectedCallback: (el:HTMLTextAreaElement & HTMLElement$) => {
            let sub0 = state.insertedEmojis$.subscribe( (char) =>{
                let current = currentNode.textContent
                currentNode.textContent = current.slice(0,currentPosition) + char + current.slice(currentPosition) 
            })
            let sub1 = state.insertedFluxApp$.subscribe( (file) =>{
                console.log({currentNode})
                currentNode.parentElement.appendChild(render(fluxAppView(file.name, file.metadata.rawId)))
                currentNode.parentElement.appendChild(render({tag:'p', innerHTML:'<br>'}))
            })
            el.ownSubscriptions(sub0, sub1)
        }
    }
}
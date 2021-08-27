import { attr$, HTMLElement$, render, VirtualDOM } from "@youwol/flux-view";
import { filter } from "rxjs/operators";
import { fluxAppView } from "./attach-flux.view";
import { RenderMode, NewPostState } from "./models";


export function templateView(
    state: NewPostState,
    ): VirtualDOM {

    return {
        class: attr$(
            state.renderMode$,
            (mode) => mode==RenderMode.Template ? 'd-block' : 'd-none',
            {wrapper: (d) => d + ' w-100 py-2 fv-bg-background-alt fv-text-primary fv-color-focus rounded px-4'}),
        id: state.templateDivId,
        style :{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
        },
        contentEditable: true,
        role:"textbox",
        onkeydown: (ev) => state.setCursor(),
        onmousedown: (ev) => state.setCursor(),
        children: [
            {tag:'p', innerHTML: "<br>"}
        ],
        connectedCallback: (el:HTMLDivElement & HTMLElement$) => {
            state.currentNode = el.querySelector('p')
            let sub0 = state.insertedEmojis$.subscribe( (char) =>{
                let current = state.currentNode.textContent
                state.currentNode.textContent = current.slice(0,state.currentPosition) + char + current.slice(state.currentPosition) 
            })
            let sub1 = state.insertedFluxApp$.subscribe( (file) =>{
                state.currentNode.parentElement.appendChild(render(fluxAppView(file.name, file.metadata.rawId)))
                state.currentNode.parentElement.appendChild(render({tag:'p', innerHTML:'<br>'}))
            })
            el.ownSubscriptions(sub0, sub1)
        }
    }
}
import { HTMLElement$, render, VirtualDOM } from "@youwol/flux-view"
import { Modal } from "@youwol/fv-group"
import { merge } from "rxjs"


export function modalView(selection$, contentView: VirtualDOM) {
    
    let modalState = new Modal.State()
    let modalView = new Modal.View({
        state: modalState,
        contentView: () => {
            return { 
                class:'p-3 rounded fv-color-primary fv-bg-background w-50',
                style:{minWidth:'50%'},
                children:[contentView] 
            }
        },
        connectedCallback: (elem: HTMLDivElement & HTMLElement$) => {
            elem.children[0].classList.add("w-100")
            let sub = merge(modalState.cancel$, modalState.ok$, selection$).subscribe( () =>{
                modalDiv.remove()
            })
            elem.ownSubscriptions(sub)
        }
    } as any)
    let modalDiv = render(modalView)
    document.querySelector("body").appendChild(modalDiv)
    return modalView
}

import { render } from "@youwol/flux-view"
import { ExpandableGroup } from "@youwol/fv-group"
import { BehaviorSubject, Subject } from "rxjs"
import { fluxAppView } from "./attach-flux.view"



export enum RenderMode{
    Template = 'Template',
    View = 'View'
}

export class State{

    insertedEmojis$ = new Subject<string>()
    insertedFluxApp$ = new Subject<any>()
    renderMode$ = new BehaviorSubject<RenderMode>(RenderMode.Template)
    
    constructor(){
    }

    toggleRender(){
        let nodeTemplate = document.getElementById("template-div") as HTMLDivElement

        let templateStr = ""

        Array.from(nodeTemplate.children).forEach( child => {

            if(child.classList.contains('flux-app')){
                templateStr += `\n\n--flux-app| return {rawId:"${child.id}",name:"${child['data'].name}", minWidth:"${child['data'].minWidth}",aspectRatio:"${child['data'].aspectRatio}"}|`
            }
            else{
                templateStr += "\n"+child['innerText']
            }
        })
        
        let nodeView =  document.getElementById("render-div")
        nodeView.innerHTML = window['marked'](templateStr);  
        window['MathJax']
        .typesetPromise([nodeView])
        .then(() => {
            Array.from(nodeView.querySelectorAll('p'))
            .filter( node => {
                console.log(node.innerText)
                return node.innerText.includes('--flux-app')
            })
            .map( node => {
                let code = node.innerText.split('|')[1]
                let params = new Function(code)()
                console.log(node, params, code)

                let view = fluxAppView(params.name, params.rawId, params.minWidth, params.aspectRatio)
                /*new ExpandableGroup.View({
                    state: new ExpandableGroup.State(params.name),
                    class: "d-flex flex-column",
                    headerView: ExpandableGroup.defaultHeaderView,
                    contentView: (state) => ({
                        class:'w-100  overflow-auto',
                        children:[
                            {   
                                class:'fv-bg-background',
                                style:{ minWidth:params.minWidth, aspectRatio: params.aspectRatio, position:'relative'},
                                children: [
                                    {
                                        tag: 'iframe',
                                        style:{
                                            position: 'absolute',
                                        },
                                        title: '',
                                        width: '100%',
                                        height: '100%',
                                        src: `/ui/flux-runner/?id=${params.rawId}`
                                    }
                                ]
                            }
                        ]
                    })
                } as any )*/
                let div = render(view)
                node.replaceWith(div)
            })
        })
        
        this.renderMode$.next(RenderMode.View)
    }

    toggleTemplate(){     
        this.renderMode$.next(RenderMode.Template)
    }
}

export enum ActionFooter {
    None = "None",
    Emoji = "Emoji",
    AttachFile = "AttachFile"
}


import { uuidv4 } from "@youwol/flux-core"
import { render } from "@youwol/flux-view"
import { GroupResponse } from "@youwol/flux-youwol-essentials"
import { ExpandableGroup } from "@youwol/fv-group"
import { BehaviorSubject, Subject } from "rxjs"
import { Client } from "../../client"
import { fluxAppView } from "./attach-flux.view"



export enum RenderMode{
    Template = 'Template',
    View = 'View'
}

export class NewPostState{

    insertedEmojis$ = new Subject<string>()
    insertedFluxApp$ = new Subject<any>()
    renderMode$ = new BehaviorSubject<RenderMode>(RenderMode.Template)
    templateDivId: string
    renderDivId : string
    
    constructor(
        public readonly user, 
        public readonly groupId: string
        ){
        let uuid = uuidv4()
        this.templateDivId = `template-div-${uuid}`
        this.renderDivId = `render-div-${uuid}`
    }

    getContent(){

        let nodeTemplate = document.getElementById(this.templateDivId) as HTMLDivElement
        let templateStr = ""

        Array.from(nodeTemplate.children).forEach( child => {

            if(child.classList.contains('flux-app')){
                templateStr += `\n\n--flux-app| return {rawId:"${child.id}",name:"${child['data'].name}", minWidth:"${child['data'].minWidth}",aspectRatio:"${child['data'].aspectRatio}"}|`
            }
            else{
                templateStr += "\n"+child['innerText']
            }
        })
        return templateStr
    }

    toggleRender(){

        let templateStr = this.getContent()

        let nodeView =  document.getElementById(this.renderDivId)
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
                let div = render(view)
                node.replaceWith(div)
            })
        })
        
        this.renderMode$.next(RenderMode.View)
    }

    toggleTemplate(){     
        this.renderMode$.next(RenderMode.Template)
    }

    post(postData : { author, groupId, content}){
        Client.post( { ...postData, ...{time: Date.now()} }) 
    }
}

export enum ActionFooter {
    None = "None",
    Emoji = "Emoji",
    AttachFile = "AttachFile"
}


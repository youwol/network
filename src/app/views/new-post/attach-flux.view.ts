import { attr$, child$, VirtualDOM } from "@youwol/flux-view"
import { ImmutableTree } from "@youwol/fv-tree"
import { Interfaces, ModuleExplorer } from "@youwol/flux-files"
import { AssetsGatewayClient, Drive } from "@youwol/flux-youwol-essentials"
import { BehaviorSubject, combineLatest, Observable, ReplaySubject } from "rxjs"
import { filter, map } from "rxjs/operators"
import { ExpandableGroup } from "@youwol/fv-group"


export class Group {

    public readonly id: string
    public readonly path: string

    constructor({ id, path }: { id: string, path: string }) {
        this.id = id
        this.path = path
    }
}

export class RootNode extends ModuleExplorer.Node {

    public readonly basePath: string
    static events$ = new ReplaySubject<Interfaces.EventIO>()

    static groups$(basePath: string) {
        let assetsGtwClient = new AssetsGatewayClient({ basePath })
        return assetsGtwClient.getGroups(RootNode.events$).pipe(
            map(({ groups }: { groups: Array<Group> }) => {
                return groups.map(group => new GroupNode({ group, basePath }))
            })
        )
    }

    constructor({ id, name, basePath }: { id: string, name: string, basePath: string }) {
        super({ id, name, children: RootNode.groups$(basePath), events$: RootNode.events$ })
        this.basePath = basePath
    }
}

export class GroupNode extends ModuleExplorer.Node {

    public readonly group: Group
    public readonly name: string
    public readonly basePath: string

    static events$ = new ReplaySubject<Interfaces.EventIO>()

    static drives$(groupId: string, basePath: string) {
        let assetsGtwClient = new AssetsGatewayClient({ basePath })
        return assetsGtwClient.getDrives(groupId, GroupNode.events$).pipe(
            map(({ drives }) => {
                return drives.map(({ driveId, name }) => {
                    let drive = new Drive(driveId, name, assetsGtwClient)
                    return new ModuleExplorer.DriveNode({ drive })
                })
            })
        )
    }
    constructor(
        { group, basePath }: { group: Group, basePath: string }) {
        super({
            id: group.id,
            name: group.path,
            children: GroupNode.drives$(group.id, basePath),
            events$: GroupNode.events$.pipe(filter(event => event.targetId == group.id))
        })
        this.group = group
        this.name = group.path
        this.basePath = basePath
    }
}

function treeItemView(state: ExplorerState, node: ModuleExplorer.Node) {

    let customHeadersView = [
        {
            target: (n: ModuleExplorer.Node) => n instanceof ModuleExplorer.FileNode && n.file['metadata'].kind == 'flux-project',
            classes: 'd-flex align-items-center fv-pointer',
            icon: 'fas fa-cloud-download-alt'
        },
        {
            target: (n: ModuleExplorer.Node) => n instanceof ModuleExplorer.FileNode,
            classes: 'd-flex align-items-center fv-pointer fv-text-disabled'
        },
        {
            target: (n: ModuleExplorer.Node) => n instanceof GroupNode && n.id.includes('private'),
            icon: 'fas fa-user',
        },
        {
            target: (n: ModuleExplorer.Node) => (n instanceof RootNode) || (n instanceof GroupNode && !n.id.includes('private')),
            icon: 'fas fa-users',
        }
    ]

    return ModuleExplorer.headerView(state as any, node, customHeadersView)
}


export function attachFileIconView(): VirtualDOM {

    return {
        tag: 'i',
        class: 'fv-pointer rounded m-1 fas fa-paperclip',
    }
}

class ExplorerState extends ImmutableTree.State<ImmutableTree.Node>{

    status$: Observable<{ assetId: string, status: any }>

    constructor({ rootNode, status$, expandedNodes }) {
        super({ rootNode, expandedNodes })

        this.status$ = status$
    }
}

export function attachFileExpandedView(file$): VirtualDOM {

    let treeState = new ImmutableTree.State<ImmutableTree.Node>({
        rootNode: new RootNode({ id: 'root', name: 'groups', basePath: `/api/assets-gateway` }),
        expandedNodes: ['root'],
    })

    let treeView = new ImmutableTree.View({
        state: treeState,
        headerView: treeItemView,
        class: 'fv-bg-background fv-text-primary flex-grow-1 overflow-auto',
        style: { 'min-height': '0' },
        connectedCallback: (elem) => {

            let sub = treeState.selectedNode$.pipe(
                filter(node => node instanceof ModuleExplorer.FileNode),
                filter((fileNode: ModuleExplorer.FileNode) => fileNode.file['metadata'].kind == 'flux-project')
            ).subscribe(node => file$.next(node.file))

            elem.ownSubscriptions(sub)
        }
    } as any)

    return treeView
}



class FluxAppState extends ExpandableGroup.State{

    minWidth$ : BehaviorSubject<string>
    aspectRatio$ : BehaviorSubject<string>

    constructor(name, public readonly rawId, minWidth='100%', aspectRatio = '1'){
        super(name, false)
        this.minWidth$ = new BehaviorSubject<string>(minWidth)
        this.aspectRatio$ = new BehaviorSubject<string>(aspectRatio)
    }
}

export function headersParamsView( state : FluxAppState) {

    let attrView = (name, subject$) => {
        return {
            class:'d-flex px-2 align-items-center',
            children: [
                {   class:'px-2',
                    tag: 'span',
                    innerText: name
                },
                {
                    tag: 'input',
                    type: "text",
                    value: attr$(subject$, (s) => s ),
                    onchange: (ev) => subject$.next(ev.target.value)
                }
            ]
        }
    }

    return child$(
        state.expanded$,
        (expanded) => expanded 
            ?   { 
                    class: 'd-flex',                             
                    style: { fontSize:'x-small'}, 
                    children:[
                        attrView('min. width', state.minWidth$),
                        attrView('aspect ratio', state.aspectRatio$)
                    ],
                    onclick: (ev) => {ev.stopPropagation()}
                }
            :   {}
    )
}

export function headerView(
    state: FluxAppState,
    paramsView) {

    return {
        class: "fv-bg-background-alt fv-text-primary fv-color-primary rounded fv-pointer d-flex align-items-center justify-content-between",
        children: [
            {   
                children:[
                    {
                        tag: 'i',
                        class: attr$(state.expanded$,
                            d => d ? "fa-caret-down" : "fa-caret-right",
                            { wrapper: (d) => "px-2 fas " + d }
                        )
                    },
                    {   tag: 'span', class: 'px-2', innerText: state.name, 
                        style: { 'user-select': 'none'}
                    } 
                ]
            },
            headersParamsView( state ),
            child$(
                state.expanded$,
                (expanded) => expanded 
                    ?   { 
                            class: 'd-flex px-2 align-items-center',              
                            children:[
                                {   tag:'a', 
                                    href:`/ui/flux-builder/?id=${state.rawId}`,
                                    class:'fas fa-wrench px-2'
                                },
                                {   tag:'a',
                                    href:`/ui/flux-runner/?id=${state.rawId}`,
                                    class:'fas fa-expand px-2'
                                }
                            ],
                            onclick: (ev) => {ev.stopPropagation()}
                        }
                    :   {}
            )
        ]
    }
}

export function fluxAppView(name: string, rawId: string, minWidth = '100%', aspectRatio = "1"): VirtualDOM {

    let state = new FluxAppState(name, rawId, minWidth, aspectRatio)
    let view = new ExpandableGroup.View({
        state,
        class: "d-flex flex-column",
        headerView: (s) => headerView(s, headersParamsView(s)),
        contentView: (state:FluxAppState) => ({
            class:'w-100  overflow-auto',
            children:[
                {   
                    class:'fv-bg-background',
                    style:attr$(
                        combineLatest([state.minWidth$, state.aspectRatio$]),
                                    ([w,ratio]) => {
                                        return { minWidth:w, aspectRatio: ratio, position:'relative'}
                                    }
                    ),
                    children: [
                        {
                            tag: 'iframe',
                            style:{
                                position: 'absolute',
                            },
                            title: '',
                            width: '100%',
                            height: '100%',
                            src: `/ui/flux-runner/?id=${rawId}`
                        }
                    ]
                }
            ]
        }
        )
    } as any )
    return {
        class:'flux-app',
        id: rawId,
        data: attr$(
            combineLatest([state.minWidth$, state.aspectRatio$]),
                        ([w,h]) => {
                            return { name, minWidth:w, aspectRatio: h}
                        }
        ),
        contentEditable: false,
        children:[view] 
    }
}
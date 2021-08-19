import { Interfaces, ModuleExplorer } from "@youwol/flux-files"
import { render, VirtualDOM } from "@youwol/flux-view"
import { AssetsGatewayClient, Drive, GroupResponse } from "@youwol/flux-youwol-essentials"
import { Modal } from "@youwol/fv-group"
import { ImmutableTree } from "@youwol/fv-tree"
import { merge, Observable, ReplaySubject, Subject } from "rxjs"
import { filter, map } from "rxjs/operators"



export class RootNode extends ModuleExplorer.Node {

    public readonly basePath: string
    static events$ = new ReplaySubject<Interfaces.EventIO>()

    static groups$(basePath: string) {
        let assetsGtwClient = new AssetsGatewayClient({ basePath })
        return assetsGtwClient.getGroups(RootNode.events$).pipe(
            map(({ groups }: { groups: Array<GroupResponse> }) => {
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

    public readonly group: GroupResponse
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
        { group, basePath }: { group: GroupResponse, basePath: string }) {
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

class ExplorerState extends ImmutableTree.State<ImmutableTree.Node>{

    status$: Observable<{ assetId: string, status: any }>

    constructor({ rootNode, status$, expandedNodes }) {
        super({ rootNode, expandedNodes })

        this.status$ = status$
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


export function popupWorkspaceBrowserModal(file$: Subject<Interfaces.File>) {

    let modalState = new Modal.State()
    let modalView = new Modal.View({
        state: modalState,
        contentView: () => {
            return workspaceBrowserView(file$)
        },
        connectedCallback: (elem) => {
            let sub = merge(modalState.cancel$, modalState.ok$, file$ ).subscribe( () =>{
                modalDiv.remove()
                file$.complete()
            })
            elem.ownSubscriptions(sub)
        }
    } as any)
    let modalDiv = render(modalView)
    document.querySelector("body").appendChild(modalDiv)
    return modalState.ok$
}

export function workspaceBrowserView(file$: Subject<Interfaces.File>): VirtualDOM {

    let treeState = new ImmutableTree.State<ImmutableTree.Node>({
        rootNode: new RootNode({ id: 'root', name: 'groups', basePath: `/api/assets-gateway` }),
        expandedNodes: ['root'],
    })

    let treeView = new ImmutableTree.View({
        state: treeState,
        headerView: treeItemView,
        class: 'fv-bg-background fv-text-primary flex-grow-1 overflow-auto p-3 rounded',
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


import { createObservableFromFetch } from "@youwol/flux-core"
import { AssetsGatewayClient, GroupResponse } from "@youwol/flux-youwol-essentials"
import { BehaviorSubject, ReplaySubject } from "rxjs"
import { map, tap } from "rxjs/operators"


export class AppState{

    selectedGroup$ = new ReplaySubject<GroupResponse>()
    groups$ = new BehaviorSubject<GroupResponse[]>([])
    user$ = new ReplaySubject<any>()

    constructor(){
        let client = new AssetsGatewayClient()

        let requestUserInfo = new Request(
            `/api/assets-gateway/user-info`
        );
        createObservableFromFetch( requestUserInfo).subscribe( resp => 
            console.log("User info", resp)
        )
        client.getGroups().pipe(
            map( ({groups}) => groups.filter(grp => !grp.id.includes('private'))),
            tap( (groups) => this.selectedGroup$.next(groups[0]))
        ).subscribe( grps => this.groups$.next(grps))
    }

    selectGroup(grpId: string){
        let grp = this.groups$.getValue().find( grp => grp.id == grpId)
        this.selectedGroup$.next(grp)
    }
}
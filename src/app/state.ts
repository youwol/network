import { createObservableFromFetch } from "@youwol/flux-core"
import { AssetsGatewayClient, GroupResponse } from "@youwol/flux-youwol-essentials"
import { BehaviorSubject, ReplaySubject } from "rxjs"
import { map, tap } from "rxjs/operators"
import { PostDocument } from "./client"




export class AppState{

    selectedDiscussion$ = new BehaviorSubject<PostDocument>(undefined)
    selectedGroup$ = new ReplaySubject<GroupResponse>(1)
    groups$ = new BehaviorSubject<GroupResponse[]>([])
    user$ = new ReplaySubject<any>(1)

    constructor(){

        let requestUserInfo = new Request(
            `/api/assets-gateway/user-info`
        );
        createObservableFromFetch( requestUserInfo).subscribe( resp => {
            this.user$.next(resp)
            this.groups$.next(resp.groups)
            this.selectedGroup$.next(resp.groups[0])
        })
    }

    selectGroup(grpId: string){
        let grp = this.groups$.getValue().find( grp => grp.id == grpId)
        this.selectedGroup$.next(grp)
    }

    toggleDiscussion(post: PostDocument){
        this.selectedDiscussion$.getValue() == post 
            ? this.selectedDiscussion$.next(undefined)
            : this.selectedDiscussion$.next(post) 
    }
}
import { Subject } from "rxjs"
import { share, tap } from "rxjs/operators"
import { AssetsBrowserClient, Group } from "./assets-browser.client"

export class AppState{

    selectedGroup$ : Subject<Group>
    groups$ = AssetsBrowserClient.getGroups$().pipe(
        share(),
        tap( grps => this.selectedGroup$.next(grps[0]))
    )

    constructor(){
    }
}
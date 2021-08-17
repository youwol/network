import { Observable, of } from "rxjs";
import { createObservableFromFetch } from '@youwol/flux-core';
import { map, tap } from "rxjs/operators";


export interface Group{
    id: string,
    path: string
}

export class AssetsBrowserClient {

    static urlBase = '/api/assets-gateway'
    static urlBaseOrganisation = '/api/assets-gateway/tree'
    static urlBaseAssets = '/api/assets-gateway/assets'
    static urlBaseRaws = '/api/assets-gateway/raw'
    

    static getGroups$() : Observable<Array<Group>> {
     
        let url = '/api/assets-gateway/groups'
        let request = new Request(url)
        return createObservableFromFetch(request).pipe(
            map( (resp:any) => resp.groups)
        ) as Observable<Array<Group>>
    }

}
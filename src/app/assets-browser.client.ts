import { Observable } from "rxjs";
import { createObservableFromFetch } from '@youwol/flux-core';




export class AssetsBrowserClient {

    static urlBase = '/api/assets-gateway'
    static urlBaseOrganisation = '/api/assets-gateway/tree'
    static urlBaseAssets = '/api/assets-gateway/assets'
    static urlBaseRaws = '/api/assets-gateway/raw'
    

    static getGroups$() {

        let url = '/api/assets-gateway/groups'
        let request = new Request(url)
        return createObservableFromFetch(request) as Observable<Array<any>>
    }

}
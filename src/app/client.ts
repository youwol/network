import { Interface } from "node:readline";
import { Observable, of } from "rxjs";



export interface Post{

    time: number
    author: string
    groupId: string
    content: string
}

export class Client{

    static storage = localStorage.getItem('network') 
        ? JSON.parse(localStorage.getItem('network')):
        {
            covers: {},
            posts: []
        };


    static setCoverApp(grpId, rawId): Observable<string>{

        Client.storage.covers[grpId] = `/ui/flux-runner/?id=${rawId}`
        localStorage.setItem('network', JSON.stringify(Client.storage)) 
        return Client.getCoverAppUrl(grpId)
    }

    static getCoverAppUrl(grpId) : Observable<string>{

        return of(Client.storage.covers[grpId])
    }

    static post({time,author,groupId,content}){

        this.storage.posts.unshift({time,author,groupId,content});
    }

    static getPosts(groupId, fromTime, count): Observable<Array<Post>>{

        let posts = this.storage.posts.filter( (post: Post) => {
            post.groupId == groupId
        })
        return of(posts)
    }
}
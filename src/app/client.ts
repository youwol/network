import { createObservableFromFetch } from "@youwol/flux-core";
import { Observable, ReplaySubject } from "rxjs";
import * as _ from 'lodash'
import { tap } from "rxjs/operators";


export interface PostDocument{
    postId: string
    time: number
    author: string
    groupId: string
    content: string
}

export interface CommentDocument extends PostDocument{
    parentPostId: string
}

export interface EmojiDocument{
    emoji: string
    postId: string
    userId: string
}

export interface ProfileDocument{
    groupId: string
    title: string
    icon: string
    coverApp: string
}



export class Client{

    static urlNetworkBackend = "/api/network-backend"
    static INITIAL_FETCH_COUNT = 10
    static INCREMENTAL_FETCH_COUNT = 5

    static storage = localStorage.getItem('network') 
        ? JSON.parse(localStorage.getItem('network')):
        {
            covers: {},
            posts: [],
            emojis: [],
            comments: [],
            profiles: []
        };

    static posts$ : {[key:string]: ReplaySubject<PostDocument[]>} = {}
    static lastTime : {[key:string]: number} = {}
    static emoji$ : {[key:string]: ReplaySubject<EmojiDocument[]>} = {}
    static comment$ : {[key:string]: ReplaySubject<CommentDocument[]>} = {}
    static profileSettings$ : {[key:string]: ReplaySubject<ProfileDocument>} = {}

    static getProfileSettings$(groupId) {

        if(!Client.profileSettings$[groupId]){
            Client.profileSettings$[groupId] = new ReplaySubject<ProfileDocument>()

            let request = new Request(`${Client.urlNetworkBackend}/groups/${groupId}`)
            fetch(request).then( resp => resp.json()).then( (profile) => {
                Client.profileSettings$[groupId].next(profile)
            })
        }
        return Client.profileSettings$[groupId]
    }

    static setProfile({groupId, title, icon, coverApp}) {

        let body = {
            displayName: groupId,
            title,
            icon,
            coverApp
        }
        let request = new Request(
            `${Client.urlNetworkBackend}/groups/${groupId}`, 
            {method:'PUT', body:JSON.stringify(body)})

        fetch(request).then( resp => resp.json()).then( (profile) => {
            this.profileSettings$[groupId].next(profile)
        })
    }

    static getPosts$(groupId: string): Observable<Array<PostDocument>>{

        if(!Client.posts$[groupId]){
            Client.posts$[groupId] = new ReplaySubject<PostDocument[]>()
            let body = {
                count: Client.INITIAL_FETCH_COUNT
            }
            let request = new Request(
                `${Client.urlNetworkBackend}/query/groups/${groupId}/posts`,
                { method: 'POST', body: JSON.stringify(body)}
                )
            fetch(request).then( resp => resp.json()).then( ({posts}) => {
                if(posts.length>0)
                    Client.lastTime[groupId] = _.last(posts).time - 1
                Client.posts$[groupId].next(posts)
            })
        }
        return this.posts$[groupId]
    }

    static getMorePosts(groupId: string) {
        let body = {
            count: Client.INCREMENTAL_FETCH_COUNT,
            fromTime:Client.lastTime[groupId]
        }
        let request = new Request(
            `${Client.urlNetworkBackend}/query/groups/${groupId}/posts`,
            { method: 'POST', body: JSON.stringify(body)}
            )
        fetch(request).then( resp => resp.json()).then( ({posts}) => {
            if(posts.length>0)
                Client.lastTime[groupId] = _.last(posts).time - 1
            Client.posts$[groupId].next(posts)
        })
    }

    static post$({author,groupId,content}){

        let body = {
            content
        }
        let request = new Request(
            `${Client.urlNetworkBackend}/groups/${groupId}/posts`,
            { method: 'POST', body: JSON.stringify(body)}
            )
        return createObservableFromFetch(request).pipe(
            tap(({postId, time, author, groupId, content}) => {
                this.posts$[groupId].next([{postId, time, author,groupId,content}])
            })
        )
    }

    static getEmojis$(groupId: string, postId: string) {

        if(!this.emoji$[postId]){
            this.emoji$[postId] = new ReplaySubject<EmojiDocument[]>()
            let request = new Request(
                `${Client.urlNetworkBackend}/groups/${groupId}/posts/${postId}/emojis`
                )
            fetch(request).then( resp => resp.json()).then( ({emojis}) => {
                this.emoji$[postId].next(emojis)
            })
        }
        return this.emoji$[postId]
    }

    static postEmoji(groupId: string, postId: string, emoji: string, userId: string){
        let request = new Request(
            `${Client.urlNetworkBackend}/groups/${groupId}/posts/${postId}/emojis/${emoji}`,
            { method: 'PUT' }
            )
        fetch(request).then( resp => resp.json()).then( ({emojis}) => {
            this.emoji$[postId].next(emojis)
        })
    }

    static getComment$(groupId: string, postId: string) {

        if(!this.comment$[postId]){
            this.comment$[postId] = new ReplaySubject<CommentDocument[]>()
            let request = new Request(
                `${Client.urlNetworkBackend}/groups/${groupId}/posts/${postId}/discussions`
                )
            fetch(request).then( resp => resp.json()).then( ({posts}) => {
                this.comment$[postId].next(posts)
            })
        }
        return this.comment$[postId]
    }

    static postComment$({postId, content, userId, groupId} : {postId: string, content: string, userId: string, groupId: string}){

        let body = {
            content
        }
        let request = new Request(
            `${Client.urlNetworkBackend}/groups/${groupId}/posts/${postId}/discussions`,
            { method: 'POST', body: JSON.stringify(body)}
            )
        return createObservableFromFetch(request).pipe(
            tap(({postId, parentPostId, time, author, groupId, content}) => {
                this.comment$[parentPostId].next([{postId, parentPostId, time, author,groupId,content}])
            })
        )
    }
}
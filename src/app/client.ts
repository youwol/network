import { uuidv4 } from "@youwol/flux-core";
import { Observable, ReplaySubject } from "rxjs";
import { animalsEmojiList } from "./views/shared/emojis-browser.view";
import * as _ from 'lodash'


export interface PostDocument{
    id: string
    time: number
    author: string
    groupId: string
    content: string
}

export interface CommentDocument extends PostDocument{
    postId: string
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

    static FETCH_COUNT = 5
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

        if(!this.profileSettings$[groupId]){
            this.profileSettings$[groupId] = new ReplaySubject<ProfileDocument>()

            let profile : ProfileDocument = this.storage.profiles.find( (profile: ProfileDocument) => {
                return profile.groupId == groupId
            })
            if(!profile){
                let index = Math.floor(animalsEmojiList.length*Math.random())
                Client.setProfile({groupId, title:'', icon:animalsEmojiList[index], coverApp:''})
                return this.profileSettings$[groupId]
            }
            profile = { 
                groupId,
                title: profile?.title || '',
                icon: profile?.icon || '',
                coverApp: profile?.coverApp ||''
            }
            this.profileSettings$[groupId].next(profile)
        }
        return this.profileSettings$[groupId]
    }

    static setProfile({groupId, title, icon, coverApp}) {

        this.storage.profiles = this.storage.profiles
        .filter( d=> d.groupId != groupId)
        .concat([{groupId, title, icon, coverApp}])
        localStorage.setItem('network', JSON.stringify(Client.storage)) 
        this.profileSettings$[groupId].next({groupId, title, icon, coverApp})
    }

    static getPosts$(groupId: string): Observable<Array<PostDocument>>{

        if(!this.posts$[groupId]){
            this.posts$[groupId] = new ReplaySubject<PostDocument[]>()

            let posts = this.storage.posts.filter( (post: PostDocument) => {
                return post.groupId == groupId
            })
            if( posts.length == 0)
                return this.posts$[groupId]
            posts.sort( (lhs, rhs) => lhs.time > rhs.time)
            posts = posts.slice(0,Client.FETCH_COUNT)
            this.lastTime[groupId] = _.last(posts).time
            this.posts$[groupId].next(posts.slice(0,Client.FETCH_COUNT))
        }
        return this.posts$[groupId]
    }

    static getMorePosts(groupId: string) {

        let posts = this.storage.posts.filter( (post: PostDocument) => {
            return post.groupId == groupId && post.time < this.lastTime[groupId]
        })
        posts.sort( (lhs, rhs) => lhs.time > rhs.time)
        posts = posts.slice(0,Client.FETCH_COUNT)
        if(posts.length==0)
            return 
        this.lastTime[groupId] = _.last(posts).time
        this.posts$[groupId].next(posts.slice(0,Client.FETCH_COUNT))
    }

    static post({author,groupId,content}){
        let postId = uuidv4()
        let time = Date.now()
        this.storage.posts.unshift({time,author,groupId,content, id: postId});
        localStorage.setItem('network', JSON.stringify(Client.storage)) 
        this.posts$[groupId].next([{id:postId, time,author,groupId,content}])
    }

    static getEmojis$(postId: string) {

        if(!this.emoji$[postId]){
            this.emoji$[postId] = new ReplaySubject<EmojiDocument[]>()

            let emojis = this.storage.emojis.filter( (emoji: EmojiDocument) => {
                return emoji.postId == postId
            })
            this.emoji$[postId].next(emojis)
        }
        return this.emoji$[postId]
    }

    static postEmoji(postId: string, emoji: string, userId: string){

        let doc : EmojiDocument = {postId, userId, emoji} 
        this.storage.emojis.push(doc)
        localStorage.setItem('network', JSON.stringify(Client.storage)) 
        this.emoji$[postId].next([doc])

    }

    static getComment$(postId: string) {

        if(!this.comment$[postId]){
            this.comment$[postId] = new ReplaySubject<CommentDocument[]>()

            let comments = this.storage.comments
            .filter( (comment: CommentDocument) => {
                return comment.postId == postId
            })
            comments.sort( (c0,c1) => c0.time - c1.time)
            this.comment$[postId].next(comments)
        }
        return this.comment$[postId]
    }

    static postComment({postId, content, userId, groupId} : {postId: string, content: string, userId: string, groupId: string}){

        let id = uuidv4()
        let doc : CommentDocument = {id, groupId, postId, author: userId, content, time: Date.now()} 
        this.storage.comments.push(doc)
        localStorage.setItem('network', JSON.stringify(Client.storage)) 
        this.comment$[postId].next([doc])
    }
}
import { uuidv4 } from "@youwol/flux-core";
import { Interface } from "node:readline";
import { Observable, of, ReplaySubject, Subject } from "rxjs";



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


export class Client{

    static storage = localStorage.getItem('network') 
        ? JSON.parse(localStorage.getItem('network')):
        {
            covers: {},
            posts: [],
            emojis: [],
            comments: []
        };

    static posts$ : {[key:string]: ReplaySubject<PostDocument[]>} = {}
    static emoji$ : {[key:string]: ReplaySubject<EmojiDocument[]>} = {}
    static comment$ : {[key:string]: ReplaySubject<CommentDocument[]>} = {}

    static setCoverApp(grpId, rawId): Observable<string>{

        Client.storage.covers[grpId] = `/ui/flux-runner/?id=${rawId}`
        localStorage.setItem('network', JSON.stringify(Client.storage)) 
        return Client.getCoverAppUrl(grpId)
    }

    static getCoverAppUrl(grpId) : Observable<string>{

        return of(Client.storage.covers[grpId])
    }

    static getPosts$(groupId): Observable<Array<PostDocument>>{

        if(!this.posts$[groupId]){
            this.posts$[groupId] = new ReplaySubject<PostDocument[]>()

            let posts = this.storage.posts.filter( (post: PostDocument) => {
                return post.groupId == groupId
            })
            this.posts$[groupId].next(posts)
        }
        return this.posts$[groupId]
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
import { childrenAppendOnly$ } from "@youwol/flux-view"
import { Client, PostDocument } from "../../client"
import { AppState } from "../../state"
import { NewPostState } from "../new-post/models"
import { newPostView } from "../new-post/new-post.view"
import { postView } from "../posts/posts.view"


class NewCommentState extends NewPostState{

    constructor(public readonly seedPost: PostDocument, author: string){
        super(author, seedPost.groupId)
    }

    post( {author, groupId, content} : { author: string, groupId: string, content: string}){
        Client.postComment$( {postId: this.seedPost.postId, content, groupId, userId: author}).subscribe( () =>
            this.clearTemplate()
        )
    }
}

export function newCommentView( post: PostDocument, userId: string) {

    let state = new NewCommentState(post, userId)
    return {
        class:'py-2',
        children:[newPostView(state)] 
    }    
}

export function commentsListView(seedingPost: PostDocument, user, appState:AppState){

    return {
        class: '',
        style:{height:'0px'},
        children: childrenAppendOnly$(
            Client.getComment$(seedingPost.groupId, seedingPost.postId),
            (comment) => {
                return postView(comment, user, [], appState)
            },
            {
                orderingIndex: (comment) => -comment.time
            }
        )
    }
}

export function discussionView(post: PostDocument, user, appState: AppState/*group: GroupResponse, post: PostDocument, user*/){

    let extraActions = []
    let view = {
        class:'w-25 border-left px-2 d-flex flex-column overflow-auto',
        children:[
            postView(post, user, extraActions, appState),
            {   tag: 'hr',  class: 'fv-color-primary mx-2'},
            newCommentView(post, user),
            {   tag: 'hr',  class: 'fv-color-primary mx-2'},
            commentsListView(post, user, appState)
        ]
    }
    return view
}
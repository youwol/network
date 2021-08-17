import { Environment, ErrorLog, ModuleError } from '@youwol/flux-core'
import {render} from '@youwol/flux-view'
import { filter } from 'rxjs/operators'

/**
 * Plug the notification system to the application environment.
 * 
 * For now, only module's errors (ModuleError in flux-core) are handled.
 * 
 * @param environment application's environment
 */
export function plugNotifications(environment: Environment){

    environment.errors$.pipe(
        filter(  (log:ErrorLog) => log.error instanceof ModuleError )
    ).subscribe(
        (log:ErrorLog<ModuleError>) => Notifier.error({ 
            message: log.error.message, 
            title:  log.error.module.Factory.id
        })
    )
}

/**
 * This class provides a notification system that popups message in the 
 * HTML document.
 * 
 * For now, only module's errors (ModuleError in flux-core) are handled.
 */
export class Notifier{

    static classesIcon={
        4: "fas fa-2x fa-exclamation-circle text-danger px-2 mt-auto mb-auto",
        3: "fas fa-2x fa-exclamation text-warning px-2 mt-auto mb-auto",
    }
    static classesBorder={
        4: "border-danger",
        3: "border-warning",
    }

    constructor(){

    }
    /**
     * Popup a notification with level=='Info'
     * 
     * @param message content
     * @param title title
     */
    static notify({message, title}){

        Notifier.popup( { message, title, classIcon:"", classBorder:"" } )
    }
    /**
     * Popup a notification with level=='Error'
     * 
     * @param message content
     * @param title title
     */
    static error( {message, title}){

        Notifier.popup( { message, title, classIcon:Notifier.classesIcon[4], classBorder:Notifier.classesBorder[4] } )
    }
    /**
     * Popup a notification with level=='Warning'
     * 
     * @param message content
     * @param title title
     */
    static warning( {message, title}){

        Notifier.popup( { message, title, classIcon:Notifier.classesIcon[3], classBorder:Notifier.classesBorder[3] } )
    }

    private static popup( { message, title, classIcon, classBorder } ){

        let view = {
            class:"m-2 p-2 my-1 bg-white " + classBorder,
            style: {border:'solid'},
            children:[
                {
                    class:"fas fa-times",
                    style:{float:'right',cursor:'pointer'},
                    onclick: (event)=> {
                        event.target.parentElement.remove()
                    } 
                },
                {
                    class:'d-flex py-2',
                    children:[
                        {tag:'i', class: classIcon },
                        {
                            children:[
                                {tag:'span', class:'d-block',innerText:title},
                                {tag:'span', class:'d-block', innerText:message}
                            ]
                        }
                    ]
                }
            ]
        }
        let div = render(view)
        document.getElementById("notifications-container").appendChild(div)
    }
}
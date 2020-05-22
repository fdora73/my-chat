import {OutgoingPacket} from './chat'
import {InboxDto} from './chat'
import {IncomingPacket} from './chat'
import {EventProducer} from './EventProducer'
import {MessageDto} from './chat'

interface ProxyEventMap
{
    "login": () => void;
    "message": ( channelId: string, message: MessageDto ) => void;
    "conversation": ( channelId: string ) => void;
}

class Proxy extends EventProducer<ProxyEventMap>
{
    private ws: WebSocket;
    inbox: InboxDto | null = null;

    constructor()
    {
        super();
        //console.log("Ctor");
        this.ws = new WebSocket( "wss://raja.aut.bme.hu/chat/" );

        this.ws.addEventListener( "message", e =>
        {
            console.log(e);
            let p = <IncomingPacket>JSON.parse( e.data );
            switch ( p.type )
            {
                case "error":
                    alert( p.message );
                    break;
                case "login":
                    this.inbox = p.inbox;
                    this.dispatch( "login" );
                    break;
                case "message":
                    let cid = p.channelId;
                    this.inbox!.conversations.find( x => x.channelId === cid )?.lastMessages.push( p.message );
                    this.dispatch( "message", cid, p.message );
                    break;
                case "conversationAdded":
                    this.inbox!.conversations.push( p.conversation );
                    this.dispatch( "conversation", p.conversation.channelId );
                    break;
            }
        });

        /*this.sleep(4000).then(() =>
        {
            this.sendPacket({
            type: "register", 
            email: "hehe", 
            password: "hehe",
            displayName: "Hehe", 
            staySignedIn: true 
          });
        });*/
    }

    sendPacket( packet: OutgoingPacket )
    {
        this.ws.send( JSON.stringify( packet ) );
    }

    /*
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }*/
}
export var proxy = new Proxy();
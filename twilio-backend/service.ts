// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
import {createProxy, writeServiceData, writeTwilioNumber} from "../core/firebase_helper";
import {PhoneNumberInstance} from "twilio/lib/rest/proxy/v1/service/phoneNumber";
import {ParticipantInstance} from "twilio/lib/rest/proxy/v1/service/session/participant";
import {MessageInteractionInstance} from "twilio/lib/rest/proxy/v1/service/session/participant/messageInteraction";

require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
//const accountSid = 'ACe86ff95c518d2466aef21d6a765bee7e';
const authToken = process.env.TWILIO_AUTH_TOKEN;
//const authToken = 'b9679bf7cf6209ded08423e1269fe128'
const client = require('twilio')(accountSid, authToken);

export function createService(driverName: string) {
    console.log('created service');
    //UnhandledPromiseRejectionWarning: Error: Service UniqueName must be unique.
    return client.proxy.services.create({uniqueName: driverName})
}

export function addTwilioNumber(serviceSID : string, phoneSID : string) : void {
    client.proxy.services(serviceSID)
        .phoneNumbers
        .create({sid: phoneSID })
        .then((phone_number: PhoneNumberInstance)=> {
            console.log('added twilio number');
            writeTwilioNumber(phone_number.sid);
        });
}



export async function createSession(serviceSID: string, sessionName: string) {

    // UnhandledPromiseRejectionWarning: Error: Session UniqueName must be unique.
    return client.proxy.services(serviceSID).sessions.create({uniqueName: sessionName}) //orderID is the sessionName
     //this will be created for every conversation
}

export function deleteSession(serviceSID: string, sessionSID: string): Promise<boolean> {
    console.log('deleting session: ', sessionSID)
    return client.proxy.services(serviceSID)
        .sessions(sessionSID)
        .remove();
}


export async function addParticipants(customerName: string, customerPhone: number,
                                      driverName: string, driverPhone: number,
                                      serviceSID: string, sessionSID: string, orderID: string) {
    //Adding driver to session
    await client.proxy.services(serviceSID)
        .sessions(sessionSID)
        .participants
        .create({friendlyName: driverName, identifier: driverPhone.toString()})
        .then((participant: ParticipantInstance) => {
            console.log('added driver');
            console.log('driver identifier: ', participant.proxyIdentifier)

        });
    //Adding customer to session
    await client.proxy.services(serviceSID)
        .sessions(sessionSID)
        .participants
        .create({friendlyName: customerName, identifier: customerPhone.toString()})
        .then((participant: ParticipantInstance) => {
            console.log('added customer');
            console.log('customer identifier', participant.proxyIdentifier);
            sendInitialTextToCustomer(serviceSID, sessionSID, participant.sid, orderID);
        });

}

export function sendInitialTextToCustomer(serviceSID: string, sessionSID: string, participantSID: string, orderID: string) {

    client.proxy.services(serviceSID)
        .sessions(sessionSID)
        .participants(participantSID)
        .messageInteractions
        .create({body: 'Your order ' + orderID + ' is 30 min away. Please reply to this chat if you would like to chat with your delivery driver.'})
        .then((message_interaction: MessageInteractionInstance) => console.log(message_interaction.sid));
    console.log('sent initial text to customer');
}


export function retrieveSessionLogs(serviceSID: string, sessionSID: string) {
    return client.proxy.services(serviceSID)
        .sessions(sessionSID)
        .interactions
        .list({limit: 20});
};

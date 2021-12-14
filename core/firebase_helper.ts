import {db} from '../firebase-backend/server';
import {ChatLog, Order, OrderWithID} from "../firebase-backend/types";
import {get, onValue, push, ref, remove, set, update} from 'firebase/database';
import {
    addParticipants,
    addTwilioNumber,
    createService,
    createSession,
    deleteSession,
    retrieveSessionLogs
} from "../twilio-backend/service";
import {ProxyService, ProxySession} from "../twilio-backend/types";
import {ServiceInstance} from "twilio/lib/rest/proxy/v1/service";
import {InteractionInstance} from "twilio/lib/rest/proxy/v1/service/session/interaction";
import firebase from "firebase/compat";
import OrderByDirection = firebase.firestore.OrderByDirection;




export function writeOrderData (order: OrderWithID) {
    set(ref(db, 'orders/' + order.id), {
        customerName: order.customerName,
        driverName: order.driverName,
        customerPhone: order.customerPhone,
        driverPhone: order.driverPhone
    });
   return({ success: true });
}

export function writeServiceData(driverName: string, phoneNumber: string, serviceSid: string) {
    set(ref(db, 'services/' + driverName), {
        driverName: driverName,
        phoneNumber: phoneNumber,
        serviceSid: serviceSid
    }).then(() => console.log('added service data to db'));
    return({ success: true });
}

export function writeSessionData(serviceSID: string, orderID: string, phoneNumber: string, sessionSID: string) {
    set(ref(db, 'sessions/' + orderID), {
        serviceSid: serviceSID,
        phoneNumber: phoneNumber,
        sessionSid: sessionSID
    }).then(() => console.log('added session data to db'));
    return({ success: true });
}

export function deleteSessionData(orderID: string) {
    let sessionRef = ref(db, 'sessions/' + orderID);
    return remove(sessionRef);
}

export function checkService(orderID: string, order: Order) {
    return get(ref(db, 'services/' + order.driverName))
        .then(async (snapshot) => {
            let proxyService: ProxyService = snapshot.val();
            console.log('checking if service exists', snapshot.exists())
            if (snapshot.exists()) {
                console.log('service exists already', proxyService.serviceSid)
                //check if twilio number status is true
                await createProxy(orderID, order);
                await updateNumberStatus(proxyService.phoneNumber, true);
                return {success: true, session: true, error: null};
            } else {
                console.log('service does not exist');
                await createService(order.driverName).then(async (service: ServiceInstance) => {
                    //generally, there will be another service to grab an available phone number
                    //getTwilioNumber()
                    await addTwilioNumber(service.sid, 'PNaa581e625e90e63677759175adf9544b');
                    await writeServiceData(order.driverName, 'PNaa581e625e90e63677759175adf9544b', service.sid);
                })
                return {success: true, session: false, error: null};
            }
        }).catch((error) => {return {success: false, session: false, error: error};});


}
/*
RestException [Error]:
This Service has no compatible Proxy numbers for this Participant.
Failed to find a proxy number for +1972804XXXX. All matching proxies
for this Participant are already in use in other Sessions.

^This error occurs when a service exists, but has no available phone numbers to create a proxy.
Our code is most likely functioning as intended, but we do not have enough twilio resources to
check generating multiple proxies on existing services.
*/
/*
write endSession logic which takes orderID (sessionName), retrieves info for order, and uses sessionSid and serviceSid
to end session. afterwards, remove session from firebase. also update number status to false as it is freed
 */

//await createProxy(orderID, service.sid, order, 'PNaa581e625e90e63677759175adf9544b' );

/*
call create proxy when -->
    getOrder returns order
    order passed into checkService
    checkService returns true, false, null
    createProxy creates session based on new checkService

*/

export function createProxy(orderID: string, order: Order) {
    return getService(order.driverName)
        .then((service) => {
            createSession(service.serviceSid, orderID).then(async (session) => {
                //write session data to firebase
                console.log('created session');
                await updateNumberStatus(service.phoneNumber, true);
                await writeSessionData(service.serviceSid, orderID, service.phoneNumber, session.sid);
                await addParticipants(order.customerName, order.customerPhone,
                    order.driverName, order.driverPhone,
                    service.serviceSid, session.sid, orderID)
                    .then(() => {
                        console.log('added participants')

                    });
            }).catch((error) => {return {success: false, session: false, error: error};});
            return {success: true, session: true, error: null};
        });

}

export function getOrder(orderID: string) {
    const orderRef = ref(db, 'orders/' + orderID);
    return get(orderRef).then((snapshot) => {
        let order: Order = snapshot.val();
        return order;
    });
}

export function getAllOrders() {
    const orderRef = ref(db, 'orders/');
    let orders: OrderWithID[] = [];
    return get(orderRef).then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const order = childSnapshot.val() as Order;
            orders.push({
                id: childSnapshot?.key,
                customerPhone: order.customerPhone,
                customerName: order.customerName,
                driverPhone: order.driverPhone,
                driverName: order.driverName});
        });
        return orders;
    });
}

export function getService(driverName: string) {
    const serviceRef = ref(db, 'services/' + driverName);
    return get(serviceRef)
        .then((snapshot) => {
            const service: ProxyService = snapshot.val();
            return service;
        });
}


export function getSession(orderID: string) {
    const sessionRef = ref(db, 'sessions/' + orderID);
    return get(sessionRef)
        .then((snapshot) => {
            const session: ProxySession = snapshot.val();
            return session;
        });
}

export function deleteProxy(orderID: string, serviceSID: string, sessionSID: string) {
    return deleteSessionData(orderID).then(() => {
        return deleteSession(serviceSID, sessionSID);
    });


}

export function writeTwilioNumber(phoneNumber: string) {
    set(ref(db, '/twilioNumbers/' + phoneNumber), {
        inUse: true
    }).then(() => console.log('added twilio number status', phoneNumber)); //this is not printing when this function is called);
    return({ success: true });
}

export function getTwilioNumber() {
    const phoneRef = ref(db, 'twilioNumbers/');
    let phoneData;
    onValue(phoneRef, (snapshot) => {
        phoneData = snapshot.val();
    })
    return({ success: true, data: phoneData });
}

export function updateNumberStatus(phoneNumber: string, status: boolean) {
    console.log('updating status of # ' + phoneNumber + ' to ' + status);
    let dbPhonePath = 'twilioNumbers/' + phoneNumber;
    const updates: Record<string, {inUse: boolean}> = {};
    updates[dbPhonePath] = {
        inUse: status
    };
    update(ref(db), updates)
}


export function writeSessionLogs(serviceSID: string, sessionSID: string, orderID: string) {
    return retrieveSessionLogs(serviceSID, sessionSID)
        .then(async (interactions: InteractionInstance[]) => {
            console.log(interactions);
            let sessionLogsRef = ref(db, 'sessionLogs/' +  orderID);
            for(let i = 0; i < interactions.length; i++) {
                const log = push(sessionLogsRef);
                set(log, {
                    message: interactions[i].data,
                    sender: interactions[i].outboundParticipantSid
                });
            }
            return {success: true, data: interactions}
        })
        .catch((error: any) => {return {success: false, error: error}});
}

export function getSessionLogs(orderID: string) {
    const sessionLogRef = ref(db, 'sessionLogs/' + orderID);
    let chatLogs: ChatLog[] = [];

    return get(sessionLogRef)
        .then((snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const childData = childSnapshot.val();
                chatLogs.push({message: childData.message.slice(9, -2), sender: childData.sender});
            });
            console.log(chatLogs);
            return chatLogs;
        });
}

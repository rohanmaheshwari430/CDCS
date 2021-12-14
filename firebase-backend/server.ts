// Import the functions you need from the SDKs you need
import cors = require("cors");
import express = require("express");
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from 'firebase/database';
import {Order, OrderWithID} from './types';
import {
    checkService,
    createProxy, deleteProxy, getAllOrders,
    getOrder, getSession, getSessionLogs, updateNumberStatus,
    writeOrderData,
    writeServiceData, writeSessionLogs,
    writeTwilioNumber
} from '../core/firebase_helper';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCiOsHT5ypM6p9wfKfDs2IPzOelyhd0_cM",
    authDomain: "np-te-orangeworks.firebaseapp.com",
    databaseURL: "https://np-te-orangeworks-3709b.firebaseio.com/",
    projectId: "np-te-orangeworks",
    storageBucket: "np-te-orangeworks.appspot.com",
    messagingSenderId: "170827507628",
    appId: "1:170827507628:web:db8e58f4da9d33d3a0fc09"
};

// Initialize Firebase and Database
const firebaseApp = initializeApp(firebaseConfig);
export const db = getDatabase(firebaseApp);

//Initialize Express app
const expressApp = express();
const port = process.env.PORT || 3000;
expressApp.use(cors());
expressApp.use(express.json());

//Get endpoint to test if server is live
expressApp.get('/hello', function (req, res) {
    res.send('welcome to THD server!');
}
);

//Post endpoint to create orders
expressApp.post('/writeOrderData', (req, res) => {
    const order : OrderWithID = req.body;
    console.log(order);
    res.send(writeOrderData(order));
});

//Get endpoint to retrieve an order by its id
expressApp.get('/getOrderData', async (req, res) => {
    const orderId = req.query.id as string;
    getOrder(orderId).then((    order) => {
        res.send(order);
    })
});

expressApp.get('/getAllOrderData', async(req, res) => {
    getAllOrders().then((orders) => {
        res.send({data: orders});
    })
});

expressApp.post('/writeTwilioNumber', (req, res) => {
    const phoneNumber : string = req.body.phoneNumber
    res.send(writeTwilioNumber(phoneNumber));
});

expressApp.post('/writeServiceData', (req, res) => {
    const driverName = req.body.driverName;
    const phoneNumber = req.body.phoneNumber;
    const serviceSid = req.body.serviceSid
    res.send(writeServiceData(driverName, phoneNumber, serviceSid));
});

expressApp.post('/generateProxy', (req, res) => {
    const orderID = req.body.orderId;
    const order: Order = req.body.order;
    createProxy(orderID, order).then((response) => {
        res.send(response);
    })
});

expressApp.post('/checkService', (req, res) => {
    const orderID = req.body.orderId;
    const order: Order = req.body.order;
    checkService(orderID, order)
        .then((response) => res.send(response));

});

expressApp.post('/deleteProxy', (req, res) => {
    const orderID = req.body.orderId;
    getSession(orderID)
        .then((session) => {
            updateNumberStatus(session.phoneNumber, false);
            deleteProxy(orderID, session.serviceSid, session.sessionSid)
                .then((response: boolean) => res.send({success: response}));
        });
});

expressApp.get('/writeSessionLogs', (req, res) => {
    const orderID = req.body.orderId;
    getSession(orderID)
        .then((session) => {
            writeSessionLogs(session.serviceSid, session.sessionSid, orderID)
                .then((response: any) => res.send(response))
        })
        .catch(() => res.send({error: "Invalid orderId. Order does not exist."}));
});

//Get endpoint to retrieve an order by its id
expressApp.get('/getSessionLogs', async (req, res) => {
    const orderId = req.query.id as string;
    getSessionLogs(orderId)
        .then((chatLogs) => res.send({data: chatLogs}));
});


expressApp.listen(port, () => {
    console.log(`THD server listening on port ${port}`);
});

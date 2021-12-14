import React, {useEffect, useState} from 'react';
import { Table, Tag, Space } from 'antd';

type ChatLog = {
    message: string;
    sender: string;
}

type Props = {
    orderID: string | null;
    customerName: string;
    customerPhone: string;
    driverName: string;
    driverPhone: string;
}

function DashboardEntry({orderID, customerName, customerPhone, driverName, driverPhone}: Props) {

    const [logs, setLogs] = useState<ChatLog[]>([]);

    const getSessionLogs = (orderId: string | null) => {
        fetch('/getSessionLogs?id=' + orderId)
            .then((res) => res.json())
            .then((jsonLogs) => setLogs(jsonLogs.data)); //should do setLogs here, but giving error
    }

    useEffect(() => {
        getSessionLogs(orderID);
    });


    return (<div>
        DashboardEntry Component
            <div>
                <p> Order ID: {orderID} </p>
                <p> Driver Name: {driverName}</p>
                <p> Driver Phone: {driverPhone}</p>
                <p>Customer Name: {customerName}</p>
                <p> Customer Phone: {customerPhone}</p>
                view logs button here
                <br/>
            </div>
    </div>)
}

export default DashboardEntry;

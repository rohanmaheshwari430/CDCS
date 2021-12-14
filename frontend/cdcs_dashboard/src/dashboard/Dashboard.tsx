import React, {useEffect, useState} from 'react';
import {Table, Space} from 'antd';
import {OrderWithID} from "../../../../firebase-backend/types";
import 'antd/dist/antd.css';
import {Link} from "react-router-dom";


function Dashboard() {
    const [orders, setOrders] = useState<OrderWithID[]>([]);


    const getOrders = () => {
        fetch('/getAllOrderData')
            .then((res) => res.json())
            .then((jsonOrder) => setOrders(jsonOrder.data));
    };

    const routeChange = (orderID: string) => {
        console.log(orderID);
    }

    const changeOrders = (orders: OrderWithID[]) => {
        let newOrders = [];
        for(let i = 0; i < orders.length; i++) {
            newOrders.push({
                id: orders[i].id,
                customerName: orders[i].customerName,
                customerPhone: orders[i].customerPhone,
                driverName: orders[i].driverName,
                driverPhone: orders[i].driverPhone,
                viewChatLogs: orders[i].id
            })
        }
        return newOrders;
    }

    useEffect(() => {
        getOrders();
    }, []);

    const columns = [
        {
            title: 'id',
            dataIndex: 'id',
            key: 'id'
        },
        {
            title: 'Customer Name',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Customer Phone',
            dataIndex: 'customerPhone',
            key: 'customerPhone',
        },
        {
            title: 'Driver Name',
            dataIndex: 'driverName',
            key: 'driverName',
        },
        {
            title: 'Driver Phone',
            dataIndex: 'driverPhone',
            key: 'driverPhone',
        },
        {
            title: 'View Chat Logs',
            key: 'viewChatLogs',
            dataIndex: 'viewChatLogs',
            render: (viewChatLogs: string) => (
                <Link to={'/view/' + viewChatLogs}>
                    <button>View Chat Logs</button>
                </Link>
            )
        }
    ];

    return (
            <div style={{height: orders.length * 100, width: 1200, position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
            <Table
                columns={columns}
                dataSource={changeOrders(orders)}
            />
        </div>
    )
}

export default Dashboard;

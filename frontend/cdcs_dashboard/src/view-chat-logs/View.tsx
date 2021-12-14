import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {ChatLog} from "../../../../firebase-backend/types";
import {Table} from 'antd';
import 'antd/dist/antd.css';




function View() {

    let {id} = useParams();

    const [logs, setLogs] = useState<ChatLog[]>([]);

    const getLogs = (orderID: string | undefined) => {
        fetch('/getSessionLogs/?id=' + orderID)
            .then((res) => res.json())
            .then((jsonLogs) => setLogs(jsonLogs.data));
    };

    const formatLogs = (logs: ChatLog[]) => {

        let userIdMap = new Map<string, string>();
        userIdMap.set(logs[0]?.sender, 'Customer');
        if(logs.length > 1) {
            userIdMap.set(logs[1]?.sender, 'Driver');
        }
        logs.forEach((log) => {
            log.sender = userIdMap.get(log.sender)!;
        });

        return logs;
    };

    useEffect(() => {
        getLogs(id);
    }, []);

    const columns = [
        {
            title: 'Sender',
            dataIndex: 'sender',
            key: 'sender'
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message'
        }
    ]

    return (
        <div>
            <Table
                columns={columns}
                dataSource={formatLogs(logs)}
            />
        </div>
    );
}

export default View;

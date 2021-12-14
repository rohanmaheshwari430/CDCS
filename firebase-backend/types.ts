export type Order = {
    customerName: string,
    customerPhone: number,
    driverName: string,
    driverPhone: number
}

export type OrderWithID = {
    id: string | null,
    customerName: string,
    customerPhone: number,
    driverName: string,
    driverPhone: number

}

export type ChatLog = {
    message: string,
    sender: string
}

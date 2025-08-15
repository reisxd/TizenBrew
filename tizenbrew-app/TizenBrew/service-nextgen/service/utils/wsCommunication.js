class Connection {
    constructor(connection) {
        this.connection = connection;
        this.isReady = false;
    }

    send(data) {
        this.connection.send(JSON.stringify(data));
    }

    Event(event, payload) {
        return {
            type: event,
            payload: payload
        };
    }
}

const Events = {
    Ready: -1,
    AppControlData: 0,
    GetDebugStatus: 1,
    CanLaunchInDebug: 2,
    ReLaunchInDebug: 3,
    GetModules: 4,
    LaunchModule: 5,
    StartService: 6,
    GetServiceStatuses: 7,
    Error: 8,
    CanLaunchModules: 9,
    ModuleAction: 10
};

module.exports = {
    Connection,
    Events
};
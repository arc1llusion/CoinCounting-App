
import { EventEmitter, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

import { CoinDto } from '../api/coinDto';
import { ApiUrl } from '../constants/constants';

//A service for handling the client side hub connection
@Injectable()
export class SignalRService {
    public DepositBroadcast = new EventEmitter<CoinDto>();
    public connection?: ConnectionInfo = undefined;

    //Closes the hub connection, if it exists
    public CloseConnection() {
        this.connection?.Connection.stop();
    }

    ///Creates a connection to the API Coin Deposit Hub
    private CreateConnection(): ConnectionInfo {
        let localConnection: HubConnection;

        localConnection = new HubConnectionBuilder()
            .withUrl(ApiUrl + '/Hubs/DepositHub')
            .configureLogging(LogLevel.Information)
            .build();

        localConnection.serverTimeoutInMilliseconds = 30 * 1000 * 10; //Server is 30 seconds
        localConnection.keepAliveIntervalInMilliseconds = 30 * 1000;

        const conInfo: ConnectionInfo = {
            Connection: localConnection,
            ManuallyStopped: false,
            Name: 'DepositHub'
        }

        //If the connection closes for any reason other than being stopped manually, try to reconnect
        localConnection.onclose((error) => {
            if (!conInfo.ManuallyStopped) {
                this.retryConnect(localConnection);
            }
        });

        return conInfo;
    }

    //Starts the connection and being ready for broadcast signals from the API
    public StartConnection() {
        let localConnection = this.CreateConnection();

        this.connection = localConnection;

        //This is an event handler for the "Broadcast" message from the hub on the API
        this.connection.Connection.on('Broadcast', (message: CoinDto) => {
            this.DepositBroadcast.emit(message);
        });

        //Actually responsible for starting the connection to the API hub
        this.connection.Connection.start().then((data: any) => {
        });
    }

    ///Keeps trying to connect in the event of an error
    private async retryConnect(connection: HubConnection) {
        setTimeout(async () => {
            try {
                await connection.start();
            } catch {
                this.retryConnect(connection);
            }
        }, 1000 * 5);
    }
}

interface ConnectionInfo {
    Name: string;
    Connection: HubConnection;
    ManuallyStopped: boolean;
}
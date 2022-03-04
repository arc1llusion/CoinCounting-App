
import { EventEmitter, Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

import { CoinDto } from '../api/coinDto';
import { ApiUrl } from '../constants/constants';

@Injectable()
export class SignalRService {
    public DepositBroadcase = new EventEmitter<CoinDto>();
    public connection?: ConnectionInfo = undefined;

    public CloseConnection() {
        this.connection?.Connection.stop();
    }

    private CreateConnection(): ConnectionInfo {
        let localConnection: HubConnection;

        localConnection = new HubConnectionBuilder()
            .withUrl(ApiUrl + '/Hubs/DepositHub')
            .configureLogging(LogLevel.Information)
            .build();

        localConnection.serverTimeoutInMilliseconds = 30 * 1000 * 10; //Server is 30 seconds, should be much longer.
        localConnection.keepAliveIntervalInMilliseconds = 30 * 1000;

        const conInfo: ConnectionInfo = {
            Connection: localConnection,
            ManuallyStopped: false,
            Name: 'DepositHub'
        }

        localConnection.onclose((error) => {
            if (!conInfo.ManuallyStopped) {
                this.retryConnect(localConnection);
            }
        });

        return conInfo;
    }

    public StartConnection() {
        let localConnection = this.CreateConnection();

        this.connection = localConnection;

        this.connection.Connection.on('Broadcast', (message: CoinDto) => {
            console.log('here', message);
            this.DepositBroadcase.emit(message);
        });

        this.connection.Connection.start().then((data: any) => {
            console.log('connected');
        });
    }

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
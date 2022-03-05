import { Component, NgZone, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CoinApi } from './api/api';
import { CoinDto } from './api/coinDto';
import { SignalRService } from './signalr/SignalRService';
import Enumerable from 'linq'

class Data {
    public name?: any;
    public series?: DataSeries[];
}

class DataSeries {
    public name?: any;
    public value?: any;
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [CoinApi, SignalRService]
})
export class AppComponent implements OnInit {
    title = 'CoinCounting-App';

    public data: Data[] = [];
    public total: number = 0;

    public updateChartSubject: Subject<any> = new Subject();

    constructor(
        private api: CoinApi,
        private signalR: SignalRService,
        private zone: NgZone) { }

    async ngOnInit(): Promise<void> {
        this.signalR.StartConnection();
        let coins = await this.api.ListDeposits();
        let category: Data[] = [{ name: "Coins", series: [] }];

        let series = coins.map((coin) => {
            let sum = coin.Pennies * .01 + coin.Nickels * .05 + coin.Dimes * 0.10 + coin.Quarters * 0.25;
            return {
                name: new Date(coin.DateDeposited),
                value: parseFloat(sum.toFixed(2))
            };
        });

        category[0].series = series;
        this.data = [...category];

        this.CalculateTotal();

        this.signalR.DepositBroadcast.subscribe((coinDto: CoinDto) => {
            console.log(typeof coinDto.Pennies);
            let sum = coinDto.Pennies * .01 + coinDto.Nickels * .05 + coinDto.Dimes * 0.10 + coinDto.Quarters * 0.25;
            this.data[0].series!.push({
                name: new Date(coinDto.DateDeposited),
                value: parseFloat(sum.toFixed(2))
            });
            this.zone.run(() => {
                this.data = [...this.data];
                this.CalculateTotal();
            });
        });
    }

    public CalculateTotal() {
        let series = this.data[0].series;

        this.total = Enumerable.from(series!).sum((x) => {
            return x.value;
        });
    }
}

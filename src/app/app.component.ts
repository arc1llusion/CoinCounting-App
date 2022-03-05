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

    public coins: CoinDto[] = [];
    public totalData: Data[] = [];
    public coinData: Data[] = [
        {
            name: "Pennies",
            series: []
        },
        {
            name: "Nickels",
            series: []
        },
        {
            name: "Dimes",
            series: []
        },
        {
            name: "Quarters",
            series: []
        },
    ]
    public total: number = 0;

    constructor(
        private api: CoinApi,
        private signalR: SignalRService,
        private zone: NgZone) { }

    async ngOnInit(): Promise<void> {
        this.signalR.StartConnection();
        this.coins = await this.api.ListDeposits();
        let category: Data[] = [{ name: "Coins", series: [] }];

        let series = this.coins.map((coin) => {
            let sum = coin.Pennies * .01 + coin.Nickels * .05 + coin.Dimes * 0.10 + coin.Quarters * 0.25;
            return {
                name: new Date(coin.DateDeposited),
                value: parseFloat(sum.toFixed(2))
            };
        });

        category[0].series = series;
        this.totalData = [...category];

        this.CalculateTotal();
        this.TransformIndividualCoinData(this.coins);

        this.signalR.DepositBroadcast.subscribe((coinDto: CoinDto) => {
            let sum = coinDto.Pennies * .01 + coinDto.Nickels * .05 + coinDto.Dimes * 0.10 + coinDto.Quarters * 0.25;
            this.totalData[0].series!.push({
                name: new Date(coinDto.DateDeposited),
                value: parseFloat(sum.toFixed(2))
            });

            this.zone.run(() => {
                this.totalData = [...this.totalData];
                this.CalculateTotal();

                this.coins.push(coinDto);
                this.TransformIndividualCoinData(this.coins);
            });
        });
    }

    public CalculateTotal() {
        let series = this.totalData[0].series;

        this.total = Enumerable.from(series!).sum((x) => {
            return x.value;
        });

        this.total = parseFloat(this.total.toFixed(2));
    }

    public TransformIndividualCoinData(coins: CoinDto[]) {
        let pennies = this.coinData[0];
        let nickels = this.coinData[1];
        let dimes = this.coinData[2];
        let quarters = this.coinData[3];

        pennies.series = coins.map((c) => <DataSeries>{
            name: c.DateDeposited,
            value: c.Pennies
        });

        nickels.series = coins.map((c) => <DataSeries>{
            name: c.DateDeposited,
            value: c.Nickels
        });

        dimes.series = coins.map((c) => <DataSeries>{
            name: c.DateDeposited,
            value: c.Dimes
        });

        quarters.series = coins.map((c) => <DataSeries>{
            name: c.DateDeposited,
            value: c.Quarters
        });

        this.coinData = [...this.coinData];
    }
}

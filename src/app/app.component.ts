import { Component, NgZone, OnInit } from '@angular/core';
import { CoinApi } from './api/api';
import { CoinDto } from './api/coinDto';
import { SignalRService } from './signalr/SignalRService';
import Enumerable from 'linq'

class MultiData {
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
    public totalData: MultiData[] = [];
    public lineChartCoinData: MultiData[] = [
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
        }
    ];

    public barChartCoinData: DataSeries[] = [
        {
            name: "Pennies",
            value: 0
        },
        {
            name: "Nickels",
            value: 0
        },
        {
            name: "Dimes",
            value: 0
        },
        {
            name: "Quarters",
            value: 0
        },
    ];

    public total: number = 0;

    constructor(
        private api: CoinApi,
        private signalR: SignalRService,
        private zone: NgZone) { }

    async ngOnInit(): Promise<void> {
        this.signalR.StartConnection();
        this.coins = await this.api.ListDeposits();
        let category: MultiData[] = [{ name: "Coins", series: [] }];

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
        this.TransformIndividualCoinDataForLineChart(this.coins);
        this.TransformBarChartCoinTypes(this.coins);

        this.signalR.DepositBroadcast.subscribe((coinDto: CoinDto) => {
            coinDto.DateDeposited = new Date(coinDto.DateDeposited);
            this.coins.push(coinDto);
            let sum = coinDto.Pennies * .01 + coinDto.Nickels * .05 + coinDto.Dimes * 0.10 + coinDto.Quarters * 0.25;

            this.totalData[0].series!.push({
                name: new Date(coinDto.DateDeposited),
                value: parseFloat(sum.toFixed(2))
            });

            this.zone.run(() => {
                this.totalData = [...this.totalData];
                this.CalculateTotal();

                this.TransformIndividualCoinDataForLineChart(this.coins);
                this.TransformBarChartCoinTypes(this.coins);
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

    public TransformIndividualCoinDataForLineChart(coins: CoinDto[]) {
        let pennies = this.lineChartCoinData[0];
        let nickels = this.lineChartCoinData[1];
        let dimes = this.lineChartCoinData[2];
        let quarters = this.lineChartCoinData[3];

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

        this.lineChartCoinData = [...this.lineChartCoinData];
    }

    public TransformBarChartCoinTypes(coins: CoinDto[]) {
        let pennies = this.barChartCoinData[0];
        let nickels = this.barChartCoinData[1];
        let dimes = this.barChartCoinData[2];
        let quarters = this.barChartCoinData[3];

        let enumerable = Enumerable.from(coins);

        pennies.value = enumerable.sum((x) => { return x.Pennies; });
        nickels.value = enumerable.sum((x) => { return x.Nickels; });
        dimes.value = enumerable.sum((x) => { return x.Dimes; });
        quarters.value = enumerable.sum((x) => { return x.Quarters; });

        this.barChartCoinData = [...this.barChartCoinData];
    }
}

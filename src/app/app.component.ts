import { Component, NgZone, OnInit } from '@angular/core';
import { CoinApi } from './api/api';
import { CoinDto } from './api/coinDto';
import { SignalRService } from './signalr/SignalRService';
import Enumerable from 'linq'

//Multi Data class for handling multiple series of data
class MultiData {
    public name?: any;
    public series?: DataSeries[];
}

//Basically a key value pair
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
    //A list of coin deposits
    public coins: CoinDto[] = [];
    //Coin deposits in the form the ngx-charts library wants to deal with
    public totalData: MultiData[] = [];

    //Data for the line chart
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

    //Data for the bar chart
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

    //The total currency amount deposited using this system
    public total: number = 0;

    constructor(
        private api: CoinApi,
        private signalR: SignalRService,
        private zone: NgZone) { }

    async ngOnInit(): Promise<void> {
        //Start the hub connection
        this.signalR.StartConnection();

        //Get the deposit list from the API
        this.coins = await this.api.ListDeposits();

        //Call functions that transform the data into the total, total line chart, individual coin line chart, and bar chart
        this.TransformCoinDataForTotalCoinsLineChart(this.coins);
        this.CalculateTotal();
        this.TransformIndividualCoinDataForLineChart(this.coins);
        this.TransformBarChartCoinTypes(this.coins);

        //An event handler for the deposit broadcast
        //When a deposit is made this method is called and recalculates all the data
        this.signalR.DepositBroadcast.subscribe((coinDto: CoinDto) => {
            coinDto.DateDeposited = new Date(coinDto.DateDeposited);
            this.coins.push(coinDto);
            let sum = coinDto.Pennies * .01 + coinDto.Nickels * .05 + coinDto.Dimes * 0.10 + coinDto.Quarters * 0.25;

            this.totalData[0].series!.push({
                name: new Date(coinDto.DateDeposited),
                value: parseFloat(sum.toFixed(2))
            });

            //A zone is an execution context, not unlike a thread, that persists across asynchronous contexts
            this.zone.run(() => {
                //Do the calculations for all the data
                this.totalData = [...this.totalData];
                this.TransformCoinDataForTotalCoinsLineChart(this.coins);
                this.CalculateTotal();
                this.TransformIndividualCoinDataForLineChart(this.coins);
                this.TransformBarChartCoinTypes(this.coins);
            });
        });
    }

    //Calculates the total currency of coins deposited
    public CalculateTotal() {
        let series = this.totalData[0].series;

        this.total = Enumerable.from(series!).sum((x) => {
            return x.value;
        });

        this.total = parseFloat(this.total.toFixed(2));
    }

    //Transforms the data into one that shows the total coins per deposit on the line chart
    public TransformCoinDataForTotalCoinsLineChart(coins: CoinDto[]) {
        let category: MultiData[] = [{ name: "Coins", series: [] }];

        let series = coins.map((coin) => {
            let sum = coin.Pennies * .01 + coin.Nickels * .05 + coin.Dimes * 0.10 + coin.Quarters * 0.25;
            return {
                name: new Date(coin.DateDeposited),
                value: parseFloat(sum.toFixed(2))
            };
        });

        category[0].series = series;
        this.totalData = [...category];
    }

    //Transforms the data into a line chart with 4 series lines, one for each coin type
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

    //Transforms the data into the total currency deposited for each coin type
    public TransformBarChartCoinTypes(coins: CoinDto[]) {
        let pennies = this.barChartCoinData[0];
        let nickels = this.barChartCoinData[1];
        let dimes = this.barChartCoinData[2];
        let quarters = this.barChartCoinData[3];

        let enumerable = Enumerable.from(coins);

        //This could be more efficient if I used a single for loop to sum everything
        pennies.value = enumerable.sum((x) => { return x.Pennies; });
        nickels.value = enumerable.sum((x) => { return x.Nickels; });
        dimes.value = enumerable.sum((x) => { return x.Dimes; });
        quarters.value = enumerable.sum((x) => { return x.Quarters; });

        this.barChartCoinData = [...this.barChartCoinData];
    }
}

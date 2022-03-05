import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { CoinApi } from './api/api';
import { CoinDto } from './api/coinDto';
import { SignalRService } from './signalr/SignalRService';

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

    public data: any = [
        {
            "name": "Germany",
            "series": [
                {
                    "name": "1990",
                    "value": 62000000
                },
                {
                    "name": "2010",
                    "value": 73000000
                },
                {
                    "name": "2011",
                    "value": 89400000
                }
            ]
        }
    ];

    public updateChartSubject: Subject<any> = new Subject();

    constructor(private api: CoinApi, private signalR: SignalRService) { }
    async ngOnInit(): Promise<void> {
        this.signalR.StartConnection();
        let coins = await this.api.ListDeposits();
        let category: Data[] = [{ name: "Coins", series: [] }];

        let series = coins.map((coin) => {
            let sum = coin.Pennies * .01 + coin.Nickels * .05 + coin.Dimes * 0.10 + coin.Quarters * 0.25;
            return {
                name: coin.DateDeposited,
                value: parseFloat(sum.toFixed(2))
            };
        });

        category[0].series = series;
        this.data = category;


        this.signalR.DepositBroadcast.subscribe((coinDto: CoinDto) => {
            console.log('here');
            let sum = coinDto.Pennies * .01 + coinDto.Nickels * .05 + coinDto.Dimes * 0.10 + coinDto.Quarters * 0.25;
            console.log(this.data);
            debugger;
            this.data[0].series.push({
                name: coinDto.DateDeposited,
                value: parseFloat(sum.toFixed(2))
            });
            this.data = [...this.data];
        });
    }

    private updateChart() {
        this.updateChartSubject.next(true);
    }
}

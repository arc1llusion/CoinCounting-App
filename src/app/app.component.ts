import { Component, OnInit } from '@angular/core';
import { CoinApi } from './api/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [CoinApi]
})
export class AppComponent implements OnInit {
  title = 'CoinCounting-App';
  constructor(private api: CoinApi) { }
  async ngOnInit(): Promise<void> {
    let coins = await this.api.ListDeposits();
    console.log(coins[0].Quarters);
  }
}

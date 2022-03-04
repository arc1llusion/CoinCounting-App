import { Component, OnInit } from '@angular/core';
import { CoinApi } from './api/api';
import { SignalRService } from './signalr/SignalRService';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [CoinApi, SignalRService]
})
export class AppComponent implements OnInit {
  title = 'CoinCounting-App';
  constructor(private api: CoinApi, private signalR: SignalRService) { }
  async ngOnInit(): Promise<void> {
    let coins = await this.api.ListDeposits();
    this.signalR.StartConnection();
  }
}

import { CoinDto } from './coinDto';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiUrl } from '../constants/constants';

@Injectable()
export class CoinApi {
    constructor(private http: HttpClient) { }

    // Gets a list of the deposits from the coin counting API
    public async ListDeposits(): Promise<CoinDto[]> {
        //Create a promise that resolves once the error either successfully completes or returns an error, and resolve/reject appropriately
        return new Promise((resolve, reject) => {
            this.http
                .get<CoinDto[]>(
                    ApiUrl + '/Coins/GetDeposits?userId=1',
                    { headers: { accept: 'text/plain', 'Access-Control-Allow-Origin': '*' } }
                ).subscribe({
                    next: (value: CoinDto[]) => {
                        var coins = value.map((c) => {
                            return <CoinDto>{
                                DateDeposited: new Date(c.DateDeposited),
                                UserId: parseInt(c.UserId.toString()),
                                UserName: c.UserName,
                                Pennies: parseInt(c.Pennies.toString()),
                                Nickels: parseInt(c.Nickels.toString()),
                                Dimes: parseInt(c.Dimes.toString()),
                                Quarters: parseInt(c.Quarters.toString())
                            }
                        });
                        resolve(coins);
                    }, error: (err) => {
                        reject(err);
                    }
                });
        });
    }
}

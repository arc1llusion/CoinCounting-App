import { CoinDto } from './coinDto';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiUrl } from '../constants/constants';

@Injectable()
export class CoinApi {
    constructor(private http: HttpClient) { }
    public async ListDeposits(): Promise<CoinDto[]> {
        return new Promise((resolve, reject) => {
            this.http
                .get<CoinDto[]>(
                    ApiUrl + '/Coins/GetDeposits?userId=1',
                    { headers: { accept: 'text/plain', 'Access-Control-Allow-Origin': '*' } }
                ).subscribe({
                    next: (value: CoinDto[]) => {
                        resolve(value);
                    }, error: (err) => {
                        reject(err);
                    }
                });
        });
    }
}

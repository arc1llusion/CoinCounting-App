import { CoinDto } from './coinDto';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CoinApi {
    constructor(private http: HttpClient) { }
    public async ListDeposits(): Promise<CoinDto[]> {
        this.http
            .get<CoinDto>(
                'https://coincounting-api20220301180827.azurewebsites.net/Coins/GetDeposits?userId=1',
                { headers: { accept: 'text/plain', 'Access-Control-Allow-Origin': '*' } }
            ).subscribe({
                next: (value: CoinDto) => {
                    console.log(value);
                }, error: (err) => {
                    console.log(err);
                }
            });

        return [];
    }
}

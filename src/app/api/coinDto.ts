//Structure for holding a deposit. i.e. the number of pennies, dimes, etc.
export class CoinDto {
    public Pennies: number = 0;
    public Nickels: number = 0;
    public Dimes: number = 0;
    public Quarters: number = 0;
    public Id: number = 0;
    public UserId: number = 0;
    public UserName: string = '';
    public DateDeposited: Date = new Date();
}
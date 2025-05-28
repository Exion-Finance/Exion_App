import { BalanceData } from "@/types/datatypes";

export const TotalBalances = (data: BalanceData): number => {
    const balances = data.balance;
    let total = 0;

    for (const key in balances) {
        if (Object.prototype.hasOwnProperty.call(balances, key)) {
            const value = parseFloat(balances[key]);
            if (!isNaN(value)) {
                total += value;
            }
        }
    }

    return total;
};
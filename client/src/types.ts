export type TxnType = 'expense' | 'income'
export interface User { id: string; name: string; email: string }
export interface Transaction { id: string; title: string; amount: number; type: TxnType; category: string; date: string; note: string }
export interface Subscription { id: string; name: string; amount: number; frequency: 'weekly'|'monthly'|'quarterly'|'yearly'; category: string; next_billing_date: string; active: boolean }
export interface Summary { currency: string; month: string; income: number; expenses: number; balance: number; subscription_monthly_cost: number; category_breakdown: {category:string;amount:number}[]; monthly_trend: {month:string;income:number;expense:number}[]; transaction_count: number; prev_expenses: number; savings_rate: number|null; upcoming: {id:string;name:string;amount:number;frequency:string;next_billing_date:string}[] }

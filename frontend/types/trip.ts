export interface Trip {
    id: number;
    destination: string;
    days: number;
    budget: number;
    category: string;
    daily_budget?: number;
    ai_recommendation?: string;
    created_at?: string;
}
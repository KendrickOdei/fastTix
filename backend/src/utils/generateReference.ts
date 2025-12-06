
export function generatePurchaseCode():
string {
    const suffix = 
    Math.random().toString(36).substring(2,
        8).toUpperCase();
        return `ORD-${Date.now()}-${suffix}`;
}
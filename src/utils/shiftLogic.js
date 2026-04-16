export function calculateShiftMetrics(p, q) {
    const rootP = Math.sqrt(p);
    const ringSteps = Math.min(q, p - q);
    const rowShift = q % rootP;
    const colShift = Math.floor(q / rootP);
    const meshSteps = rowShift + colShift;

    return { rootP, ringSteps, meshSteps, rowShift, colShift };
}

export function generateGridData(p) {
    return Array.from({ length: p }, (_, i) => ({
        id: i,
        currentData: i,
    }));
}
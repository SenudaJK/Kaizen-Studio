/**
 * Sigma level: how reliable a process is, on the scale quality engineers use.
 * 3σ ≈ 93% success, 4σ ≈ 99.4%, 6σ ≈ 99.99966%.
 * We use the standard convention of adding a 1.5σ long-term shift.
 */

const SIGMA_SHIFT = 1.5;
const MAX_SIGMA = 6;
/** Below this many chances, one slip swings the score wildly, so we show nothing. */
export const MIN_OPPORTUNITIES_FOR_SIGMA = 5;

// Peter Acklam's rational approximation of the inverse normal CDF (relative error < 1.2e-9).
const A = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.357751867269, -30.66479806614716, 2.506628277459239];
const B = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572];
const C = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
const D = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
const P_LOW = 0.02425;

export function inverseNormalCdf(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p < P_LOW) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((C[0] * q + C[1]) * q + C[2]) * q + C[3]) * q + C[4]) * q + C[5]) /
      ((((D[0] * q + D[1]) * q + D[2]) * q + D[3]) * q + 1)
    );
  }
  if (p > 1 - P_LOW) return -inverseNormalCdf(1 - p);
  const q = p - 0.5;
  const r = q * q;
  return (
    ((((((A[0] * r + A[1]) * r + A[2]) * r + A[3]) * r + A[4]) * r + A[5]) * q) /
    (((((B[0] * r + B[1]) * r + B[2]) * r + B[3]) * r + B[4]) * r + 1)
  );
}

/** Sigma level for a 0–1 success ratio, clamped to 0–6. */
export function sigmaFromYield(ratio: number): number {
  const sigma = inverseNormalCdf(ratio) + SIGMA_SHIFT;
  return Math.min(MAX_SIGMA, Math.max(0, sigma));
}

/** Success ratio needed to reach a given sigma level (the inverse of the above). */
export function yieldForSigma(sigma: number): number {
  // Normal CDF via the error function approximation (Abramowitz & Stegun 7.1.26).
  const z = (sigma - SIGMA_SHIFT) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-z * z);
  return 0.5 * (1 + Math.sign(z) * erf);
}

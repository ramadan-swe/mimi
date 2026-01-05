/**
 * Pre-baked Intent Logic
 *
 * Utility functions for generating URL parameters for pre-defined search intents
 * from the Bento Grid AI Discovery cards.
 */
/**
 * Sahel Summer Intent
 * High-rated AC and trunk space + SUV category
 * Perfect for beach trips with family/friends
 */
export function getSahelSummerParams() {
    return {
        category: 'SUV',
        features: 'Air Conditioning,Large Trunk',
        waseet_score_min: '85',
    };
}
/**
 * Cairo Commuter Intent
 * Economy + Petrol-efficient + Compact
 * Ideal for daily city driving
 */
export function getCairoCommuterParams() {
    return {
        category: 'Economy,Compact',
        fuel_type: 'Petrol',
        governorate: 'Cairo',
    };
}
/**
 * Elite Selection Intent
 * Filter for Waseet Score > 95
 * Top-tier hosts only
 */
export function getEliteSelectionParams() {
    return {
        waseet_score_min: '95',
    };
}
/**
 * Build Explore URL with query parameters
 */
export function buildExploreUrl(params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            searchParams.set(key, value);
        }
    });
    const queryString = searchParams.toString();
    return queryString ? `/explore?${queryString}` : '/explore';
}
/**
 * Pre-baked intent definitions for Bento Grid
 */
export const PREBAKED_INTENTS = {
    sahelSummer: {
        id: 'sahel-summer',
        title: 'Sahel Summer',
        description: 'Beach-ready SUVs with AC & trunk space',
        icon: '🏖️',
        gradient: 'from-blue-400 to-cyan-500',
        getParams: getSahelSummerParams,
    },
    cairoCommuter: {
        id: 'cairo-commuter',
        title: 'Cairo Commuter',
        description: 'Fuel-efficient economy cars for city driving',
        icon: '🚗',
        gradient: 'from-green-400 to-emerald-500',
        getParams: getCairoCommuterParams,
    },
    eliteSelection: {
        id: 'elite-selection',
        title: 'Elite Selection',
        description: 'Top-rated hosts (Waseet Score 95+)',
        icon: '👑',
        gradient: 'from-amber-400 to-yellow-500',
        getParams: getEliteSelectionParams,
    },
};

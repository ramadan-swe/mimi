/**
 * Pre-baked Intent Logic
 *
 * Utility functions for generating URL parameters for pre-defined search intents
 * from the Bento Grid AI Discovery cards.
 */
/**
 * Sahel Summer Intent
 * SUVs and premium cars in Alexandria/Red Sea areas
 * Perfect for beach trips with family/friends
 */
export function getSahelSummerParams() {
    return {
        governorate: 'Alexandria',
        category: 'PREMIUM,TOP',
    };
}
/**
 * Cairo Commuter Intent
 * Economy + Base/Mid Line cars in Cairo
 * Ideal for daily city driving
 */
export function getCairoCommuterParams() {
    return {
        governorate: 'Cairo',
        category: 'BASE,MID',
    };
}
/**
 * Elite Selection Intent
 * Filter for Waseet Score >= 95
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
        description: 'Premium cars in Alexandria for beach trips',
        icon: '🏖️',
        gradient: 'from-blue-400 to-cyan-500',
        getParams: getSahelSummerParams,
    },
    cairoCommuter: {
        id: 'cairo-commuter',
        title: 'Cairo Commuter',
        description: 'Affordable cars in Cairo for daily driving',
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

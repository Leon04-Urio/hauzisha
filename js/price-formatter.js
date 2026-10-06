/**
 * Format price with M (million) or B (billion) notation
 * @param {number|string} price - The price to format
 * @returns {string} Formatted price string
 */
function formatPrice(price) {
    const numPrice = parseFloat(price);
    
    if (isNaN(numPrice)) return '0';
    
    // Billion (1,000,000,000+)
    if (numPrice >= 1000000000) {
        const billions = numPrice / 1000000000;
        // Show 1 decimal place if not a whole number
        return billions % 1 === 0 
            ? `${billions.toFixed(0)}B` 
            : `${billions.toFixed(1)}B`;
    }
    
    // Million (1,000,000+)
    if (numPrice >= 1000000) {
        const millions = numPrice / 1000000;
        // Show 1 decimal place if not a whole number
        return millions % 1 === 0 
            ? `${millions.toFixed(0)}M` 
            : `${millions.toFixed(1)}M`;
    }
    
    // Less than a million - use comma formatting
    return numPrice.toLocaleString();
}

// Make it globally available
window.formatPrice = formatPrice;

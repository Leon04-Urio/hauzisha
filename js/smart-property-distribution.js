// Smart Property Distribution System
// Ensures fair visibility for all properties while maintaining quality

class SmartPropertyDistribution {
    constructor() {
        this.sessionSeed = this.generateSessionSeed();
        this.viewedProperties = new Set();
        this.lastShuffleTime = Date.now();
    }

    // Generate a consistent seed for this browser session
    generateSessionSeed() {
        const stored = sessionStorage.getItem('loft_property_seed');
        if (stored) {
            return parseInt(stored);
        }
        
        const seed = Math.floor(Math.random() * 1000000);
        sessionStorage.setItem('loft_property_seed', seed.toString());
        return seed;
    }

    // Seeded random number generator for consistent randomization within session
    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    // Smart shuffle that considers multiple factors
    smartShuffle(properties) {
        if (!Array.isArray(properties) || properties.length === 0) {
            return properties;
        }

        // Create a copy to avoid mutating original
        const shuffled = [...properties];
        
        // Score each property for visibility
        const scoredProperties = shuffled.map((property, index) => {
            let score = 0;
            
            // Base randomization (40% of score)
            score += this.seededRandom(this.sessionSeed + index + Date.now()) * 40;
            
            // Boost newer properties (30% of score)
            if (property.created_at) {
                const daysSinceCreated = (Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceCreated <= 7) {
                    score += 30; // New properties get full boost
                } else if (daysSinceCreated <= 30) {
                    score += 20; // Recent properties get partial boost
                } else if (daysSinceCreated <= 90) {
                    score += 10; // Moderately old properties get small boost
                }
            }
            
            // Boost verified properties (15% of score)
            if (property.verification_status === 'verified') {
                score += 15;
            }
            
            // Boost properties with good ratings (10% of score)
            if (property.rating && parseFloat(property.rating) >= 4.0) {
                score += 10;
            }
            
            // Reduce score for recently viewed properties (prevent repetition)
            if (this.viewedProperties.has(property.id)) {
                score -= 20;
            }
            
            // Small boost for properties with images (5% of score)
            if (property.hero_image || (property.gallery && property.gallery.length > 0)) {
                score += 5;
            }

            return {
                ...property,
                _distributionScore: score
            };
        });

        // Sort by score (highest first) but add some randomness to prevent rigid ordering
        return scoredProperties
            .sort((a, b) => {
                const scoreDiff = b._distributionScore - a._distributionScore;
                // Add small random factor to prevent identical scores from always having same order
                const randomFactor = (this.seededRandom(a.id + b.id + this.sessionSeed) - 0.5) * 5;
                return scoreDiff + randomFactor;
            })
            .map(({ _distributionScore, ...property }) => property); // Remove score from final result
    }

    // Smart featured selection - rotates different properties
    selectFeaturedProperties(properties, count = 10) {
        if (!Array.isArray(properties) || properties.length === 0) {
            return [];
        }

        // Get a different set of featured properties based on time and session
        const timeBasedSeed = Math.floor(Date.now() / (1000 * 60 * 60 * 6)); // Changes every 6 hours
        const featuredSeed = this.sessionSeed + timeBasedSeed;

        // Score properties for featured selection
        const scoredForFeatured = properties.map((property, index) => {
            let score = 0;

            // Base randomization with time rotation
            score += this.seededRandom(featuredSeed + index) * 30;

            // Strongly prefer verified properties for featured
            if (property.verification_status === 'verified') {
                score += 40;
            }

            // Prefer properties with good ratings
            if (property.rating && parseFloat(property.rating) >= 4.5) {
                score += 25;
            } else if (property.rating && parseFloat(property.rating) >= 4.0) {
                score += 15;
            }

            // Prefer properties with good images
            if (property.hero_image) {
                score += 20;
            } else if (property.gallery && property.gallery.length > 0) {
                score += 10;
            }

            // Prefer higher-priced properties for featured (premium feel)
            if (property.price) {
                const price = parseFloat(property.price);
                if (price >= 5000000) { // 5M+
                    score += 15;
                } else if (price >= 2000000) { // 2M+
                    score += 10;
                } else if (price >= 1000000) { // 1M+
                    score += 5;
                }
            }

            // Slight preference for newer properties
            if (property.created_at) {
                const daysSinceCreated = (Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceCreated <= 30) {
                    score += 10;
                }
            }

            return {
                ...property,
                _featuredScore: score
            };
        });

        return scoredForFeatured
            .sort((a, b) => b._featuredScore - a._featuredScore)
            .slice(0, count)
            .map(({ _featuredScore, ...property }) => property);
    }

    // Track viewed properties to reduce repetition
    markAsViewed(propertyId) {
        this.viewedProperties.add(propertyId);
        
        // Clear viewed properties periodically to allow re-showing
        if (this.viewedProperties.size > 50) {
            const viewedArray = Array.from(this.viewedProperties);
            this.viewedProperties = new Set(viewedArray.slice(-25)); // Keep only last 25
        }
    }

    // Refresh randomization (call this periodically or on user action)
    refreshDistribution() {
        this.sessionSeed = Math.floor(Math.random() * 1000000);
        sessionStorage.setItem('loft_property_seed', this.sessionSeed.toString());
        this.viewedProperties.clear();
        this.lastShuffleTime = Date.now();
    }

    // Check if we should refresh the distribution (every 30 minutes)
    shouldRefreshDistribution() {
        return (Date.now() - this.lastShuffleTime) > (30 * 60 * 1000);
    }
}

// Create global instance
window.smartDistribution = new SmartPropertyDistribution();

// Helper functions for easy integration
window.smartShuffleProperties = function(properties) {
    if (window.smartDistribution.shouldRefreshDistribution()) {
        console.log('🔄 Refreshing property distribution for better variety');
        window.smartDistribution.refreshDistribution();
    }
    
    const shuffled = window.smartDistribution.smartShuffle(properties);
    console.log('🎲 Applied smart property distribution');
    return shuffled;
};

window.selectSmartFeatured = function(properties, count = 10) {
    const featured = window.smartDistribution.selectFeaturedProperties(properties, count);
    console.log('⭐ Selected smart featured properties:', featured.length);
    return featured;
};

window.markPropertyViewed = function(propertyId) {
    window.smartDistribution.markAsViewed(propertyId);
};

// Auto-refresh distribution when user returns to tab (prevents stale ordering)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.smartDistribution.shouldRefreshDistribution()) {
        console.log('👁️ User returned - refreshing property distribution');
        window.smartDistribution.refreshDistribution();
    }
});

console.log('🎯 Smart Property Distribution System loaded');
class Team {
    constructor(id, name, seed, region, americanOdds) {
        this.id = id;
        this.name = name;
        this.seed = seed;
        this.region = region;
        this.americanOdds = americanOdds;
        this.purchasePrice = 0;
        this.isMyTeam = false;
        this.isOpponentTeam = false;
        this.odds = {
            r32: 0, s16: 0, e8: 0, f4: 0, f2: 0, champ: 0
        };
        this.winPercentage = 0;
        this.valuePercentage = 0;
    }

    calculateImpliedProbability(round) {
        return this.americanOddsToImpliedProbability(this.americanOdds[round]);
    }

    americanOddsToImpliedProbability(americanOdds) {
        if (americanOdds > 0) {
            return 100 / (americanOdds + 100);
        } else {
            return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100);
        }
    }

    impliedProbabilityToAmericanOdds(probability) {
        if (probability >= 0.5) {
            return Math.round(-100 * probability / (1 - probability));
        } else {
            return Math.round(100 * (1 - probability) / probability);
        }
    }

    calculateFairValue(potSize) {
        let totalProbability = 0;
        let totalValue = 0;
        
        // Calculate total probability and value across all rounds
        Object.keys(this.americanOdds).forEach(round => {
            const probability = this.calculateImpliedProbability(round);
            totalProbability += probability;
            totalValue += probability * potSize;
        });
        
        // Normalize probabilities
        totalProbability = totalProbability / Object.keys(this.americanOdds).length;
        
        return {
            probability: totalProbability,
            value: totalValue
        };
    }

    calculateRoundProfits(potSize, payoutRules) {
        const profits = {};
        let totalProbability = 0;
        
        Object.keys(this.americanOdds).forEach(round => {
            const probability = this.calculateImpliedProbability(round);
            totalProbability += probability;
            
            const payout = payoutRules[round] || 0;
            const expectedValue = probability * potSize * (payout / 100);
            profits[round] = expectedValue - this.purchasePrice;
        });
        
        // Calculate total profit
        profits.total = Object.values(profits).reduce((sum, profit) => sum + profit, 0);
        
        return profits;
    }

    calculateSuggestedBid(potSize, payoutRules) {
        const fairValue = this.calculateFairValue(potSize);
        const profits = this.calculateRoundProfits(potSize, payoutRules);
        
        // Calculate suggested bid based on fair value and potential profits
        let suggestedBid = fairValue.value * 0.7; // Start at 70% of fair value
        
        // Adjust based on profit potential
        if (profits.total > 0) {
            suggestedBid *= 1.2; // Increase bid if profitable
        }
        
        return Math.round(suggestedBid);
    }
}

export default Team; 
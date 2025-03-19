// Test script to check The Odds API functionality
const API_KEY = '99c10512eaed779f72890edd866715c0';
const REGIONS = ['us', 'eu', 'uk', 'au'];
const ODDS_FORMAT = 'american';

// Function to convert American odds to probability
function americanOddsToProbability(americanOdds) {
    if (americanOdds > 0) {
        return 100 / (americanOdds + 100);
    } else {
        return -americanOdds / (-americanOdds + 100);
    }
}

// Function to convert probability to American odds
function probabilityToAmericanOdds(probability) {
    if (probability >= 0.5) {
        return Math.round(-100 * probability / (1 - probability));
    } else {
        return Math.round(100 * (1 - probability) / probability);
    }
}

// Function to devig odds using the power method
function devigOdds(americanOdds) {
    // Convert to probabilities
    const probabilities = americanOdds.map(americanOddsToProbability);
    
    // Calculate sum of probabilities
    const probabilitySum = probabilities.reduce((a, b) => a + b, 0);
    
    // Normalize probabilities to remove the vig
    const devigged = probabilities.map(prob => prob / probabilitySum);
    
    // Convert back to American odds
    return devigged.map(probabilityToAmericanOdds);
}

async function getPinnacleNCAABOdds() {
    try {
        console.log('Fetching NCAAB odds from Pinnacle...');
        const response = await fetch(
            `https://api.the-odds-api.com/v4/sports/basketball_ncaab/odds/?apiKey=${API_KEY}&regions=${REGIONS.join(',')}&oddsFormat=${ODDS_FORMAT}`
        );

        if (!response.ok) {
            console.log('Failed to fetch NCAAB odds');
            const errorText = await response.text();
            console.log('Error details:', errorText);
            return;
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
            console.log(`\nFound ${data.length} NCAAB events`);
            
            // Store devigged odds for each team
            const teamOdds = new Map();
            
            data.forEach(event => {
                const pinnacle = event.bookmakers.find(b => b.key === 'pinnacle');
                if (pinnacle) {
                    const h2hMarket = pinnacle.markets.find(m => m.key === 'h2h');
                    if (h2hMarket && h2hMarket.outcomes.length === 2) {
                        const homeTeam = event.home_team;
                        const awayTeam = event.away_team;
                        const homeOdds = h2hMarket.outcomes.find(o => o.name === homeTeam)?.price;
                        const awayOdds = h2hMarket.outcomes.find(o => o.name === awayTeam)?.price;
                        
                        if (typeof homeOdds === 'number' && typeof awayOdds === 'number') {
                            // Devig the odds
                            const deviggedOdds = devigOdds([homeOdds, awayOdds]);
                            
                            // Store the devigged odds
                            teamOdds.set(homeTeam, deviggedOdds[0]);
                            teamOdds.set(awayTeam, deviggedOdds[1]);
                            
                            console.log(`\n${homeTeam} vs ${awayTeam}`);
                            console.log('Original odds:', { home: homeOdds, away: awayOdds });
                            console.log('Devigged odds:', { home: deviggedOdds[0], away: deviggedOdds[1] });
                        }
                    }
                }
            });

            // Now we can use teamOdds to update the default teams
            console.log('\nTeam odds ready for updating default teams:');
            teamOdds.forEach((odds, team) => {
                console.log(`${team}: ${odds}`);
            });

            return teamOdds;
        } else {
            console.log('No NCAAB events found');
            return new Map();
        }

    } catch (error) {
        console.error('Error:', error.message);
        return new Map();
    }
}

// Run the function
getPinnacleNCAABOdds(); 
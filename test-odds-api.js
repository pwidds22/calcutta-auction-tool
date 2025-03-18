// Test script to check The Odds API functionality
const API_KEY = 'c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0';
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

function normalizeOdds(odds) {
    const probabilities = odds.map(odd => americanOddsToProbability(odd));
    const totalProb = probabilities.reduce((a, b) => a + b, 0);
    const normalizedProbs = probabilities.map(prob => prob / totalProb);
    return normalizedProbs.map(prob => probabilityToAmericanOdds(prob));
}

async function testOddsAPI() {
    try {
        // First get all available sports
        console.log('Fetching available sports...');
        const sportsResponse = await fetch(
            `https://api.the-odds-api.com/v4/sports/?apiKey=${API_KEY}`
        );

        if (!sportsResponse.ok) {
            console.log('Failed to fetch sports');
            return;
        }

        const sports = await sportsResponse.json();
        const ncaabSports = sports.filter(sport => sport.key.includes('basketball_ncaab'));
        
        console.log('\nFound NCAAB sports:', ncaabSports.map(s => s.key));

        // For each NCAAB sport, check all available markets
        for (const sport of ncaabSports) {
            console.log(`\nChecking markets for ${sport.key}...`);
            
            const response = await fetch(
                `https://api.the-odds-api.com/v4/sports/${sport.key}/odds/?apiKey=${API_KEY}&regions=${REGIONS.join(',')}&oddsFormat=${ODDS_FORMAT}`
            );

            if (!response.ok) {
                console.log(`Failed to fetch odds for ${sport.key}`);
                continue;
            }

            const data = await response.json();
            
            if (data && data.length > 0) {
                console.log(`Found ${data.length} events`);
                
                // Track unique market types and bookmakers
                const uniqueMarkets = new Set();
                const uniqueBookmakers = new Set();
                
                data.forEach(event => {
                    event.bookmakers.forEach(bookmaker => {
                        uniqueBookmakers.add(bookmaker.key);
                        if (bookmaker.markets) {
                            bookmaker.markets.forEach(market => {
                                uniqueMarkets.add(market.key);
                            });
                        }
                    });
                });
                
                console.log('\nAvailable market types:', Array.from(uniqueMarkets));
                console.log('Available bookmakers:', Array.from(uniqueBookmakers));
                
                // Print details of any non-h2h markets
                data.forEach(event => {
                    event.bookmakers.forEach(bookmaker => {
                        if (bookmaker.markets) {
                            bookmaker.markets.forEach(market => {
                                if (market.key !== 'h2h') {
                                    console.log(`\nFound ${market.key} market from ${bookmaker.key}:`);
                                    console.log('Event:', event.home_team, 'vs', event.away_team);
                                    market.outcomes.forEach(outcome => {
                                        console.log(`${outcome.name}: ${outcome.price}`);
                                    });
                                }
                            });
                        }
                    });
                });
            } else {
                console.log('No events found');
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the test
testOddsAPI(); 
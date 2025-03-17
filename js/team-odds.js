// Team Odds JavaScript

// Check authentication first
if (!isLoggedIn()) {
    window.location.href = 'login.html';
}

// Global variables
let teams = [];
const regions = ['East', 'West', 'South', 'Midwest'];  // Make this constant since it never changes
let filteredTeams = [];
let currentRegionFilter = 'all';
let currentSearchTerm = '';
let currentSortOption = 'seed';
let currentSortDirection = 'asc';

// Base teams data - this is constant and should not change
const BASE_TEAMS = getDefaultTeams();

// Initialize on document ready
document.addEventListener('DOMContentLoaded', async function() {
    // Reset session-specific variables
    teams = [];
    filteredTeams = [];
    currentRegionFilter = 'all';
    currentSearchTerm = '';
    currentSortOption = 'seed';
    currentSortDirection = 'asc';
    
    console.log('Team Odds page initialized');
    
    // First try to load saved user data
    await loadTeamsData();
    
    // If no teams were loaded from user data, use the default teams
    if (teams.length === 0) {
        console.log('No user-specific data found, loading default teams');
        teams = getDefaultTeams();
        teams.forEach(team => {
            team.purchasePrice = 0;
            team.isMyTeam = false;
        });
    }
    
    // Calculate implied probabilities
    calculateImpliedProbabilities();
    
    // Set up event listeners
    initializeEventListeners();
    
    // Update the UI
    updateUI();
    
    console.log(`Loaded ${teams.length} teams`);
});

// Load teams data
async function loadTeamsData() {
    console.log('Loading teams data...');
    
    try {
        // First try to load purchase prices and team status from auction tool
        const calcuttaTeams = localStorage.getItem('calcuttaTeams');
        let purchasePrices = {};
        let teamStatus = {};
        
        if (calcuttaTeams) {
            const auctionData = JSON.parse(calcuttaTeams);
            auctionData.forEach(team => {
                purchasePrices[team.id] = team.purchasePrice || 0;
                teamStatus[team.id] = team.isMyTeam || false;
            });
            console.log('Loaded purchase prices and team status from auction tool');
        }
        
        // Try to load from server first if logged in
        if (isLoggedIn()) {
            const userData = await loadUserData();
            if (userData && userData.teams && userData.teams.length > 0) {
                teams = userData.teams;
                // Apply purchase prices and team status
                teams.forEach(team => {
                    team.purchasePrice = purchasePrices[team.id] || 0;
                    team.isMyTeam = teamStatus[team.id] || false;
                });
                console.log('Teams loaded from server');
                return;
            }
        }
        
        // Try to load from localStorage
        const teamsData = localStorage.getItem('teamOddsData');
        if (teamsData) {
            teams = JSON.parse(teamsData);
            // Apply purchase prices and team status
            teams.forEach(team => {
                team.purchasePrice = purchasePrices[team.id] || 0;
                team.isMyTeam = teamStatus[team.id] || false;
            });
            console.log('Teams loaded from localStorage');
            return;
        }
        
        // If no saved data found, load default teams
        console.log('No saved team data found, loading defaults');
        teams = getDefaultTeams();
        // Apply purchase prices and team status to default teams
        teams.forEach(team => {
            team.purchasePrice = purchasePrices[team.id] || 0;
            team.isMyTeam = teamStatus[team.id] || false;
        });
        
    } catch (error) {
        console.error('Error loading teams:', error);
        teams = getDefaultTeams();
    }
    
    // Calculate implied probabilities for initial load
    calculateImpliedProbabilities();
}

// Load teams data from localStorage
function loadTeamsFromStorage() {
    try {
        const teamsData = localStorage.getItem('calcuttaTeams');
        return teamsData ? JSON.parse(teamsData) : null;
    } catch (error) {
        console.error('Error loading teams from localStorage:', error);
        return null;
    }
}

// Get default teams with odds data
function getDefaultTeams() {
    return [
        // East Region
        { id: 17, name: "Duke", seed: 1, region: "East", americanOdds: { r32: -5000, s16: -740, e8: -288, f4: -125, f2: +172, champ: +310 } },
        { id: 18, name: "American/Mount St. Mary's", seed: 16, region: "East", americanOdds: { r32: +2135, s16: +8000, e8: +15000, f4: +25000, f2: +50000, champ: +100000 } },
        { id: 19, name: "Mississippi State", seed: 8, region: "East", americanOdds: { r32: +100, s16: +1200, e8: +2500, f4: +3800, f2: +8000, champ: +23000 } },
        { id: 20, name: "Baylor", seed: 9, region: "East", americanOdds: { r32: -117, s16: +1200, e8: +2700, f4: +3600, f2: +9000, champ: +23000 } },
        { id: 21, name: "Oregon", seed: 5, region: "East", americanOdds: { r32: +236, s16: +350, e8: +2600, f4: +3000, f2: +14000, champ: +19000 } },
        { id: 22, name: "Liberty", seed: 12, region: "East", americanOdds: { r32: -286, s16: +1200, e8: +12000, f4: +25000, f2: +50000, champ: +100000 } },
        { id: 23, name: "Arizona", seed: 4, region: "East", americanOdds: { r32: +692, s16: +205, e8: +510, f4: +800, f2: +3700, champ: +3700 } },
        { id: 24, name: "Akron", seed: 13, region: "East", americanOdds: { r32: -1039, s16: +2500, e8: +8000, f4: +25000, f2: +50000, champ: +100000 } },
        { id: 25, name: "BYU", seed: 6, region: "East", americanOdds: { r32: +120, s16: +335, e8: +1050, f4: +2000, f2: +14000, champ: +10000 } },
        { id: 26, name: "VCU", seed: 11, region: "East", americanOdds: { r32: -141, s16: +335, e8: +975, f4: +3400, f2: +11000, champ: +21000 } },
        { id: 27, name: "Wisconsin", seed: 3, region: "East", americanOdds: { r32: +1130, s16: -115, e8: +350, f4: +1000, f2: +3100, champ: +6000 } },
        { id: 28, name: "Montana", seed: 14, region: "East", americanOdds: { r32: -2233, s16: +4000, e8: +8000, f4: +25000, f2: +50000, champ: +100000 } },
        { id: 29, name: "Saint Mary's", seed: 7, region: "East", americanOdds: { r32: +156, s16: +350, e8: +875, f4: +2300, f2: +9900, champ: +13000 } },
        { id: 30, name: "Vanderbilt", seed: 10, region: "East", americanOdds: { r32: -184, s16: +1900, e8: +2900, f4: +8000, f2: +40000, champ: +100000 } },
        { id: 31, name: "Alabama", seed: 2, region: "East", americanOdds: { r32: +464, s16: -260, e8: +110, f4: +410, f2: +860, champ: +1900 } },
        { id: 32, name: "Robert Morris", seed: 15, region: "East", americanOdds: { r32: -621, s16: +5000, e8: +10000, f4: +25000, f2: +50000, champ: +100000 } },

        // Midwest Region
        { id: 33, name: "Houston", seed: 1, region: "Midwest", americanOdds: { r32: +3687, s16: -260, e8: -133, f4: +140, f2: +317, champ: +700 } },
        { id: 34, name: "SIU Edwardsville", seed: 16, region: "Midwest", americanOdds: { r32: -14608, s16: +8000, e8: +15000, f4: +25000, f2: +50000, champ: +100000 } },
        { id: 35, name: "Gonzaga", seed: 8, region: "Midwest", americanOdds: { r32: +221, s16: +282, e8: +450, f4: +850, f2: +2300, champ: +4300 } },
        { id: 36, name: "Georgia", seed: 9, region: "Midwest", americanOdds: { r32: -266, s16: +1200, e8: +2700, f4: +9500, f2: +40000, champ: +100000 } },
        { id: 37, name: "Clemson", seed: 5, region: "Midwest", americanOdds: { r32: +272, s16: +147, e8: +790, f4: +1500, f2: +3900, champ: +10000 } },
        { id: 38, name: "McNeese", seed: 12, region: "Midwest", americanOdds: { r32: -334, s16: +2000, e8: +4000, f4: +10000, f2: +40000, champ: +100000 } },
        { id: 39, name: "Purdue", seed: 4, region: "Midwest", americanOdds: { r32: +310, s16: +132, e8: +780, f4: +1200, f2: +6500, champ: +8500 } },
        { id: 40, name: "High Point", seed: 13, region: "Midwest", americanOdds: { r32: -387, s16: +1350, e8: +16000, f4: +25000, f2: +50000, champ: +100000 } },
        { id: 41, name: "Illinois", seed: 6, region: "Midwest", americanOdds: { r32: -135, s16: +165, e8: +700, f4: +900, f2: +19000, champ: +5500 } },
        { id: 42, name: "Texas/Xavier", seed: 11, region: "Midwest", americanOdds: { r32: +116, s16: +1400, e8: +2000, f4: +10000, f2: +40000, champ: +100000 } },
        { id: 43, name: "Kentucky", seed: 3, region: "Midwest", americanOdds: { r32: +461, s16: -168, e8: +90, f4: +900, f2: +2000, champ: +5500 } },
        { id: 44, name: "Troy", seed: 14, region: "Midwest", americanOdds: { r32: -615, s16: +4000, e8: +8000, f4: +25000, f2: +50000, champ: +100000 } },
        { id: 45, name: "UCLA", seed: 7, region: "Midwest", americanOdds: { r32: +168, s16: +350, e8: +710, f4: +2100, f2: +11000, champ: +14000 } },
        { id: 46, name: "Utah State", seed: 10, region: "Midwest", americanOdds: { r32: -199, s16: +1200, e8: +2900, f4: +11000, f2: +40000, champ: +100000 } },
        { id: 47, name: "Tennessee", seed: 2, region: "Midwest", americanOdds: { r32: +1478, s16: -251, e8: -111, f4: +370, f2: +880, champ: +2100 } },
        { id: 48, name: "Wofford", seed: 15, region: "Midwest", americanOdds: { r32: -3916, s16: +5000, e8: +10000, f4: +25000, f2: +50000, champ: +100000 } },

        // South Region
        { id: 1, name: "Auburn", seed: 1, region: "South", americanOdds: { r32: -5000, s16: -335, e8: -170, f4: +100, f2: +257, champ: +500 } },
        { id: 2, name: "Alabama State/St. Francis (PA)", seed: 16, region: "South", americanOdds: { r32: +3798, s16: +8000, e8: +15000, f4: +25000, f2: +50000, champ: +100000 } },
        { id: 3, name: "Louisville", seed: 8, region: "South", americanOdds: { r32: +121, s16: +1900, e8: +1150, f4: +1900, f2: +7500, champ: +11000 } },
        { id: 4, name: "Creighton", seed: 9, region: "South", americanOdds: { r32: -142, s16: +1100, e8: +2100, f4: +3100, f2: +10000, champ: +23000 } },
        { id: 5, name: "Michigan", seed: 5, region: "South", americanOdds: { r32: +128, s16: +450, e8: +1450, f4: +2300, f2: +12000, champ: +19000 } },
        { id: 6, name: "UC San Diego", seed: 12, region: "South", americanOdds: { r32: -150, s16: +405, e8: +2200, f4: +5000, f2: +40000, champ: +95000 } },
        { id: 7, name: "Texas A&M", seed: 4, region: "South", americanOdds: { r32: +260, s16: +126, e8: +700, f4: +1300, f2: +7200, champ: +10000 } },
        { id: 8, name: "Yale", seed: 13, region: "South", americanOdds: { r32: -318, s16: +780, e8: +5400, f4: +17000, f2: +50000, champ: +100000 } },
        { id: 9, name: "Ole Miss", seed: 6, region: "South", americanOdds: { r32: +787, s16: +375, e8: +1120, f4: +2100, f2: +14000, champ: +15000 } },
        { id: 10, name: "San Diego State/UNC", seed: 11, region: "South", americanOdds: { r32: -1247, s16: +1200, e8: +2900, f4: +4100, f2: +12000, champ: +28000 } },
        { id: 11, name: "Iowa State", seed: 3, region: "South", americanOdds: { r32: +142, s16: -128, e8: +238, f4: +500, f2: +2000, champ: +3000 } },
        { id: 12, name: "Lipscomb", seed: 14, region: "South", americanOdds: { r32: -167, s16: +4000, e8: +8000, f4: +25000, f2: +50000, champ: +100000 } },
        { id: 13, name: "Marquette", seed: 7, region: "South", americanOdds: { r32: +214, s16: +350, e8: +865, f4: +2300, f2: +8200, champ: +16000 } },
        { id: 14, name: "New Mexico", seed: 10, region: "South", americanOdds: { r32: -258, s16: +1200, e8: +1330, f4: +7000, f2: +40000, champ: +100000 } },
        { id: 15, name: "Michigan State", seed: 2, region: "South", americanOdds: { r32: +1268, s16: -260, e8: +113, f4: +490, f2: +860, champ: +3000 } },
        { id: 16, name: "Bryant", seed: 15, region: "South", americanOdds: { r32: -2787, s16: +5000, e8: +10000, f4: +25000, f2: +50000, champ: +100000 } },

        // West Region
        { id: 49, name: "Florida", seed: 1, region: "West", americanOdds: { r32: +1049, s16: -335, e8: -170, f4: -120, f2: +257, champ: +400 } },
        { id: 50, name: "Norfolk St.", seed: 16, region: "West", americanOdds: { r32: -1958, s16: +8000, e8: +15000, f4: +25000, f2: +50000, champ: +100000 } },
        { id: 51, name: "UConn", seed: 8, region: "West", americanOdds: { r32: +168, s16: +1200, e8: +2800, f4: +2500, f2: +7600, champ: +13000 } },
        { id: 52, name: "Oklahoma", seed: 9, region: "West", americanOdds: { r32: -198, s16: +1200, e8: +2700, f4: +7500, f2: +30000, champ: +80000 } },
        { id: 53, name: "Memphis", seed: 5, region: "West", americanOdds: { r32: -135, s16: +147, e8: +700, f4: +7500, f2: +30000, champ: +80000 } },
        { id: 54, name: "Colorado State", seed: 12, region: "West", americanOdds: { r32: +116, s16: +405, e8: +2300, f4: +6000, f2: +30000, champ: +70000 } },
        { id: 55, name: "Maryland", seed: 4, region: "West", americanOdds: { r32: +464, s16: +126, e8: +700, f4: +1000, f2: +3000, champ: +7000 } },
        { id: 56, name: "Grand Canyon", seed: 13, region: "West", americanOdds: { r32: -621, s16: +1200, e8: +2700, f4: +25000, f2: +50000, champ: +100000 } },
        { id: 57, name: "Missouri", seed: 6, region: "West", americanOdds: { r32: +171, s16: +360, e8: +1100, f4: +1400, f2: +12500, champ: +8000 } },
        { id: 58, name: "Drake", seed: 11, region: "West", americanOdds: { r32: -202, s16: +785, e8: +3000, f4: +16000, f2: +50000, champ: +100000 } },
        { id: 59, name: "Texas Tech", seed: 3, region: "West", americanOdds: { r32: +1416, s16: -162, e8: +233, f4: +480, f2: +1750, champ: +2400 } },
        { id: 60, name: "UNCW", seed: 14, region: "West", americanOdds: { r32: -3535, s16: +4000, e8: +8000, f4: +25000, f2: +50000, champ: +100000 } },
        { id: 61, name: "Kansas", seed: 7, region: "West", americanOdds: { r32: +171, s16: +350, e8: +1550, f4: +1400, f2: +4000, champ: +8000 } },
        { id: 62, name: "Arkansas", seed: 10, region: "West", americanOdds: { r32: -202, s16: +1200, e8: +4000, f4: +8000, f2: +40000, champ: +100000 } },
        { id: 63, name: "St. John's", seed: 2, region: "West", americanOdds: { r32: +692, s16: -260, e8: +113, f4: +650, f2: +860, champ: +3200 } },
        { id: 64, name: "Omaha", seed: 15, region: "West", americanOdds: { r32: -1039, s16: +5000, e8: +10000, f4: +25000, f2: +50000, champ: +100000 } }
    ];
}

// Initialize event listeners
function initializeEventListeners() {
    // Button actions
    const fetchOddsBtn = document.getElementById('fetchOddsBtn');
    const saveOddsBtn = document.getElementById('saveOddsBtn');
    const regionFilter = document.getElementById('regionFilter');
    const teamSearch = document.getElementById('teamSearch');
    const sortOption = document.getElementById('sortOption');
    const sortDirection = document.getElementById('sortDirection');
    const syncWithAuctionBtn = document.getElementById('syncWithAuctionBtn');

    // Only add listeners if elements exist (we might be on a different page)
    if (fetchOddsBtn) {
        fetchOddsBtn.addEventListener('click', fetchLatestOdds);
    }
    if (saveOddsBtn) {
        saveOddsBtn.addEventListener('click', saveOdds);
    }
    if (regionFilter) {
        regionFilter.addEventListener('change', function() {
            currentRegionFilter = this.value;
            updateUI();
        });
    }
    
    // Search teams
    if (teamSearch) {
        teamSearch.addEventListener('input', function() {
            currentSearchTerm = this.value.toLowerCase();
            updateUI();
        });
    }
    
    // Sort table
    if (sortOption) {
        sortOption.addEventListener('change', function() {
            currentSortOption = this.value;
            updateUI();
        });
    }
    
    // Sort direction
    if (sortDirection) {
        sortDirection.addEventListener('click', function() {
            currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
            const sortIcon = document.getElementById('sortIcon');
            if (sortIcon) {
                sortIcon.className = currentSortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            }
            updateUI();
        });
    }

    // Set up event delegation for odds inputs
    const oddsTable = document.getElementById('oddsTable');
    if (oddsTable) {
        oddsTable.addEventListener('change', function(e) {
            if (e.target.classList.contains('odds-input')) {
                const teamId = parseInt(e.target.dataset.teamId);
                const round = e.target.dataset.round;
                const value = e.target.value;
                handleOddsChange(teamId, round, value);
            }
        });

        // Handle purchase price changes
        oddsTable.addEventListener('change', function(e) {
            if (e.target.type === 'number' && e.target.closest('td').nextElementSibling?.querySelector('.form-check-input')) {
                const teamId = parseInt(e.target.closest('tr').querySelector('.odds-input').dataset.teamId);
                const price = parseFloat(e.target.value) || 0;
                const team = teams.find(t => t.id === teamId);
                if (team) {
                    team.purchasePrice = price;
                    saveOdds();
                }
            }
        });

        // Handle "My Team" checkbox changes
        oddsTable.addEventListener('change', function(e) {
            if (e.target.type === 'checkbox' && e.target.classList.contains('form-check-input')) {
                const teamId = parseInt(e.target.closest('tr').querySelector('.odds-input').dataset.teamId);
                const isMyTeam = e.target.checked;
                const team = teams.find(t => t.id === teamId);
                if (team) {
                    team.isMyTeam = isMyTeam;
                    saveOdds();
                }
            }
        });
    }

    // Set up event listener for sync with auction tool button
    if (syncWithAuctionBtn) {
        syncWithAuctionBtn.addEventListener('click', function() {
            // Get teams data from auction tool
            const calcuttaTeams = localStorage.getItem('calcuttaTeams');
            if (calcuttaTeams) {
                try {
                    const auctionTeams = JSON.parse(calcuttaTeams);
                    console.log('Found auction tool teams:', auctionTeams.length);
                    
                    if (auctionTeams.length > 0) {
                        // Create a map of current teams by ID for easy lookup
                        const currentTeamsMap = {};
                        teams.forEach(team => {
                            currentTeamsMap[team.id] = team;
                        });
                        
                        // Update existing teams with auction data
                        let teamsUpdated = 0;
                        auctionTeams.forEach(auctionTeam => {
                            const existingTeam = currentTeamsMap[auctionTeam.id];
                            if (existingTeam) {
                                // Update purchase price and isMyTeam
                                existingTeam.purchasePrice = auctionTeam.purchasePrice || 0;
                                existingTeam.isMyTeam = auctionTeam.isMyTeam || false;
                                teamsUpdated++;
                            }
                        });
                        
                        // Recalculate implied probabilities
                        calculateImpliedProbabilities();
                        
                        // Update the UI
                        updateUI();
                        
                        // Show success message
                        showAlert('success', `Synced with Auction Tool: ${teamsUpdated} teams updated.`);
                    }
                } catch (error) {
                    console.error('Error syncing with auction tool:', error);
                    showAlert('danger', 'Error syncing with Auction Tool: ' + error.message);
                }
            } else {
                console.warn('No auction tool data found in localStorage');
                showAlert('warning', 'No Auction Tool data found. Please visit the Auction Tool page first.');
            }
        });
    }
}

// Helper function to show alerts
function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    const cardBody = document.querySelector('.card-body');
    if (cardBody) {
        cardBody.prepend(alert);
        setTimeout(() => alert.remove(), 3000);
    }
}

// Convert American odds to implied probability
function americanOddsToImpliedProbability(americanOdds) {
    if (americanOdds > 0) {
        return 100 / (americanOdds + 100);
    } else {
        return Math.abs(americanOdds) / (Math.abs(americanOdds) + 100);
    }
}

// Convert implied probability to American odds
function impliedProbabilityToAmericanOdds(probability) {
    if (probability <= 0 || probability >= 1) {
        return 0;
    }
    
    if (probability < 0.5) {
        return Math.round((100 / probability) - 100);
    } else {
        return Math.round(-1 * (probability * 100) / (1 - probability));
    }
}

// Devig odds for a specific market
function devigOdds(teamsInMarket) {
    // Extract implied probabilities
    const impliedProbabilities = teamsInMarket.map(team => team.impliedProbabilities.champ);
    
    // Calculate the overround (sum of all implied probabilities)
    const overround = impliedProbabilities.reduce((sum, prob) => sum + prob, 0);
    
    // Normalize the probabilities to remove the vig
    const devigged = teamsInMarket.map(team => {
        return {
            ...team,
            odds: {
                ...team.odds,
                champ: team.impliedProbabilities.champ / overround
            }
        };
    });
    
    return devigged;
}

// Devig odds for each round
function devigRoundOdds() {
    // For Round of 32 (First Round), devig each matchup individually
    // 1 vs 16, 8 vs 9, 5 vs 12, 4 vs 13, 6 vs 11, 3 vs 14, 7 vs 10, 2 vs 15
    regions.forEach(region => {
        const teamsInRegion = teams.filter(team => team.region === region);
        
        // Sort by seed for proper matchups
        teamsInRegion.sort((a, b) => a.seed - b.seed);
        
        // Process Round of 32 matchups (1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)
        // For play-in games (16 seeds), we'll treat them as a single entry for now
        const r32Matchups = [
            [1, 16], [8, 9], [5, 12], [4, 13], [6, 11], [3, 14], [7, 10], [2, 15]
        ];
        
        r32Matchups.forEach(seedPair => {
            // Find teams with these seeds in this region
            const matchupTeams = teamsInRegion.filter(team => 
                seedPair.includes(team.seed)
            );
            
            if (matchupTeams.length >= 2) {
                // Calculate overround for just this matchup
                const r32Probs = matchupTeams.map(team => team.rawImpliedProbabilities.r32);
                const r32Overround = r32Probs.reduce((sum, prob) => sum + prob, 0);
                
                // Devig just this matchup
                matchupTeams.forEach(team => {
                    team.odds.r32 = team.rawImpliedProbabilities.r32 / r32Overround;
                });
            }
        });
        
        // For Sweet 16, group teams by potential matchups (4 teams that could meet)
        // Four quadrants: 1/16/8/9, 5/12/4/13, 6/11/3/14, 7/10/2/15
        const s16Groups = [
            [1, 16, 8, 9],    // First quadrant
            [5, 12, 4, 13],   // Second quadrant
            [6, 11, 3, 14],   // Third quadrant
            [7, 10, 2, 15]    // Fourth quadrant
        ];
        
        s16Groups.forEach(seedGroup => {
            const groupTeams = teamsInRegion.filter(team => 
                seedGroup.includes(team.seed)
            );
            
            if (groupTeams.length > 0) {
                // Calculate overround for this group
                const s16Probs = groupTeams.map(team => team.rawImpliedProbabilities.s16);
                const s16Overround = s16Probs.reduce((sum, prob) => sum + prob, 0);
                
                // Devig this group
                groupTeams.forEach(team => {
                    team.odds.s16 = team.rawImpliedProbabilities.s16 / s16Overround;
                    
                    // Ensure Sweet 16 probability is not less than Elite 8 probability
                    if (team.odds.s16 < team.rawImpliedProbabilities.e8) {
                        console.log(`Adjusting ${team.name}'s Sweet 16 probability to be consistent with Elite 8`);
                    }
                });
            }
        });
        
        // For Elite 8, only top half vs bottom half of region compete
        // Top half: 1/16/8/9/5/12/4/13
        // Bottom half: 6/11/3/14/7/10/2/15
        const topHalfSeeds = [1, 16, 8, 9, 5, 12, 4, 13];
        const bottomHalfSeeds = [6, 11, 3, 14, 7, 10, 2, 15];
        
        const topHalfTeams = teamsInRegion.filter(team => topHalfSeeds.includes(team.seed));
        const bottomHalfTeams = teamsInRegion.filter(team => bottomHalfSeeds.includes(team.seed));
        
        // Devig top half
        if (topHalfTeams.length > 0) {
            const e8ProbsTop = topHalfTeams.map(team => team.rawImpliedProbabilities.e8);
            const e8OverroundTop = e8ProbsTop.reduce((sum, prob) => sum + prob, 0);
            
            topHalfTeams.forEach(team => {
                team.odds.e8 = team.rawImpliedProbabilities.e8 / e8OverroundTop;
                
                // Ensure Elite 8 probability is not greater than Sweet 16 probability
                if (team.odds.e8 > team.odds.s16) {
                    team.odds.e8 = team.odds.s16 * (team.rawImpliedProbabilities.e8 / team.rawImpliedProbabilities.s16);
                }
            });
        }
        
        // Devig bottom half
        if (bottomHalfTeams.length > 0) {
            const e8ProbsBottom = bottomHalfTeams.map(team => team.rawImpliedProbabilities.e8);
            const e8OverroundBottom = e8ProbsBottom.reduce((sum, prob) => sum + prob, 0);
            
            bottomHalfTeams.forEach(team => {
                team.odds.e8 = team.rawImpliedProbabilities.e8 / e8OverroundBottom;
                
                // Ensure Elite 8 probability is not greater than Sweet 16 probability
                if (team.odds.e8 > team.odds.s16) {
                    team.odds.e8 = team.odds.s16 * (team.rawImpliedProbabilities.e8 / team.rawImpliedProbabilities.s16);
                }
            });
        }
        
        // For Final Four, all teams in the region compete
        const f4Probs = teamsInRegion.map(team => team.rawImpliedProbabilities.f4);
        const f4Overround = f4Probs.reduce((sum, prob) => sum + prob, 0);
        
        teamsInRegion.forEach(team => {
            team.odds.f4 = team.rawImpliedProbabilities.f4 / f4Overround;
            
            // Ensure Final Four probability is not greater than Elite 8 probability
            if (team.odds.f4 > team.odds.e8) {
                team.odds.f4 = team.odds.e8 * (team.rawImpliedProbabilities.f4 / team.rawImpliedProbabilities.e8);
            }
        });
    });
    
    // For Championship game (Final 2), teams from the same half of the bracket compete
    // South/West side
    const southWestTeams = teams.filter(team => team.region === 'South' || team.region === 'West');
    const f2ProbsSouthWest = southWestTeams.map(team => team.rawImpliedProbabilities.f2);
    const f2OverroundSouthWest = f2ProbsSouthWest.reduce((sum, prob) => sum + prob, 0);
    
    southWestTeams.forEach(team => {
        team.odds.f2 = team.rawImpliedProbabilities.f2 / f2OverroundSouthWest;
        
        // Ensure Championship probability is not greater than Final Four probability
        if (team.odds.f2 > team.odds.f4) {
            team.odds.f2 = team.odds.f4 * (team.rawImpliedProbabilities.f2 / team.rawImpliedProbabilities.f4);
        }
    });
    
    // East/Midwest side
    const eastMidwestTeams = teams.filter(team => team.region === 'East' || team.region === 'Midwest');
    const f2ProbsEastMidwest = eastMidwestTeams.map(team => team.rawImpliedProbabilities.f2);
    const f2OverroundEastMidwest = f2ProbsEastMidwest.reduce((sum, prob) => sum + prob, 0);
    
    eastMidwestTeams.forEach(team => {
        team.odds.f2 = team.rawImpliedProbabilities.f2 / f2OverroundEastMidwest;
        
        // Ensure Championship probability is not greater than Final Four probability
        if (team.odds.f2 > team.odds.f4) {
            team.odds.f2 = team.odds.f4 * (team.rawImpliedProbabilities.f2 / team.rawImpliedProbabilities.f4);
        }
    });
    
    // For Champion, all teams compete
    const champProbs = teams.map(team => team.rawImpliedProbabilities.champ);
    const champOverround = champProbs.reduce((sum, prob) => sum + prob, 0);
    
    teams.forEach(team => {
        team.odds.champ = team.rawImpliedProbabilities.champ / champOverround;
        
        // Ensure Champion probability is not greater than Championship probability
        if (team.odds.champ > team.odds.f2) {
            team.odds.champ = team.odds.f2 * (team.rawImpliedProbabilities.champ / team.rawImpliedProbabilities.f2);
        }
    });
    
    // Normalize probabilities to ensure they sum to expected values
    normalizeRegionalProbabilities();
}

// Normalize probabilities to ensure they sum to expected values
function normalizeRegionalProbabilities() {
    // For each region, ensure probabilities sum correctly
    regions.forEach(region => {
        const teamsInRegion = teams.filter(team => team.region === region);
        
        // Process Round of 32 matchups (1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)
        const r32Matchups = [
            [1, 16], [8, 9], [5, 12], [4, 13], [6, 11], [3, 14], [7, 10], [2, 15]
        ];
        
        r32Matchups.forEach(seedPair => {
            // Find teams with these seeds in this region
            const matchupTeams = teamsInRegion.filter(team => 
                seedPair.includes(team.seed)
            );
            
            if (matchupTeams.length >= 2) {
                // Normalize to 100%
                const r32Sum = matchupTeams.reduce((sum, team) => sum + team.odds.r32, 0);
                if (r32Sum > 0) {
                    const r32Factor = 1.0 / r32Sum;
                    matchupTeams.forEach(team => {
                        team.odds.r32 *= r32Factor;
                    });
                }
            }
        });
        
        // For Sweet 16, group teams by potential matchups (4 teams that could meet)
        const s16Groups = [
            [1, 16, 8, 9],    // First quadrant
            [5, 12, 4, 13],   // Second quadrant
            [6, 11, 3, 14],   // Third quadrant
            [7, 10, 2, 15]    // Fourth quadrant
        ];
        
        s16Groups.forEach(seedGroup => {
            const groupTeams = teamsInRegion.filter(team => 
                seedGroup.includes(team.seed)
            );
            
            if (groupTeams.length > 0) {
                // Normalize to 100%
                const s16Sum = groupTeams.reduce((sum, team) => sum + team.odds.s16, 0);
                if (s16Sum > 0) {
                    const s16Factor = 1.0 / s16Sum;
                    groupTeams.forEach(team => {
                        team.odds.s16 *= s16Factor;
                    });
                }
            }
        });
        
        // For Elite 8, top half vs bottom half of region
        const topHalfSeeds = [1, 16, 8, 9, 5, 12, 4, 13];
        const bottomHalfSeeds = [6, 11, 3, 14, 7, 10, 2, 15];
        
        const topHalfTeams = teamsInRegion.filter(team => topHalfSeeds.includes(team.seed));
        const bottomHalfTeams = teamsInRegion.filter(team => bottomHalfSeeds.includes(team.seed));
        
        // Normalize top half to 100%
        if (topHalfTeams.length > 0) {
            const e8SumTop = topHalfTeams.reduce((sum, team) => sum + team.odds.e8, 0);
            if (e8SumTop > 0) {
                const e8FactorTop = 1.0 / e8SumTop;
                topHalfTeams.forEach(team => {
                    team.odds.e8 *= e8FactorTop;
                });
            }
        }
        
        // Normalize bottom half to 100%
        if (bottomHalfTeams.length > 0) {
            const e8SumBottom = bottomHalfTeams.reduce((sum, team) => sum + team.odds.e8, 0);
            if (e8SumBottom > 0) {
                const e8FactorBottom = 1.0 / e8SumBottom;
                bottomHalfTeams.forEach(team => {
                    team.odds.e8 *= e8FactorBottom;
                });
            }
        }
        
        // For Final Four, all teams in the region compete
        // Normalize to 100%
        const f4Sum = teamsInRegion.reduce((sum, team) => sum + team.odds.f4, 0);
        if (f4Sum > 0) {
            const f4Factor = 1.0 / f4Sum;
            teamsInRegion.forEach(team => {
                team.odds.f4 *= f4Factor;
            });
        }
    });
    
    // For Championship game (Final 2), teams from the same half of the bracket compete
    // South/West side - normalize to 100%
    const southWestTeams = teams.filter(team => team.region === 'South' || team.region === 'West');
    const f2SumSouthWest = southWestTeams.reduce((sum, team) => sum + team.odds.f2, 0);
    if (f2SumSouthWest > 0) {
        const f2FactorSouthWest = 1.0 / f2SumSouthWest;
        southWestTeams.forEach(team => {
            team.odds.f2 *= f2FactorSouthWest;
        });
    }
    
    // East/Midwest side - normalize to 100%
    const eastMidwestTeams = teams.filter(team => team.region === 'East' || team.region === 'Midwest');
    const f2SumEastMidwest = eastMidwestTeams.reduce((sum, team) => sum + team.odds.f2, 0);
    if (f2SumEastMidwest > 0) {
        const f2FactorEastMidwest = 1.0 / f2SumEastMidwest;
        eastMidwestTeams.forEach(team => {
            team.odds.f2 *= f2FactorEastMidwest;
        });
    }
    
    // For Champion, all teams compete - normalize to 100%
    const champSum = teams.reduce((sum, team) => sum + team.odds.champ, 0);
    if (champSum > 0) {
        const champFactor = 1.0 / champSum;
        teams.forEach(team => {
            team.odds.champ *= champFactor;
        });
    }
}

// Calculate implied probabilities from American odds
function calculateImpliedProbabilities() {
    console.log('Calculating implied probabilities for', teams.length, 'teams');
    
    teams.forEach(team => {
        // Check if team has americanOdds
        if (!team.americanOdds) {
            console.warn(`Team ${team.name} (ID: ${team.id}) missing americanOdds, using defaults`);
            // Create default americanOdds if not found
            team.americanOdds = {
                r32: -1000, s16: +150, e8: +300, f4: +600, f2: +1200, champ: +2500
            };
        }
        
        // First, calculate raw implied probabilities from American odds
        team.rawImpliedProbabilities = {
            r32: americanOddsToImpliedProbability(team.americanOdds.r32),
            s16: americanOddsToImpliedProbability(team.americanOdds.s16),
            e8: americanOddsToImpliedProbability(team.americanOdds.e8),
            f4: americanOddsToImpliedProbability(team.americanOdds.f4),
            f2: americanOddsToImpliedProbability(team.americanOdds.f2),
            champ: americanOddsToImpliedProbability(team.americanOdds.champ)
        };
        
        // Initialize odds object (will be populated by devigging)
        team.odds = {
            r32: 0,
            s16: 0,
            e8: 0,
            f4: 0,
            f2: 0,
            champ: 0
        };
    });
    
    // Devig odds for each round
    devigRoundOdds();
    
    // Update winPercentage and valuePercentage based on championship odds
    teams.forEach(team => {
        team.winPercentage = team.odds.champ;
        team.valuePercentage = team.odds.champ;
    });
    
    console.log('Implied probabilities calculated successfully');
}

// Fetch latest odds from an API
function fetchLatestOdds() {
    const loadingAlert = document.createElement('div');
    loadingAlert.className = 'alert alert-info';
    loadingAlert.textContent = 'Fetching latest odds...';
    document.querySelector('.card-body').prepend(loadingAlert);
    
    // Store current purchase prices and team status
    const currentTeams = {};
    teams.forEach(team => {
        currentTeams[team.id] = {
            purchasePrice: team.purchasePrice || 0,
            isMyTeam: team.isMyTeam || false
        };
    });
    
    setTimeout(() => {
        // Load the default teams with market odds
        teams = getDefaultTeams();
        
        // Restore purchase prices and team status
        teams.forEach(team => {
            if (currentTeams[team.id]) {
                team.purchasePrice = currentTeams[team.id].purchasePrice;
                team.isMyTeam = currentTeams[team.id].isMyTeam;
            } else {
                team.purchasePrice = 0;
                team.isMyTeam = false;
            }
        });
        
        // Recalculate implied probabilities
        calculateImpliedProbabilities();
        
        // Save the updated odds
        saveOdds();
        
        // Update the UI
        updateUI();
        
        // Remove loading alert
        loadingAlert.remove();
        
        // Show success alert
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success';
        successAlert.textContent = 'Market odds loaded successfully!';
        document.querySelector('.card-body').prepend(successAlert);
        
        // Remove success alert after 3 seconds
        setTimeout(() => {
            successAlert.remove();
        }, 3000);
    }, 1500);
}

// Save odds
async function saveOdds() {
    // Ensure all teams have properly calculated odds before saving
    calculateImpliedProbabilities();
    
    // Create a copy of teams with ONLY the user-specific data
    const teamsToSave = teams.map(team => ({
        id: team.id,  // We need the ID to match with base team data
        name: team.name,           // Include base team info
        seed: team.seed,          // Include base team info
        region: team.region,      // Include base team info
        americanOdds: team.americanOdds,
        odds: team.odds,
        winPercentage: team.odds.champ,
        valuePercentage: team.odds.champ,
        purchasePrice: team.purchasePrice || 0,
        isMyTeam: team.isMyTeam || false
    }));
    
    // Save to local storage
    const userId = getUserId();
    localStorage.setItem(`teamOddsData_${userId}`, JSON.stringify(teamsToSave));
    localStorage.setItem('teamOddsData', JSON.stringify(teamsToSave));
    
    console.log('Saved team odds data:', teamsToSave.length);
    
    // Save to server if logged in
    if (isLoggedIn()) {
        try {
            const userData = {
                teams: teamsToSave,  // Only save teams data, don't include payout rules
                lastUpdated: new Date().toISOString()
            };
            
            const success = await saveUserData(userData);
            if (success) {
                console.log('Teams saved to server');
            } else {
                console.error('Failed to save teams to server');
            }
        } catch (error) {
            console.error('Error saving to server:', error);
        }
    }
    
    // Show success alert
    const successAlert = document.createElement('div');
    successAlert.className = 'alert alert-success';
    successAlert.textContent = 'Odds saved successfully!';
    document.querySelector('.card-body').prepend(successAlert);
    
    // Remove success alert after 3 seconds
    setTimeout(() => {
        successAlert.remove();
    }, 3000);
}

// Load saved odds
function loadSavedOdds() {
    const savedOdds = localStorage.getItem('teamOddsData');
    
    if (savedOdds) {
        const oddsData = JSON.parse(savedOdds);
        
        // Update teams with saved odds
        teams.forEach(team => {
            const savedTeam = oddsData.find(t => t.id === team.id);
            
            if (savedTeam) {
                team.americanOdds = savedTeam.americanOdds;
                team.rawImpliedProbabilities = savedTeam.rawImpliedProbabilities;
                team.odds = savedTeam.odds;
                // Also load purchase price and isMyTeam status
                team.purchasePrice = savedTeam.purchasePrice || 0;
                team.isMyTeam = savedTeam.isMyTeam || false;
            }
        });
    }
    
    // Also check calcuttaTeams as a fallback
    if (!savedOdds) {
        const calcuttaTeams = localStorage.getItem('calcuttaTeams');
        if (calcuttaTeams) {
            try {
                const auctionTeams = JSON.parse(calcuttaTeams);
                
                // Update teams with auction data
                teams.forEach(team => {
                    const auctionTeam = auctionTeams.find(t => t.id === team.id);
                    
                    if (auctionTeam) {
                        // Update purchase price and isMyTeam
                        team.purchasePrice = auctionTeam.purchasePrice || 0;
                        team.isMyTeam = auctionTeam.isMyTeam || false;
                    }
                });
            } catch (error) {
                console.error('Error parsing calcutta teams data:', error);
            }
        }
    }
}

// Handle odds input change
function handleOddsChange(teamId, round, value) {
    const team = teams.find(t => t.id === teamId);
    
    if (team) {
        // Parse the input value
        let americanOdds = parseInt(value);
        
        // Ensure the value has the correct sign
        if (americanOdds > 0 && !value.startsWith('+')) {
            americanOdds = +americanOdds;
        }
        
        // Update the team's American odds for the specified round
        team.americanOdds[round] = americanOdds;
        
        // Save the updated odds to localStorage to persist changes
        const teamsToSave = teams.map(t => ({
            id: t.id,
            name: t.name,           // Include base team info
            seed: t.seed,          // Include base team info
            region: t.region,      // Include base team info
            americanOdds: t.americanOdds,
            odds: t.odds,
            winPercentage: t.odds.champ,
            valuePercentage: t.odds.champ,
            purchasePrice: t.purchasePrice || 0,
            isMyTeam: t.isMyTeam || false
        }));
        
        // Save to both user-specific and default locations
        const userId = getUserId();
        localStorage.setItem(`teamOddsData_${userId}`, JSON.stringify(teamsToSave));
        localStorage.setItem('teamOddsData', JSON.stringify(teamsToSave));
        
        // Recalculate implied probabilities
        calculateImpliedProbabilities();
        
        // Update ALL teams' probabilities in the UI for this round
        teams.forEach(t => {
            const probCell = document.querySelector(`#${t.id}_${round}_prob`);
            if (probCell) {
                probCell.textContent = (t.odds[round] * 100).toFixed(1) + '%';
            }
        });
    }
}

// Update the UI
function updateUI() {
    const tableBody = document.getElementById('oddsTableBody');
    if (!tableBody) {
        console.error('Odds table body not found');
        return;
    }

    // Clear the table body
    tableBody.innerHTML = '';

    // Filter teams based on region and search term
    filteredTeams = teams.filter(team => {
        const matchesRegion = currentRegionFilter === 'all' || team.region === currentRegionFilter;
        const matchesSearch = !currentSearchTerm || 
            team.name.toLowerCase().includes(currentSearchTerm) || 
            team.region.toLowerCase().includes(currentSearchTerm);
        return matchesRegion && matchesSearch;
    });

    // Sort teams
    filteredTeams.sort((a, b) => {
        let comparison = 0;
        switch (currentSortOption) {
            case 'seed':
                comparison = a.seed - b.seed;
                break;
            case 'champ':
                comparison = b.odds.champ - a.odds.champ;
                break;
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'region':
                comparison = a.region.localeCompare(b.region);
                break;
        }
        return currentSortDirection === 'asc' ? comparison : -comparison;
    });

    // Add each team to the table
    filteredTeams.forEach(team => {
        const row = document.createElement('tr');
        
        // Add team info cells
        const nameCell = document.createElement('td');
        nameCell.textContent = team.name;
        row.appendChild(nameCell);

        const seedCell = document.createElement('td');
        seedCell.textContent = team.seed;
        row.appendChild(seedCell);

        const regionCell = document.createElement('td');
        regionCell.textContent = team.region;
        row.appendChild(regionCell);

        // Add odds cells for each round
        const rounds = ['r32', 's16', 'e8', 'f4', 'f2', 'champ'];
        rounds.forEach(round => {
            // American odds input cell
            const oddsCell = document.createElement('td');
            const oddsInput = document.createElement('input');
            oddsInput.type = 'text';
            oddsInput.className = 'form-control odds-input';
            oddsInput.value = team.americanOdds[round];
            oddsInput.dataset.teamId = team.id;
            oddsInput.dataset.round = round;
            oddsCell.appendChild(oddsInput);
            row.appendChild(oddsCell);
        });

        // Add probability cell for champion
        const champProbCell = document.createElement('td');
        champProbCell.textContent = (team.odds.champ * 100).toFixed(1) + '%';
        champProbCell.id = `${team.id}_champ_prob`;
        row.appendChild(champProbCell);

        // Add purchase price cell
        const priceCell = document.createElement('td');
        const priceInput = document.createElement('input');
        priceInput.type = 'number';
        priceInput.className = 'form-control';
        priceInput.value = team.purchasePrice || '';
        priceInput.min = '0';
        priceInput.step = '1';
        priceCell.appendChild(priceInput);
        row.appendChild(priceCell);

        // Add "My Team" checkbox cell
        const myTeamCell = document.createElement('td');
        const myTeamCheckbox = document.createElement('input');
        myTeamCheckbox.type = 'checkbox';
        myTeamCheckbox.className = 'form-check-input';
        myTeamCheckbox.checked = team.isMyTeam || false;
        myTeamCell.appendChild(myTeamCheckbox);
        row.appendChild(myTeamCell);

        // Add the row to the table
        tableBody.appendChild(row);
    });

    console.log(`Displayed ${filteredTeams.length} teams in the table`);
}
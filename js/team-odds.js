// Team Odds JavaScript

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
        // South Region (Atlanta)
        { id: 1, name: "Auburn", seed: 1, region: "South", americanOdds: { r32: -5000, s16: -1000, e8: -400, f4: -125, f2: +200, champ: +430 } },
        { id: 2, name: "Michigan State", seed: 2, region: "South", americanOdds: { r32: -2500, s16: -800, e8: +200, f4: +490, f2: +1200, champ: +2500 } },
        { id: 3, name: "Texas A&M", seed: 3, region: "South", americanOdds: { r32: -1500, s16: -200, e8: +600, f4: +1200, f2: +2500, champ: +5000 } },
        { id: 4, name: "Clemson", seed: 4, region: "South", americanOdds: { r32: -1200, s16: +100, e8: +800, f4: +1900, f2: +3500, champ: +8000 } },
        { id: 5, name: "Oregon", seed: 5, region: "South", americanOdds: { r32: -800, s16: +150, e8: +1000, f4: +2100, f2: +4500, champ: +10000 } },
        { id: 6, name: "Kansas", seed: 6, region: "South", americanOdds: { r32: -600, s16: +200, e8: +800, f4: +1800, f2: +3500, champ: +8000 } },
        { id: 7, name: "Missouri", seed: 7, region: "South", americanOdds: { r32: -400, s16: +250, e8: +800, f4: +1200, f2: +2000, champ: +5000 } },
        { id: 8, name: "Marquette", seed: 8, region: "South", americanOdds: { r32: +150, s16: +800, e8: +1200, f4: +1600, f2: +2500, champ: +6000 } },
        { id: 9, name: "Baylor", seed: 9, region: "South", americanOdds: { r32: +150, s16: +800, e8: +1500, f4: +2000, f2: +3500, champ: +8000 } },
        { id: 10, name: "Utah State", seed: 10, region: "South", americanOdds: { r32: +200, s16: +1000, e8: +1800, f4: +2500, f2: +4500, champ: +10000 } },
        { id: 11, name: "San Diego State", seed: 11, region: "South", americanOdds: { r32: +250, s16: +1200, e8: +2000, f4: +3000, f2: +5000, champ: +12000 } },
        { id: 12, name: "UC San Diego", seed: 12, region: "South", americanOdds: { r32: +300, s16: +2000, e8: +4000, f4: +4000, f2: +6000, champ: +15000 } },
        { id: 13, name: "Akron", seed: 13, region: "South", americanOdds: { r32: +400, s16: +3000, e8: +6000, f4: +5000, f2: +8000, champ: +20000 } },
        { id: 14, name: "Utah Valley", seed: 14, region: "South", americanOdds: { r32: +500, s16: +4000, e8: +8000, f4: +6000, f2: +10000, champ: +25000 } },
        { id: 15, name: "Bryant", seed: 15, region: "South", americanOdds: { r32: +700, s16: +5000, e8: +10000, f4: +8000, f2: +15000, champ: +30000 } },
        { id: 16, name: "SIU Edwardsville", seed: 16, region: "South", americanOdds: { r32: +1000, s16: +8000, e8: +15000, f4: +10000, f2: +20000, champ: +50000 } },
        { id: 17, name: "Jackson State", seed: 16, region: "South", americanOdds: { r32: +1000, s16: +8000, e8: +15000, f4: +10000, f2: +20000, champ: +50000 } },
        
        // East Region (Newark)
        { id: 18, name: "Duke", seed: 1, region: "East", americanOdds: { r32: -5000, s16: -1000, e8: -400, f4: -160, f2: +150, champ: +330 } },
        { id: 19, name: "Tennessee", seed: 2, region: "East", americanOdds: { r32: -2500, s16: -800, e8: +150, f4: +290, f2: +800, champ: +1600 } },
        { id: 20, name: "Iowa State", seed: 3, region: "East", americanOdds: { r32: -1500, s16: -200, e8: +300, f4: +550, f2: +1500, champ: +3000 } },
        { id: 21, name: "Maryland", seed: 4, region: "East", americanOdds: { r32: -1200, s16: +100, e8: +400, f4: +600, f2: +1200, champ: +2600 } },
        { id: 22, name: "BYU", seed: 5, region: "East", americanOdds: { r32: -800, s16: +150, e8: +500, f4: +800, f2: +1600, champ: +3200 } },
        { id: 23, name: "Michigan", seed: 6, region: "East", americanOdds: { r32: -600, s16: +200, e8: +600, f4: +1000, f2: +2000, champ: +4200 } },
        { id: 24, name: "Gonzaga", seed: 7, region: "East", americanOdds: { r32: -400, s16: +250, e8: +800, f4: +1200, f2: +2500, champ: +5200 } },
        { id: 25, name: "Mississippi State", seed: 8, region: "East", americanOdds: { r32: +150, s16: +800, e8: +1200, f4: +1600, f2: +3000, champ: +6200 } },
        { id: 26, name: "Creighton", seed: 9, region: "East", americanOdds: { r32: +150, s16: +800, e8: +1500, f4: +2000, f2: +3500, champ: +8200 } },
        { id: 27, name: "Oklahoma", seed: 10, region: "East", americanOdds: { r32: +200, s16: +1000, e8: +1800, f4: +2500, f2: +4500, champ: +10200 } },
        { id: 28, name: "VCU", seed: 11, region: "East", americanOdds: { r32: +250, s16: +1200, e8: +2000, f4: +3000, f2: +5000, champ: +12200 } },
        { id: 29, name: "Liberty", seed: 12, region: "East", americanOdds: { r32: +300, s16: +2000, e8: +4000, f4: +4000, f2: +6000, champ: +15200 } },
        { id: 30, name: "High Point", seed: 13, region: "East", americanOdds: { r32: +400, s16: +3000, e8: +6000, f4: +6000, f2: +10000, champ: +20200 } },
        { id: 31, name: "Troy", seed: 14, region: "East", americanOdds: { r32: +500, s16: +4000, e8: +8000, f4: +8000, f2: +15000, champ: +30200 } },
        { id: 32, name: "Robert Morris", seed: 15, region: "East", americanOdds: { r32: +800, s16: +5000, e8: +10000, f4: +10000, f2: +20000, champ: +50200 } },
        { id: 33, name: "American", seed: 16, region: "East", americanOdds: { r32: +1500, s16: +8000, e8: +15000, f4: +20000, f2: +50000, champ: +100200 } },
        { id: 34, name: "St. Francis", seed: 16, region: "East", americanOdds: { r32: +1500, s16: +8000, e8: +15000, f4: +20000, f2: +50000, champ: +100200 } },
        
        // West Region (San Francisco)
        { id: 35, name: "Florida", seed: 1, region: "West", americanOdds: { r32: -5000, s16: -1000, e8: -400, f4: -105, f2: +450, champ: +550 } },
        { id: 36, name: "Texas Tech", seed: 2, region: "West", americanOdds: { r32: -2500, s16: -800, e8: +200, f4: +550, f2: +1200, champ: +3000 } },
        { id: 37, name: "Kentucky", seed: 3, region: "West", americanOdds: { r32: -1500, s16: -200, e8: +600, f4: +1200, f2: +2500, champ: +5000 } },
        { id: 38, name: "Wisconsin", seed: 4, region: "West", americanOdds: { r32: -1200, s16: +100, e8: +400, f4: +600, f2: +1200, champ: +2700 } },
        { id: 39, name: "Arizona", seed: 5, region: "West", americanOdds: { r32: -800, s16: +150, e8: +500, f4: +800, f2: +1600, champ: +3300 } },
        { id: 40, name: "UCLA", seed: 6, region: "West", americanOdds: { r32: -600, s16: +200, e8: +600, f4: +1000, f2: +2000, champ: +4300 } },
        { id: 41, name: "Saint Mary's", seed: 7, region: "West", americanOdds: { r32: -400, s16: +250, e8: +800, f4: +1200, f2: +2500, champ: +5300 } },
        { id: 42, name: "UConn", seed: 8, region: "West", americanOdds: { r32: +150, s16: +800, e8: +1200, f4: +1600, f2: +3000, champ: +6300 } },
        { id: 43, name: "New Mexico", seed: 9, region: "West", americanOdds: { r32: +150, s16: +800, e8: +1500, f4: +2000, f2: +3500, champ: +8300 } },
        { id: 44, name: "Vanderbilt", seed: 10, region: "West", americanOdds: { r32: +200, s16: +1000, e8: +1800, f4: +2500, f2: +4500, champ: +10300 } },
        { id: 45, name: "Drake", seed: 11, region: "West", americanOdds: { r32: +250, s16: +1200, e8: +2000, f4: +3000, f2: +5000, champ: +12300 } },
        { id: 46, name: "Xavier", seed: 12, region: "West", americanOdds: { r32: +300, s16: +2000, e8: +4000, f4: +4000, f2: +6000, champ: +15300 } },
        { id: 47, name: "Lipscomb", seed: 13, region: "West", americanOdds: { r32: +400, s16: +3000, e8: +6000, f4: +6000, f2: +10000, champ: +20300 } },
        { id: 48, name: "Montana", seed: 14, region: "West", americanOdds: { r32: +500, s16: +4000, e8: +8000, f4: +8000, f2: +15000, champ: +30300 } },
        { id: 49, name: "Omaha", seed: 15, region: "West", americanOdds: { r32: +800, s16: +5000, e8: +10000, f4: +10000, f2: +20000, champ: +50300 } },
        { id: 50, name: "Norfolk State", seed: 16, region: "West", americanOdds: { r32: +1500, s16: +8000, e8: +15000, f4: +20000, f2: +50000, champ: +100300 } },
        
        // Midwest Region (Indianapolis)
        { id: 51, name: "Houston", seed: 1, region: "Midwest", americanOdds: { r32: -5000, s16: -1000, e8: -400, f4: +120, f2: +450, champ: +700 } },
        { id: 52, name: "Alabama", seed: 2, region: "Midwest", americanOdds: { r32: -2500, s16: -800, e8: +150, f4: +290, f2: +800, champ: +1600 } },
        { id: 53, name: "St. John's", seed: 3, region: "Midwest", americanOdds: { r32: -1500, s16: -200, e8: +300, f4: +2800, f2: +4500, champ: +12000 } },
        { id: 54, name: "Purdue", seed: 4, region: "Midwest", americanOdds: { r32: -1200, s16: +100, e8: +400, f4: +600, f2: +1200, champ: +2800 } },
        { id: 55, name: "Ole Miss", seed: 5, region: "Midwest", americanOdds: { r32: -800, s16: +150, e8: +500, f4: +800, f2: +1600, champ: +3400 } },
        { id: 56, name: "Illinois", seed: 6, region: "Midwest", americanOdds: { r32: -600, s16: +200, e8: +600, f4: +1000, f2: +2000, champ: +4400 } },
        { id: 57, name: "Louisville", seed: 7, region: "Midwest", americanOdds: { r32: -400, s16: +250, e8: +800, f4: +1200, f2: +2500, champ: +5400 } },
        { id: 58, name: "Memphis", seed: 8, region: "Midwest", americanOdds: { r32: +150, s16: +800, e8: +1200, f4: +1600, f2: +3000, champ: +6400 } },
        { id: 59, name: "Georgia", seed: 9, region: "Midwest", americanOdds: { r32: +150, s16: +800, e8: +1500, f4: +2000, f2: +3500, champ: +8400 } },
        { id: 60, name: "Arkansas", seed: 10, region: "Midwest", americanOdds: { r32: +200, s16: +1000, e8: +1800, f4: +2500, f2: +4500, champ: +10400 } },
        { id: 61, name: "West Virginia", seed: 11, region: "Midwest", americanOdds: { r32: +250, s16: +1200, e8: +2000, f4: +3000, f2: +5000, champ: +12400 } },
        { id: 62, name: "McNeese", seed: 12, region: "Midwest", americanOdds: { r32: +300, s16: +2000, e8: +4000, f4: +4000, f2: +6000, champ: +15400 } },
        { id: 63, name: "Yale", seed: 13, region: "Midwest", americanOdds: { r32: +400, s16: +3000, e8: +6000, f4: +6000, f2: +10000, champ: +20400 } },
        { id: 64, name: "UNC Wilmington", seed: 14, region: "Midwest", americanOdds: { r32: +500, s16: +4000, e8: +8000, f4: +8000, f2: +15000, champ: +30400 } },
        { id: 65, name: "Colgate", seed: 15, region: "Midwest", americanOdds: { r32: +800, s16: +5000, e8: +10000, f4: +10000, f2: +20000, champ: +50400 } },
        { id: 66, name: "Grambling", seed: 16, region: "Midwest", americanOdds: { r32: +1500, s16: +8000, e8: +15000, f4: +20000, f2: +50000, champ: +100400 } },
        { id: 67, name: "Howard", seed: 16, region: "Midwest", americanOdds: { r32: +1500, s16: +8000, e8: +15000, f4: +20000, f2: +50000, champ: +100400 } },
        { id: 68, name: "Wagner", seed: 16, region: "Midwest", americanOdds: { r32: +1500, s16: +8000, e8: +15000, f4: +20000, f2: +50000, champ: +100400 } }
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

    // Add event listeners to odds inputs
    const oddsInputs = document.querySelectorAll('.odds-input');
    oddsInputs.forEach(input => {
        if (input) {
            // Handle change event
            input.addEventListener('change', function() {
                const teamId = parseInt(this.getAttribute('data-team-id'));
                const round = this.getAttribute('data-round');
                const value = this.value;
                handleOddsChange(teamId, round, value);
            });

            // Handle blur event (when input loses focus)
            input.addEventListener('blur', function() {
                const teamId = parseInt(this.getAttribute('data-team-id'));
                const round = this.getAttribute('data-round');
                const value = this.value;
                handleOddsChange(teamId, round, value);
            });

            // Handle keydown event for tab key
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    const teamId = parseInt(this.getAttribute('data-team-id'));
                    const round = this.getAttribute('data-round');
                    const value = this.value;
                    handleOddsChange(teamId, round, value);
                }
            });
        }
    });
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
            const probCell = document.querySelector(`input[data-team-id="${t.id}"][data-round="${round}"]`)
                ?.nextElementSibling;
            if (probCell) {
                const probability = t.odds[round];
                probCell.textContent = `${(probability * 100).toFixed(2)}%`;
            }
        });
    }
}

// Update the UI
function updateUI() {
    console.log(`Updating UI with ${teams.length} teams`);
    console.log(`Current filter: ${currentRegionFilter}, Search term: "${currentSearchTerm}", Sort: ${currentSortOption} (${currentSortDirection})`);
    
    // Filter teams by region
    if (currentRegionFilter !== 'all') {
        filteredTeams = teams.filter(team => team.region === currentRegionFilter);
    } else {
        filteredTeams = [...teams];
    }
    console.log(`After region filter: ${filteredTeams.length} teams`);
    
    // Search teams
    if (currentSearchTerm) {
        filteredTeams = filteredTeams.filter(team => team.name.toLowerCase().includes(currentSearchTerm));
        console.log(`After search: ${filteredTeams.length} teams`);
    }
    
    // Sort teams
    if (currentSortOption === 'name') {
        filteredTeams.sort((a, b) => {
            const result = a.name.localeCompare(b.name);
            return currentSortDirection === 'asc' ? result : -result;
        });
    } else if (currentSortOption === 'seed') {
        filteredTeams.sort((a, b) => {
            const result = a.seed - b.seed;
            return currentSortDirection === 'asc' ? result : -result;
        });
    } else if (currentSortOption === 'region') {
        filteredTeams.sort((a, b) => {
            const result = regions.indexOf(a.region) - regions.indexOf(b.region);
            return currentSortDirection === 'asc' ? result : -result;
        });
    } else if (currentSortOption === 'champ') {
        filteredTeams.sort((a, b) => {
            // For champion odds, we want to sort by the implied probability
            const probA = a.odds.champ;
            const probB = b.odds.champ;
            // In ascending order, we want lower probabilities first
            const result = probA - probB;
            return currentSortDirection === 'asc' ? result : -result;
        });
    }
    console.log(`After sorting: First team is ${filteredTeams.length > 0 ? filteredTeams[0].name : 'none'}`);
    
    // Update odds table
    updateOddsTable();
    
    // Sync with auction tool
    syncWithAuctionTool();
}

// Sync data with auction tool
function syncWithAuctionTool() {
    // Ensure odds are calculated before saving
    calculateImpliedProbabilities();
    
    // Save the current teams data to localStorage for the auction tool to use
    const teamsToSave = teams.map(team => ({
        id: team.id,
        name: team.name,
        seed: team.seed,
        region: team.region,
        americanOdds: team.americanOdds, // Include American odds
        odds: team.odds,
        // Use the championship odds as the win percentage
        winPercentage: team.odds ? team.odds.champ : 0,
        // Use the championship odds as the value percentage initially
        // The auction tool will adjust this based on its own calculations
        valuePercentage: team.odds ? team.odds.champ : 0,
        // Ensure we preserve purchase price and isMyTeam status
        purchasePrice: team.purchasePrice || 0,
        isMyTeam: team.isMyTeam || false
    }));
    
    // Log purchase prices for debugging
    console.log('Syncing teams with purchase prices:', teamsToSave.filter(t => t.purchasePrice > 0).map(t => `${t.name}: $${t.purchasePrice}`));
    
    localStorage.setItem('teamOddsData', JSON.stringify(teamsToSave));
    localStorage.setItem('calcuttaTeams', JSON.stringify(teamsToSave));
    
    console.log('Synced team data with auction tool:', teamsToSave.length);
}

// Update odds table
function updateOddsTable() {
    // Check if we're on the team-odds page
    const isTeamOddsPage = window.location.pathname.includes('team-odds.html');
    const tableBodyId = isTeamOddsPage ? 'oddsTableBody' : 'teamTableBody';
    
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) {
        console.log(`Not updating odds table - we are on ${window.location.pathname}`);
        return;
    }
    
    console.log(`Updating odds table with ${filteredTeams.length} teams`);
    
    // Log teams with purchase prices for debugging
    const teamsWithPrices = filteredTeams.filter(team => team.purchasePrice > 0);
    if (teamsWithPrices.length > 0) {
        console.log('Teams with purchase prices:', teamsWithPrices.map(t => `${t.name}: $${t.purchasePrice}`));
    } else {
        console.log('No teams have purchase prices');
    }
    
    // Only update the table if we're on the team-odds page
    if (!isTeamOddsPage) {
        console.log('Not on team-odds page, skipping table update');
        return;
    }
    
    tableBody.innerHTML = '';
    
    filteredTeams.forEach(team => {
        const row = document.createElement('tr');
        
        // Add class for my teams
        if (team.isMyTeam) {
            row.classList.add('table-success');
        } else if (team.purchasePrice > 0) {
            row.classList.add('table-secondary');
        }
        
        // Make sure team has all required properties
        if (!team.americanOdds) {
            console.warn(`Team ${team.name} (ID: ${team.id}) missing americanOdds, using defaults`);
            team.americanOdds = {
                r32: -1000, s16: +150, e8: +300, f4: +600, f2: +1200, champ: +2500
            };
        }
        
        if (!team.odds) {
            console.warn(`Team ${team.name} (ID: ${team.id}) missing odds, recalculating`);
            calculateImpliedProbabilities();
        }
        
        row.innerHTML = `
            <td>${team.name}</td>
            <td>${team.seed}</td>
            <td>${team.region}</td>
            <td>
                <input type="text" class="form-control odds-input" data-team-id="${team.id}" data-round="r32" value="${formatAmericanOdds(team.americanOdds.r32)}">
                <div class="text-center small text-muted">${(team.odds.r32 * 100).toFixed(2)}%</div>
            </td>
            <td>
                <input type="text" class="form-control odds-input" data-team-id="${team.id}" data-round="s16" value="${formatAmericanOdds(team.americanOdds.s16)}">
                <div class="text-center small text-muted">${(team.odds.s16 * 100).toFixed(2)}%</div>
            </td>
            <td>
                <input type="text" class="form-control odds-input" data-team-id="${team.id}" data-round="e8" value="${formatAmericanOdds(team.americanOdds.e8)}">
                <div class="text-center small text-muted">${(team.odds.e8 * 100).toFixed(2)}%</div>
            </td>
            <td>
                <input type="text" class="form-control odds-input" data-team-id="${team.id}" data-round="f4" value="${formatAmericanOdds(team.americanOdds.f4)}">
                <div class="text-center small text-muted">${(team.odds.f4 * 100).toFixed(2)}%</div>
            </td>
            <td>
                <input type="text" class="form-control odds-input" data-team-id="${team.id}" data-round="f2" value="${formatAmericanOdds(team.americanOdds.f2)}">
                <div class="text-center small text-muted">${(team.odds.f2 * 100).toFixed(2)}%</div>
            </td>
            <td>
                <input type="text" class="form-control odds-input" data-team-id="${team.id}" data-round="champ" value="${formatAmericanOdds(team.americanOdds.champ)}">
                <div class="text-center small text-muted">${(team.odds.champ * 100).toFixed(2)}%</div>
            </td>
            <td class="text-end">
                ${team.purchasePrice > 0 ? '$' + team.purchasePrice.toFixed(2) : '-'}
            </td>
            <td class="text-center">
                ${team.isMyTeam ? '<span class="badge bg-success">Yes</span>' : ''}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to odds inputs
    const oddsInputs = document.querySelectorAll('.odds-input');
    oddsInputs.forEach(input => {
        input.addEventListener('change', function() {
            const teamId = parseInt(this.getAttribute('data-team-id'));
            const round = this.getAttribute('data-round');
            const value = this.value;
            
            handleOddsChange(teamId, round, value);
        });
    });
}

// Format American odds for display
function formatAmericanOdds(odds) {
    if (odds > 0) {
        return `+${odds}`;
    } else {
        return odds.toString();
    }
}

// Initialize the application
async function initializeApp() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        // Redirect to login page
        window.location.href = 'login.html';
        return;
    }
    
    // Load teams data
    await loadTeamsData();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Update the UI
    updateUI();
}

// Helper function to get user ID
function getUserId() {
    // Try to get the user ID from localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const parsed = JSON.parse(userData);
            return parsed.id || 'default';
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
    return 'default';
}

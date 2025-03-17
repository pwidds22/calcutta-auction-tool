// Calcutta Auction Tool JavaScript

// Global variables
let auctionTeams = [];
let payoutRules = null;  // Initialize as null, will be loaded per user
let estimatedPotSize = null;  // Initialize as null, will be loaded per user
let projectedPotSize = 0;
let myTeams = [];
let opponentsTeams = [];
let availableTeams = [];
let showProfits = false;
let profitColumns = [];
let currentPage = 1;
let teamsPerPage = 20;
let totalPages = 0;
let auctionFilteredTeams = [];
let auctionRegionFilter = 'All';
let currentStatusFilter = 'All';
let auctionSearchTerm = '';
let auctionSortOption = 'seed';
let auctionSortDirection = 'asc';
let potSize = null;  // Initialize as null, will be loaded per user
let profitCache = {};
let isLoading = false;

// Base teams data - this is constant and should not change
const AUCTION_BASE_TEAMS = getDefaultTeams();

// Initialize teams
async function initializeTeams() {
    console.log('Initializing teams...');
    
    try {
        // First try to load from localStorage
        const savedTeams = await loadTeamsFromStorage();
        if (savedTeams && savedTeams.length > 0) {
            console.log('Found saved teams:', savedTeams.length);
            auctionTeams = savedTeams;
        } else {
            // If no saved teams, try to get from team-odds
            const teamOddsData = localStorage.getItem('teamOddsData');
            if (teamOddsData) {
                const parsedData = JSON.parse(teamOddsData);
                if (parsedData && parsedData.length > 0) {
                    console.log('Found team odds data:', parsedData.length);
                    auctionTeams = parsedData.map(team => ({
                        ...team,
                        purchasePrice: team.purchasePrice || 0,
                        isMyTeam: team.isMyTeam || false,
                        isOpponentTeam: false
                    }));
                    console.log('Teams initialized from team-odds data:', auctionTeams.length);
                } else {
                    console.log('No valid team odds data found, using default teams');
                    // Use default teams with converted odds
                    auctionTeams = getDefaultTeams().map(team => {
                        // Convert American odds to probabilities
                        const odds = {
                            r32: convertAmericanOddsToProbability(team.americanOdds.r32),
                            s16: convertAmericanOddsToProbability(team.americanOdds.s16),
                            e8: convertAmericanOddsToProbability(team.americanOdds.e8),
                            f4: convertAmericanOddsToProbability(team.americanOdds.f4),
                            f2: convertAmericanOddsToProbability(team.americanOdds.f2),
                            champ: convertAmericanOddsToProbability(team.americanOdds.champ)
                        };

                        // Use championship odds as the win percentage
                        const winPercentage = odds.champ;

                        return {
                            ...team,
                            purchasePrice: 0,
                            isMyTeam: false,
                            isOpponentTeam: false,
                            odds: odds,
                            winPercentage: winPercentage,
                            valuePercentage: winPercentage
                        };
                    });
                }
            } else {
                console.log('No team data found, using default teams');
                // Use default teams with converted odds
                auctionTeams = getDefaultTeams().map(team => {
                    // Convert American odds to probabilities
                    const odds = {
                        r32: convertAmericanOddsToProbability(team.americanOdds.r32),
                        s16: convertAmericanOddsToProbability(team.americanOdds.s16),
                        e8: convertAmericanOddsToProbability(team.americanOdds.e8),
                        f4: convertAmericanOddsToProbability(team.americanOdds.f4),
                        f2: convertAmericanOddsToProbability(team.americanOdds.f2),
                        champ: convertAmericanOddsToProbability(team.americanOdds.champ)
                    };

                    // Use championship odds as the win percentage
                    const winPercentage = odds.champ;

                    return {
                        ...team,
                        purchasePrice: 0,
                        isMyTeam: false,
                        isOpponentTeam: false,
                        odds: odds,
                        winPercentage: winPercentage,
                        valuePercentage: winPercentage
                    };
                });
            }
        }
        
        // Initialize other team arrays
        myTeams = auctionTeams.filter(team => team.isMyTeam);
        opponentsTeams = auctionTeams.filter(team => team.isOpponentTeam);
        availableTeams = auctionTeams.filter(team => !team.isMyTeam && !team.isOpponentTeam);
        
        // Load saved settings
        await loadSavedSettings();
        
        // Load projected pot size from localStorage
        const savedProjectedPotSize = localStorage.getItem('projectedPotSize');
        if (savedProjectedPotSize !== null) {
            projectedPotSize = parseFloat(savedProjectedPotSize);
            // Update the display
            const projectedPotSizeInput = document.getElementById('projectedPotSize');
            if (projectedPotSizeInput) {
                projectedPotSizeInput.value = projectedPotSize.toFixed(2);
            }
        }
        
        // Calculate projected pot size based on current purchases
        calculateProjectedPotSize();
        
        // Calculate initial values using the correct pot size
        calculateTeamValues();
        
        // Update UI
        updateUI();
        
        console.log('Teams loaded:', auctionTeams.length);
        console.log('Using pot size for calculations:', (projectedPotSize > 0 ? projectedPotSize : estimatedPotSize));
    } catch (error) {
        console.error('Error loading team odds data:', error);
    }
}

// Save teams data to localStorage and server
async function saveTeamsToStorage() {
    try {
        // Create a copy of teams with ALL necessary data
        const teamsToSave = auctionTeams.map(team => ({
            id: team.id,
            name: team.name,           // Include base team info
            seed: team.seed,          // Include base team info
            region: team.region,      // Include base team info
            americanOdds: team.americanOdds,
            odds: team.odds,
            winPercentage: team.winPercentage,
            valuePercentage: team.valuePercentage,
            purchasePrice: team.purchasePrice || 0,
            isMyTeam: team.isMyTeam || false
        }));
        
        // Save to localStorage as a fallback
        localStorage.setItem('calcuttaTeams', JSON.stringify(teamsToSave));
        localStorage.setItem('teamOddsData', JSON.stringify(teamsToSave)); // Also save to teamOddsData
        console.log('Teams saved to localStorage');
        
        // Save to server if logged in
        if (isLoggedIn()) {
            const userData = {
                teams: teamsToSave,
                payoutRules: payoutRules,
                estimatedPotSize: estimatedPotSize
            };
            
            const success = await saveUserData(userData);
            if (success) {
                console.log('Teams saved to server');
            } else {
                console.error('Failed to save teams to server');
            }
        }
    } catch (error) {
        console.error('Error saving teams:', error);
    }
}

// Load teams data from localStorage or server
async function loadTeamsFromStorage() {
    try {
        // Try to load from server first if logged in
        if (isLoggedIn()) {
            const userData = await loadUserData();
            
            if (userData && userData.teams && userData.teams.length > 0) {
                console.log('Teams loaded from server');
                
                // Also update payout rules and pot size
                if (userData.payoutRules) {
                    payoutRules = userData.payoutRules;
                }
                
                if (userData.estimatedPotSize) {
                    estimatedPotSize = userData.estimatedPotSize;
                }
                
                return userData.teams;
            }
        }
        
        // Fallback to localStorage
        const savedTeams = localStorage.getItem('calcuttaTeams');
        if (savedTeams) {
            console.log('Found saved teams in localStorage');
            return JSON.parse(savedTeams);
        }
        
        console.log('No saved teams found');
        return null;
    } catch (error) {
        console.error('Error loading teams:', error);
        return null;
    }
}

// Initialize the application
async function initializeApp() {
    console.log('Initializing application...');
    
    try {
        // Initialize teams first
        await initializeTeams();
        
        // Initialize event listeners
        initializeEventListeners();
        
        // Update payout rules
        updatePayoutRules();
        
        // Sync with team odds if available
        syncWithTeamOdds();
        
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}

// Initialize event listeners
function initializeEventListeners() {
    try {
        console.log('Initializing event listeners');
        
        // Save settings button
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', saveSettings);
            console.log('Added event listener to saveSettingsBtn');
        }
        
        // Reset auction button
        const resetAuctionBtn = document.getElementById('resetAuctionBtn');
        if (resetAuctionBtn) {
            resetAuctionBtn.addEventListener('click', resetAuction);
            console.log('Added event listener to resetAuctionBtn');
        }
        
        // Sync team odds button
        const syncTeamOddsButton = document.getElementById('syncTeamOdds');
        if (syncTeamOddsButton) {
            syncTeamOddsButton.addEventListener('click', function() {
                syncWithTeamOdds();
                alert('Teams synced with latest odds data!');
            });
            console.log('Added event listener to sync team odds button');
        }
        
        // Payout rule inputs
        const payoutRuleInputs = document.querySelectorAll('.payout-rule-input, #roundOf64, #roundOf32, #sweet16, #elite8, #finalFour, #champion, #biggestUpset, #highestSeed, #largestMargin, #customProp');
        payoutRuleInputs.forEach(input => {
            if (input) {
                input.addEventListener('change', updatePayoutRules);
                console.log(`Added event listener to ${input.id || 'payout rule input'}`);
            }
        });
        
        // Pot size input
        const estimatedPotSizeInput = document.getElementById('estimatedPotSize');
        if (estimatedPotSizeInput) {
            estimatedPotSizeInput.addEventListener('change', function() {
                estimatedPotSize = parseFloat(this.value) || 10000;
                potSize = estimatedPotSize;
                
                // Save settings when pot size changes
                saveSettings();
                
                // Reset the profit cache when pot size changes
                resetProfitCache();
                
                calculateProjectedPotSize();
                updateTeamTable();
            });
            console.log('Added event listener to estimatedPotSize');
        }
        
        // Filter and search controls
        const regionFilter = document.getElementById('regionFilter');
        if (regionFilter) {
            regionFilter.addEventListener('change', function() {
                auctionRegionFilter = this.value;
                updateTeamTable();
            });
            console.log('Added event listener to regionFilter');
        }
        
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                currentStatusFilter = this.value;
                updateTeamTable();
            });
            console.log('Added event listener to statusFilter');
        }
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                auctionSearchTerm = this.value.toLowerCase();
                updateTeamTable();
            });
            console.log('Added event listener to searchInput');
        }
        
        // Sort controls
        const sortOption = document.getElementById('sortOption');
        if (sortOption) {
            sortOption.addEventListener('change', function() {
                auctionSortOption = this.value;
                updateTeamTable();
            });
            console.log('Added event listener to sortOption');
        }
        
        // Sort direction
        const sortDirectionBtn = document.getElementById('sortDirection');
        if (sortDirectionBtn) {
            sortDirectionBtn.addEventListener('click', function() {
                console.log('Sort direction button clicked');
                console.log('Current sort direction:', auctionSortDirection);
                
                // Toggle sort direction
                auctionSortDirection = auctionSortDirection === 'asc' ? 'desc' : 'asc';
                console.log('New sort direction:', auctionSortDirection);
                
                // Update the sort icon
                const sortIcon = document.getElementById('sortIcon');
                if (sortIcon) {
                    console.log('Updating sort icon');
                    sortIcon.className = 'fas fa-sort-' + (auctionSortDirection === 'asc' ? 'up' : 'down');
                    console.log('New sort icon class:', sortIcon.className);
                } else {
                    console.error('Sort icon element not found');
                }
                
                // Update the team table
                console.log('Calling updateTeamTable()');
                updateTeamTable();
            });
            console.log('Added event listener to sort direction button');
        } else {
            console.error('Sort direction button not found in DOM');
        }
        
        console.log('Event listeners initialized successfully');
    } catch (error) {
        console.error('Error initializing event listeners:', error);
    }
}

// Reset auction
function resetAuction() {
    if (confirm('Are you sure you want to reset the auction? This will clear all purchase prices and team selections.')) {
        auctionTeams.forEach(team => {
            team.purchasePrice = 0;
            team.isMyTeam = false;
        });
        
        // Update team categories
        updateTeamCategories();
        
        // Update projected pot size
        calculateProjectedPotSize();
        
        // Update auction results tracker
        updateAuctionResultsTracker();
        
        // Update team table
        updateTeamTable();
        
        // Save the reset teams to localStorage
        saveTeamsToStorage();
        
        // Sync with team odds to ensure we have the latest data
        syncWithTeamOdds();
        
        alert('Auction has been reset.');
    }
}

// Reset the profit cache
function resetProfitCache() {
    console.log('Resetting profit cache');
    profitCache = {};
}

// Update payout rules
function updatePayoutRules() {
    // Get all payout values and convert to numbers, defaulting to 0 if invalid
    payoutRules.roundOf64 = parseFloat(document.getElementById('roundOf64').value) || 0;
    payoutRules.roundOf32 = parseFloat(document.getElementById('roundOf32').value) || 0;
    payoutRules.sweet16 = parseFloat(document.getElementById('sweet16').value) || 0;
    payoutRules.elite8 = parseFloat(document.getElementById('elite8').value) || 0;
    payoutRules.finalFour = parseFloat(document.getElementById('finalFour').value) || 0;
    payoutRules.champion = parseFloat(document.getElementById('champion').value) || 0;
    payoutRules.biggestUpset = parseFloat(document.getElementById('biggestUpset').value) || 0;
    payoutRules.highestSeed = parseFloat(document.getElementById('highestSeed').value) || 0;
    payoutRules.largestMargin = parseFloat(document.getElementById('largestMargin').value) || 0;
    payoutRules.customProp = parseFloat(document.getElementById('customProp').value) || 0;
    
    // Calculate round totals
    const r64total = payoutRules.roundOf64 * 32;
    const r32total = payoutRules.roundOf32 * 16;
    const s16total = payoutRules.sweet16 * 8;
    const e8total = payoutRules.elite8 * 4;
    const f4total = payoutRules.finalFour * 2;
    const champtotal = payoutRules.champion * 1;
    
    // Update the round total displays
    document.getElementById('r64total').textContent = r64total.toFixed(2);
    document.getElementById('r32total').textContent = r32total.toFixed(2);
    document.getElementById('s16total').textContent = s16total.toFixed(2);
    document.getElementById('e8total').textContent = e8total.toFixed(2);
    document.getElementById('f4total').textContent = f4total.toFixed(2);
    document.getElementById('champtotal').textContent = champtotal.toFixed(2);
    
    // Calculate total payout percentage
    const roundPayouts = r64total + r32total + s16total + e8total + f4total + champtotal;
    
    // Add special category payouts
    const specialPayouts = (
        payoutRules.biggestUpset +
        payoutRules.highestSeed +
        payoutRules.largestMargin +
        payoutRules.customProp
    );
    
    const totalPayout = roundPayouts + specialPayouts;
    
    // Update validation display
    const validationDiv = document.getElementById('totalPayoutValidation');
    const totalSpan = document.getElementById('totalPayoutPercentage');
    const messageSpan = document.getElementById('totalPayoutMessage');
    
    if (validationDiv && totalSpan && messageSpan) {
        totalSpan.textContent = totalPayout.toFixed(2);
        validationDiv.style.display = 'block';
        
        if (Math.abs(totalPayout - 100) < 0.01) {  // Account for floating point precision
            validationDiv.className = 'alert alert-success';
            messageSpan.textContent = ' - Perfect!';
        } else if (totalPayout > 100) {
            validationDiv.className = 'alert alert-danger';
            messageSpan.textContent = ' - Total must equal 100%';
        } else {
            validationDiv.className = 'alert alert-warning';
            messageSpan.textContent = ' - Total must equal 100%';
        }
    }
    
    // Reset the profit cache when payout rules change
    resetProfitCache();
    
    // Recalculate team values based on new payout rules
    calculateTeamValues();
    
    // Update the UI
    updateUI();
}

// Update pot size
function updatePotSize() {
    estimatedPotSize = parseFloat(document.getElementById('estimatedPotSize').value) || 0;
    
    // Update the UI
    updateUI();
}

// Save settings
async function saveSettings() {
    try {
        // Update payout rules
        updatePayoutRules();
        
        // Update pot size
        updatePotSize();
        
        // Save to localStorage
        const settings = {
            payoutRules,
            estimatedPotSize
        };
        localStorage.setItem('calcuttaSettings', JSON.stringify(settings));
        
        // Save to server if logged in
        if (isLoggedIn()) {
            const userData = {
                teams: auctionTeams,
                payoutRules: payoutRules,
                estimatedPotSize: estimatedPotSize
            };
            
            const success = await saveUserData(userData);
            if (success) {
                console.log('Settings saved to server');
            } else {
                console.error('Failed to save settings to server');
            }
        }
        
        // Recalculate team values
        calculateTeamValues();
        
        // Update UI
        updateUI();
        
        console.log('Settings saved');
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Load saved settings
async function loadSavedSettings() {
    // Set default values first
    payoutRules = {
        roundOf64: 0.50,
        roundOf32: 1.00,
        sweet16: 2.50,
        elite8: 4.00,
        finalFour: 8.00,
        champion: 16.00,
        biggestUpset: 0.00,
        highestSeed: 0.00,
        largestMargin: 0.00,
        customProp: 0.00
    };
    estimatedPotSize = 10000;
    potSize = 10000;
    
    // Try to load from server first if logged in
    if (isLoggedIn()) {
        try {
            const userData = await loadUserData();
            if (userData && userData.payoutRules) {
                payoutRules = userData.payoutRules;
                // Update UI with user's specific payout rules
                Object.keys(payoutRules).forEach(rule => {
                    const input = document.getElementById(rule);
                    if (input) {
                        input.value = payoutRules[rule];
                    }
                });
            }
            if (userData && userData.estimatedPotSize) {
                estimatedPotSize = userData.estimatedPotSize;
                potSize = estimatedPotSize;
                document.getElementById('estimatedPotSize').value = estimatedPotSize;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            // Fall back to localStorage only if server load fails
            loadFromLocalStorage();
        }
    } else {
        loadFromLocalStorage();
    }
    
    // Ensure special categories are set to 0 in the UI
    const specialCategories = ['biggestUpset', 'highestSeed', 'largestMargin', 'customProp'];
    specialCategories.forEach(category => {
        const input = document.getElementById(category);
        if (input) {
            input.value = '0';
            payoutRules[category] = 0;
        }
    });
    
    // Update payout rules to reflect changes
    updatePayoutRules();
}

function loadFromLocalStorage() {
    const savedSettings = localStorage.getItem('calcuttaSettings');
    if (savedSettings) {
        try {
            const settings = JSON.parse(savedSettings);
            if (settings.payoutRules) {
                payoutRules = settings.payoutRules;
                // Update UI with saved payout rules
                Object.keys(payoutRules).forEach(rule => {
                    const input = document.getElementById(rule);
                    if (input) {
                        input.value = payoutRules[rule];
                    }
                });
            }
            
            if (settings.estimatedPotSize) {
                estimatedPotSize = settings.estimatedPotSize;
                potSize = estimatedPotSize;
                document.getElementById('estimatedPotSize').value = estimatedPotSize;
            }
        } catch (error) {
            console.error('Error parsing saved settings:', error);
        }
    }
}

// Calculate team values based on payout rules and odds
function calculateTeamValues() {
    console.log('Calculating team values');
    
    try {
        // Always use projected pot size if available, fall back to estimated pot size
        const potSize = (projectedPotSize > 0 ? projectedPotSize : estimatedPotSize);
        console.log('Using pot size for value calculations:', potSize);
        
        // Calculate team values based on win percentages
        auctionTeams.forEach(team => {
            team.valuePercentage = team.winPercentage;
        });
        
        // Normalize value percentages to ensure they sum to 1
        const totalValuePercentage = auctionTeams.reduce((sum, team) => sum + team.valuePercentage, 0);
        
        if (totalValuePercentage > 0) {
            auctionTeams.forEach(team => {
                team.valuePercentage = team.valuePercentage / totalValuePercentage;
            });
        }
        
        console.log('Team values calculated successfully');
    } catch (error) {
        console.error('Error calculating team values:', error);
    }
}

// Update team categories
function updateTeamCategories() {
    console.log('Updating team categories');
    
    try {
        // Reset team categories
        myTeams = auctionTeams.filter(team => team.isMyTeam);
        opponentsTeams = auctionTeams.filter(team => team.purchasePrice > 0 && !team.isMyTeam);
        availableTeams = auctionTeams.filter(team => team.purchasePrice === 0);
        
        // Update category counts
        document.getElementById('myTeamsCount').textContent = myTeams.length;
        document.getElementById('opponentsTeamsCount').textContent = opponentsTeams.length;
        document.getElementById('availableTeamsCount').textContent = availableTeams.length;
        
        // Update summary statistics
        updateSummaryStatistics();
        
        console.log('Team categories updated successfully');
        console.log(`My teams: ${myTeams.length}, Opponents teams: ${opponentsTeams.length}, Available teams: ${availableTeams.length}`);
    } catch (error) {
        console.error('Error updating team categories:', error);
    }
}

// Calculate projected pot size based on purchases
function calculateProjectedPotSize() {
    const purchasedTeams = auctionTeams.filter(team => team.purchasePrice > 0);
    
    if (purchasedTeams.length === 0) {
        projectedPotSize = 0;
        resetProfitCache(); // Reset cache when projected pot size changes
        localStorage.setItem('projectedPotSize', '0');
        return;
    }
    
    let totalPaid = 0;
    let totalValuePercentage = 0;
    
    purchasedTeams.forEach(team => {
        totalPaid += team.purchasePrice;
        totalValuePercentage += team.valuePercentage;
    });
    
    const oldProjectedPotSize = projectedPotSize;
    
    if (totalValuePercentage > 0) {
        projectedPotSize = totalPaid / totalValuePercentage;
    } else {
        projectedPotSize = 0;
    }
    
    // Save projected pot size to localStorage
    localStorage.setItem('projectedPotSize', projectedPotSize.toString());
    console.log('Calculated projected pot size:', projectedPotSize);
    
    // Update the display
    const projectedPotSizeInput = document.getElementById('projectedPotSize');
    if (projectedPotSizeInput) {
        projectedPotSizeInput.value = projectedPotSize.toFixed(2);
    }
    
    // Reset cache if projected pot size has changed
    if (oldProjectedPotSize !== projectedPotSize) {
        resetProfitCache();
    }
}

// Update the UI
function updateUI() {
    const tableBody = document.getElementById('teamTableBody');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    
    if (!tableBody) return;
    
    // Show/hide loading indicator
    if (loadingIndicator) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }
    
    // Clear error message when not loading
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
    
    if (isLoading) {
        tableBody.innerHTML = '<tr><td colspan="100%" class="text-center">Loading teams...</td></tr>';
        return;
    }
    
    if (auctionTeams.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="100%" class="text-center p-5">
                    <p class="mb-4">No teams loaded yet</p>
                    <button onclick="fetchLatestOdds()" class="btn btn-primary btn-lg">
                        <i class="fas fa-sync-alt me-2"></i>Fetch Teams & Latest Odds
                    </button>
                </td>
            </tr>`;
        return;
    }
    
    // Filter and sort teams
    filterTeams();
    sortTeams();
    
    // Update pagination
    updatePagination();
    
    // Update summary statistics
    updateSummaryStatistics();
    
    // Update auction results tracker
    updateAuctionResultsTracker();
    
    // Update table headers
    updateTableHeaders();
    
    // Update team table
    updateTeamTable();
}

// Update summary statistics
function updateSummaryStatistics() {
    console.log('Updating summary statistics');
    
    try {
        // Calculate total pot size
        const potSize = (projectedPotSize > 0 ? projectedPotSize : estimatedPotSize);
        
        // Update projected pot size display
        document.getElementById('projectedPotSize').value = projectedPotSize.toFixed(2);
        
        // Calculate and update my teams statistics
        const myTeamsTotalPaid = myTeams.reduce((sum, team) => sum + team.purchasePrice, 0);
        const myTeamsProjectedValue = myTeams.reduce((sum, team) => sum + (team.valuePercentage * potSize), 0);
        const myTeamsExpectedProfit = myTeamsProjectedValue - myTeamsTotalPaid;
        const myTeamsROI = myTeamsTotalPaid > 0 ? (myTeamsExpectedProfit / myTeamsTotalPaid * 100) : 0;
        
        document.getElementById('myTeamsTotalPaid').textContent = myTeamsTotalPaid.toFixed(2);
        document.getElementById('myTeamsProjectedValue').textContent = myTeamsProjectedValue.toFixed(2);
        document.getElementById('myTeamsExpectedProfit').textContent = myTeamsExpectedProfit.toFixed(2);
        document.getElementById('myTeamsROI').textContent = myTeamsROI.toFixed(2);
        
        // Calculate and update opponents' teams statistics
        const opponentsTeamsTotalPaid = opponentsTeams.reduce((sum, team) => sum + team.purchasePrice, 0);
        const opponentsTeamsProjectedValue = opponentsTeams.reduce((sum, team) => sum + (team.valuePercentage * potSize), 0);
        const opponentsTeamsExpectedProfit = opponentsTeamsProjectedValue - opponentsTeamsTotalPaid;
        const opponentsTeamsROI = opponentsTeamsTotalPaid > 0 ? (opponentsTeamsExpectedProfit / opponentsTeamsTotalPaid * 100) : 0;
        
        document.getElementById('opponentsTeamsTotalPaid').textContent = opponentsTeamsTotalPaid.toFixed(2);
        document.getElementById('opponentsTeamsProjectedValue').textContent = opponentsTeamsProjectedValue.toFixed(2);
        document.getElementById('opponentsTeamsExpectedProfit').textContent = opponentsTeamsExpectedProfit.toFixed(2);
        document.getElementById('opponentsTeamsROI').textContent = opponentsTeamsROI.toFixed(2);
        
        // Calculate and update available teams statistics
        const availableTeamsProjectedValue = availableTeams.reduce((sum, team) => sum + (team.valuePercentage * potSize), 0);
        document.getElementById('availableTeamsProjectedValue').textContent = availableTeamsProjectedValue.toFixed(2);
        
        console.log('Summary statistics updated successfully');
    } catch (error) {
        console.error('Error updating summary statistics:', error);
    }
}

// Update table headers based on showProfits setting
function updateTableHeaders() {
    // Always ensure showProfits is true
    showProfits = true;
    
    console.log('Updating table headers, showProfits:', showProfits);
    
    const table = document.querySelector('#teamTableBody').closest('table');
    if (!table) return;
    
    // Always ensure the table has the show-profits class
    table.classList.add('show-profits');
    
    // Check if thead exists, if not create it
    let thead = table.querySelector('thead');
    if (!thead) {
        thead = document.createElement('thead');
        table.prepend(thead);
    }
    
    // Create two header rows - one for merged headers and one for column names
    let mergedHeaderRow = thead.querySelector('tr:first-child');
    let columnHeaderRow = thead.querySelector('tr:last-child');
    
    // Clear existing headers
    thead.innerHTML = '';
    
    // Create merged header row
    mergedHeaderRow = document.createElement('tr');
    columnHeaderRow = document.createElement('tr');
    thead.appendChild(mergedHeaderRow);
    thead.appendChild(columnHeaderRow);
    
    // Add merged cells for standard headers
    const standardMergedCell = document.createElement('th');
    standardMergedCell.colSpan = 3; // Spans Region, Seed, Team
    standardMergedCell.textContent = 'Team Info';
    mergedHeaderRow.appendChild(standardMergedCell);
    
    // Add merged cell for profit columns
    const profitMergedCell = document.createElement('th');
    profitMergedCell.colSpan = 6; // Spans all profit columns
    profitMergedCell.textContent = 'Total Profit After Reaching Round';
    profitMergedCell.classList.add('text-center', 'bg-light');
    mergedHeaderRow.appendChild(profitMergedCell);
    
    // Add merged cells for remaining headers
    const valueMergedCell = document.createElement('th');
    valueMergedCell.colSpan = 3; // Spans Sugg. Bid, Fair Value, Price
    valueMergedCell.textContent = 'Value Info';
    mergedHeaderRow.appendChild(valueMergedCell);
    
    const myTeamMergedCell = document.createElement('th');
    myTeamMergedCell.rowSpan = 2; // Spans both rows
    myTeamMergedCell.textContent = 'My Team';
    myTeamMergedCell.classList.add('bg-white'); // Add white background
    mergedHeaderRow.appendChild(myTeamMergedCell);
    
    // Add standard column headers
    const standardHeaders = ['Region', 'Seed', 'Team'];
    standardHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        columnHeaderRow.appendChild(th);
    });
    
    // Add profit column headers with shorter names
    const profitHeaders = ['R32', 'S16', 'E8', 'F4', 'F2', 'Champ'];
    profitHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.classList.add('profit-projection');
        columnHeaderRow.appendChild(th);
    });
    
    // Add remaining column headers
    const remainingHeaders = ['Sugg. Bid', 'Fair Value', 'Price'];
    remainingHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        columnHeaderRow.appendChild(th);
    });
}

// Update team table
function updateTeamTable() {
    // Always ensure showProfits is true
    showProfits = true;
    
    // Get the table body
    const tableBody = document.getElementById('teamTableBody');
    if (!tableBody) {
        console.error('Team table body not found');
        return;
    }
    
    // Always ensure the table has the show-profits class
    const table = tableBody.closest('table');
    if (table) {
        table.classList.add('show-profits');
        console.log('Table classes:', table.className);
    } else {
        console.error('Table not found');
    }
    
    console.log('Updating team table, showProfits:', showProfits);
    console.log('Teams count:', auctionTeams.length);
    
    // Apply filters and sorting BEFORE clearing the table
    filterTeams();
    sortTeams();
    
    // Update table headers based on showProfits setting
    updateTableHeaders();
    
    // Clear the table body AFTER filtering and sorting
    tableBody.innerHTML = '';
    
    // If no teams after filtering, show a message
    if (auctionFilteredTeams.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 13; // Updated colspan to include profit columns
        cell.textContent = 'No teams match the current filters';
        cell.className = 'text-center';
        row.appendChild(cell);
        tableBody.appendChild(row);
        return;
    }
    
    console.log('Filtered teams count:', auctionFilteredTeams.length);
    
    // Create a fresh copy of the filtered teams for display
    const teamsToDisplay = [...auctionFilteredTeams];
    
    // Add each team to the table
    teamsToDisplay.forEach(team => {
        const row = document.createElement('tr');
        
        // Add region, seed, and team name
        const regionCell = document.createElement('td');
        regionCell.textContent = team.region;
        regionCell.setAttribute('data-column', 'region');
        row.appendChild(regionCell);
        
        const seedCell = document.createElement('td');
        seedCell.textContent = team.seed;
        seedCell.setAttribute('data-column', 'seed');
        row.appendChild(seedCell);
        
        const nameCell = document.createElement('td');
        nameCell.textContent = team.name;
        nameCell.setAttribute('data-column', 'name');
        row.appendChild(nameCell);
        
        // Always add profit projections (removed conditional)
        // Calculate profit projections
        const profits = calculateRoundProfits(team);
        console.log(`Profit projections for ${team.name}:`, profits);
        
        // Add profit cells for each round
        const profitRounds = ['r32', 's16', 'e8', 'f4', 'f2', 'champ'];
        profitRounds.forEach(round => {
            const profitCell = document.createElement('td');
            profitCell.setAttribute('data-column', round);
            const profitValue = profits[round];
            
            // Create a div for the profit value
            const profitDiv = document.createElement('div');
            profitDiv.textContent = formatCurrency(profitValue);
            profitDiv.classList.add('profit-projection');
            if (profitValue > 0) {
                profitDiv.classList.add('positive-value');
            } else if (profitValue < 0) {
                profitDiv.classList.add('negative-value');
            }
            
            // Create a div for the probability
            const probabilityDiv = document.createElement('div');
            probabilityDiv.className = 'text-center small text-muted';
            probabilityDiv.textContent = `${(team.odds[round] * 100).toFixed(2)}%`;
            
            // Add both divs to the cell
            profitCell.appendChild(profitDiv);
            profitCell.appendChild(probabilityDiv);
            profitCell.classList.add('profit-projection');
            
            row.appendChild(profitCell);
            console.log(`Added profit cell for ${team.name} ${round}: ${formatCurrency(profitValue)} (${(team.odds[round] * 100).toFixed(2)}%)`);
        });
        
        // Add suggested bid, fair value, and purchase price
        const suggestedBidCell = document.createElement('td');
        suggestedBidCell.textContent = formatCurrency(calculateSuggestedBid(team));
        suggestedBidCell.setAttribute('data-column', 'suggBid');
        row.appendChild(suggestedBidCell);
        
        const fairValueCell = document.createElement('td');
        fairValueCell.textContent = formatCurrency(calculateFairValue(team));
        fairValueCell.setAttribute('data-column', 'fairValue');
        row.appendChild(fairValueCell);
        
        const purchasePriceCell = document.createElement('td');
        purchasePriceCell.setAttribute('data-column', 'price');
        const purchasePriceInput = document.createElement('input');
        purchasePriceInput.type = 'number';
        purchasePriceInput.min = '0';
        purchasePriceInput.step = '1';
        purchasePriceInput.value = team.purchasePrice || '';
        purchasePriceInput.className = 'form-control purchase-price-input';
        purchasePriceInput.dataset.teamId = team.id;
        
        // Add multiple event listeners to maintain focus behavior
        purchasePriceInput.addEventListener('change', function() {
            updateTeamPurchasePrice(team.id, parseFloat(this.value) || 0);
        });
        
        // Handle blur event (when input loses focus)
        purchasePriceInput.addEventListener('blur', function() {
            updateTeamPurchasePrice(team.id, parseFloat(this.value) || 0);
        });
        
        // Handle keydown event for tab key
        purchasePriceInput.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                updateTeamPurchasePrice(team.id, parseFloat(this.value) || 0);
            }
        });
        
        purchasePriceCell.appendChild(purchasePriceInput);
        row.appendChild(purchasePriceCell);
        
        // Add "My Team" checkbox
        const myTeamCell = document.createElement('td');
        const myTeamCheckbox = document.createElement('input');
        myTeamCheckbox.type = 'checkbox';
        myTeamCheckbox.className = 'form-check-input team-checkbox';
        myTeamCheckbox.checked = team.isMyTeam || false;
        myTeamCheckbox.dataset.teamId = team.id;
        myTeamCheckbox.addEventListener('change', function() {
            updateMyTeam(team.id, this.checked);
        });
        myTeamCell.appendChild(myTeamCheckbox);
        row.appendChild(myTeamCell);
        
        // Add the row to the table
        tableBody.appendChild(row);
    });
    
    // Hide pagination controls since we're showing all teams
    const paginationContainer = document.getElementById('pagination');
    if (paginationContainer) {
        paginationContainer.innerHTML = '';
    }
}

// Update auction results tracker
function updateAuctionResultsTracker() {
    console.log('Updating auction results tracker');
    
    // Get the auction results table body
    const auctionResultsBody = document.getElementById('auctionResultsBody');
    if (!auctionResultsBody) {
        console.error('Auction results body not found');
        return;
    }
    
    // Clear the table body
    auctionResultsBody.innerHTML = '';
    
    // Filter teams that have been purchased
    const purchasedTeams = auctionTeams.filter(team => team.purchasePrice > 0);
    
    console.log('Purchased teams count:', purchasedTeams.length);
    
    // Sort purchased teams by purchase price (descending)
    const sortedPurchasedTeams = [...purchasedTeams].sort((a, b) => b.purchasePrice - a.purchasePrice);
    
    // Add each purchased team to the table
    sortedPurchasedTeams.forEach(team => {
        const row = document.createElement('tr');
        
        // Add team name
        const nameCell = document.createElement('td');
        nameCell.textContent = team.name;
        row.appendChild(nameCell);
        
        // Add region
        const regionCell = document.createElement('td');
        regionCell.textContent = team.region;
        row.appendChild(regionCell);
        
        // Add seed
        const seedCell = document.createElement('td');
        seedCell.textContent = team.seed;
        row.appendChild(seedCell);
        
        // Add purchase price
        const priceCell = document.createElement('td');
        priceCell.textContent = formatCurrency(team.purchasePrice);
        row.appendChild(priceCell);
        
        // Add owner (My Team or not)
        const ownerCell = document.createElement('td');
        ownerCell.textContent = team.isMyTeam ? 'Me' : 'Opponent';
        row.appendChild(ownerCell);
        
        // Add the row to the table
        auctionResultsBody.appendChild(row);
    });
    
    // Update summary statistics
    updateSummaryStatistics();
}

// Calculate profit projections for each round (cumulative)
function calculateRoundProfits(team) {
    console.log('Calculating round profits for team:', team.name);
    
    // Use estimated pot size if projected pot size is not available
    const potSize = (projectedPotSize > 0) ? projectedPotSize : estimatedPotSize;
    console.log('Using pot size:', potSize);
    
    // Get the purchase price (default to 0 if not set)
    const purchasePrice = parseFloat(team.purchasePrice) || 0;
    console.log('Purchase price:', purchasePrice);
    
    // Check if we already have calculated profits for this purchase price
    const cacheKey = purchasePrice.toString();
    if (profitCache[cacheKey]) {
        console.log('Using cached profits for purchase price:', purchasePrice);
        return profitCache[cacheKey];
    }
    
    // Calculate individual round payouts based on payout rules
    // These are fixed percentages of the pot size
    const roundPayouts = {
        r32: potSize * (payoutRules.roundOf64 / 100),  // Payout for making R32 (winning R64)
        s16: potSize * (payoutRules.roundOf32 / 100),  // Payout for making S16 (winning R32)
        e8: potSize * (payoutRules.sweet16 / 100),     // Payout for making E8 (winning S16)
        f4: potSize * (payoutRules.elite8 / 100),      // Payout for making F4 (winning E8)
        f2: potSize * (payoutRules.finalFour / 100),   // Payout for making championship (winning F4)
        champ: potSize * (payoutRules.champion / 100)  // Payout for winning championship
    };
    
    console.log('Round payouts:', roundPayouts);
    
    // Calculate cumulative payouts (sum of all payouts up to and including that round)
    const cumulativePayouts = {
        r32: roundPayouts.r32,
        s16: roundPayouts.r32 + roundPayouts.s16,
        e8: roundPayouts.r32 + roundPayouts.s16 + roundPayouts.e8,
        f4: roundPayouts.r32 + roundPayouts.s16 + roundPayouts.e8 + roundPayouts.f4,
        f2: roundPayouts.r32 + roundPayouts.s16 + roundPayouts.e8 + roundPayouts.f4 + roundPayouts.f2,
        champ: roundPayouts.r32 + roundPayouts.s16 + roundPayouts.e8 + roundPayouts.f4 + roundPayouts.f2 + roundPayouts.champ
    };
    
    console.log('Cumulative payouts:', cumulativePayouts);
    
    // Calculate profits for each round (cumulative payout minus purchase price)
    const profits = {
        r32: cumulativePayouts.r32 - purchasePrice,    // Profit if make R32
        s16: cumulativePayouts.s16 - purchasePrice,    // Profit if make S16
        e8: cumulativePayouts.e8 - purchasePrice,      // Profit if make E8
        f4: cumulativePayouts.f4 - purchasePrice,      // Profit if make F4
        f2: cumulativePayouts.f2 - purchasePrice,      // Profit if make championship game
        champ: cumulativePayouts.champ - purchasePrice // Profit if win championship
    };
    
    console.log('Profits:', profits);
    
    // Cache the profits for this purchase price
    profitCache[cacheKey] = profits;
    
    return profits;
}

// Calculate suggested bid for a team
function calculateSuggestedBid(team) {
    const potSize = (projectedPotSize > 0 ? projectedPotSize : estimatedPotSize);
    const teamValue = team.valuePercentage * potSize;
    
    // Suggested bid is slightly below the expected value (90-95% of value)
    // This ensures some potential profit for the buyer
    const bidFactor = 0.95;
    return teamValue * bidFactor;
}

// Helper function to format currency
function formatCurrency(value) {
    return '$' + parseFloat(value).toFixed(2);
}

// Update team purchase price
function updateTeamPurchasePrice(teamId, price) {
    console.log(`Updating team ${teamId} purchase price to ${price}`);
    
    // Find the team
    const team = auctionTeams.find(t => t.id === teamId);
    if (!team) {
        console.error(`Team with ID ${teamId} not found`);
        return;
    }
    
    // Update the purchase price
    team.purchasePrice = price;
    
    // If price is 0, reset isMyTeam
    if (price === 0) {
        team.isMyTeam = false;
    }
    
    // Save teams to localStorage
    saveTeamsToStorage();
    
    // Update UI
    updateTeamCategories();
    calculateProjectedPotSize();
    updateAuctionResultsTracker();
}

// Update my team status
function updateMyTeam(teamId, isMyTeam) {
    console.log(`Updating team ${teamId} isMyTeam to ${isMyTeam}`);
    
    // Find the team
    const team = auctionTeams.find(t => t.id === teamId);
    if (!team) {
        console.error(`Team with ID ${teamId} not found`);
        return;
    }
    
    // Update isMyTeam
    team.isMyTeam = isMyTeam;
    
    // Save teams to localStorage
    saveTeamsToStorage();
    
    // Update UI
    updateTeamCategories();
    updateAuctionResultsTracker();
}

// Calculate fair value for a team
function calculateFairValue(team) {
    // Get pot size for calculations
    const potSize = (projectedPotSize > 0 ? projectedPotSize : estimatedPotSize);
    
    // Calculate fair value
    return team.valuePercentage * potSize;
}

// Synchronize with team odds data
function syncWithTeamOdds() {
    // Check if user has their own odds data first
    const userTeamOddsData = localStorage.getItem(`teamOddsData_${getUserId()}`);
    
    // If no user-specific odds, use the default odds
    const teamOddsData = userTeamOddsData || localStorage.getItem('teamOddsData');
    
    if (teamOddsData) {
        try {
            const oddsData = JSON.parse(teamOddsData);
            console.log('Found team odds data:', oddsData.length);
            
            if (oddsData.length > 0) {
                // Create a map of existing teams for quick lookup
                const existingTeamsMap = {};
                auctionTeams.forEach(team => {
                    existingTeamsMap[team.id] = team;
                });
                
                // Get base team data for reference
                const baseTeams = getDefaultTeams();
                const baseTeamsMap = {};
                baseTeams.forEach(team => {
                    baseTeamsMap[team.id] = team;
                });
                
                // Update teams array with new odds data while preserving purchase prices, isMyTeam status,
                // and ensuring base team info (name, seed, region) is always present
                auctionTeams = oddsData.map(oddsTeam => {
                    const existingTeam = existingTeamsMap[oddsTeam.id];
                    const baseTeam = baseTeamsMap[oddsTeam.id];
                    
                    if (!baseTeam) {
                        console.warn(`No base team found for ID ${oddsTeam.id}`);
                        return null;
                    }
                    
                    return {
                        ...baseTeam, // Start with base team info (name, seed, region)
                        ...oddsTeam, // Add odds data
                        // Preserve or set purchase price and team status
                        purchasePrice: existingTeam ? existingTeam.purchasePrice : (oddsTeam.purchasePrice || 0),
                        isMyTeam: existingTeam ? existingTeam.isMyTeam : (oddsTeam.isMyTeam || false),
                        // Ensure name, seed, and region are from base team data
                        name: baseTeam.name,
                        seed: baseTeam.seed,
                        region: baseTeam.region
                    };
                }).filter(team => team !== null); // Remove any null entries
                
                // Recalculate team values
                calculateTeamValues();
                
                // Update team categories
                updateTeamCategories();
                
                // Update the UI
                updateUI();
                
                // Save the updated teams to localStorage
                saveTeamsToStorage();
                
                console.log('Teams synced with odds data:', auctionTeams.length);
            } else {
                console.warn('Team odds data is empty');
            }
        } catch (error) {
            console.error('Error syncing with team odds data:', error);
        }
    } else {
        console.warn('No team odds data found in localStorage');
    }
    
    // Always ensure showProfits is true after syncing
    showProfits = true;
    
    // Always ensure the table has the show-profits class
    const table = document.querySelector('#teamTableBody').closest('table');
    if (table) {
        table.classList.add('show-profits');
    }
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

// Check for team odds updates periodically
setInterval(syncWithTeamOdds, 5000);

// Filter teams based on current filters
function filterTeams() {
    // Apply region filter
    if (auctionRegionFilter === 'All') {
        auctionFilteredTeams = [...auctionTeams];
    } else {
        auctionFilteredTeams = auctionTeams.filter(team => team.region === auctionRegionFilter);
    }
    
    // Apply status filter
    if (currentStatusFilter === 'Available') {
        auctionFilteredTeams = auctionFilteredTeams.filter(team => team.purchasePrice === 0);
    } else if (currentStatusFilter === 'Taken') {
        auctionFilteredTeams = auctionFilteredTeams.filter(team => team.purchasePrice > 0);
    }
    
    // Apply search filter
    if (auctionSearchTerm) {
        auctionFilteredTeams = auctionFilteredTeams.filter(team => 
            team.name.toLowerCase().includes(auctionSearchTerm) || 
            team.region.toLowerCase().includes(auctionSearchTerm) ||
            team.seed.toString().includes(auctionSearchTerm)
        );
    }
}

// Sort teams based on selected option and direction
function sortTeams() {
    if (!auctionFilteredTeams) {
        filterTeams();
    }
    
    console.log('Sorting teams with option:', auctionSortOption, 'direction:', auctionSortDirection);
    
    // Create a fresh copy of the array before sorting
    auctionFilteredTeams = [...auctionFilteredTeams].sort((a, b) => {
        let result;
        
        // Get values based on sort option
        switch (auctionSortOption) {
            case 'name':
                result = a.name.localeCompare(b.name);
                break;
            case 'seed':
                result = a.seed - b.seed;
                break;
            case 'valuePercentage':
                const valueA = parseFloat(a.valuePercentage) || 0;
                const valueB = parseFloat(b.valuePercentage) || 0;
                result = valueA - valueB;
                break;
            case 'region':
                result = a.region.localeCompare(b.region);
                break;
            default:
                // Default to value percentage sorting
                const defaultValueA = parseFloat(a.valuePercentage) || 0;
                const defaultValueB = parseFloat(b.valuePercentage) || 0;
                result = defaultValueA - defaultValueB;
        }
        
        // Apply sort direction consistently for all fields
        return auctionSortDirection === 'asc' ? result : -result;
    });
    
    console.log('First team after sorting:', auctionFilteredTeams[0]?.name);
}

// Update pagination controls
function updatePagination() {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) {
        console.error('Pagination container not found');
        return;
    }
    
    // Clear pagination container
    paginationContainer.innerHTML = '';
    
    // If no pages, return
    if (totalPages <= 1) {
        return;
    }
    
    // Create pagination nav
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Team pagination');
    
    // Create pagination list
    const ul = document.createElement('ul');
    ul.className = 'pagination';
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.textContent = 'Previous';
    if (currentPage > 1) {
        prevLink.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage--;
            updateTeamTable();
        });
    }
    prevLi.appendChild(prevLink);
    ul.appendChild(prevLi);
    
    // Page numbers
    const maxPages = 5; // Maximum number of page links to show
    const startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.href = '#';
        pageLink.textContent = i;
        if (i !== currentPage) {
            pageLink.addEventListener('click', function(e) {
                e.preventDefault();
                currentPage = i;
                updateTeamTable();
            });
        }
        pageLi.appendChild(pageLink);
        ul.appendChild(pageLi);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.textContent = 'Next';
    if (currentPage < totalPages) {
        nextLink.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage++;
            updateTeamTable();
        });
    }
    nextLi.appendChild(nextLink);
    ul.appendChild(nextLi);
    
    // Add pagination to container
    nav.appendChild(ul);
    paginationContainer.appendChild(nav);
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Add new function to fetch latest odds
function fetchLatestOdds() {
    console.log('Fetching latest odds...');
    isLoading = true;
    updateUI();
    
    // Store current purchase prices and team status
    const currentTeams = {};
    if (auctionTeams.length > 0) {
        auctionTeams.forEach(team => {
            currentTeams[team.id] = {
                purchasePrice: team.purchasePrice || 0,
                isMyTeam: team.isMyTeam || false
            };
        });
    }
    
    setTimeout(() => {
        // Load the default teams with market odds
        auctionTeams = getDefaultTeams().map(team => ({
            ...team,
            purchasePrice: (currentTeams[team.id] ? currentTeams[team.id].purchasePrice : 0) || 0,
            isMyTeam: (currentTeams[team.id] ? currentTeams[team.id].isMyTeam : false) || false,
            isOpponentTeam: false,
            odds: {
                r32: 0, s16: 0, e8: 0, f4: 0, f2: 0, champ: 0
            },
            winPercentage: 0,
            valuePercentage: 0
        }));

        // Calculate implied probabilities and devig odds
        calculateImpliedProbabilities();
        
        // Save teams to storage
        saveTeamsToStorage();
        
        // Update categories
        myTeams = auctionTeams.filter(team => team.isMyTeam);
        opponentsTeams = auctionTeams.filter(team => team.isOpponentTeam);
        availableTeams = auctionTeams.filter(team => !team.isMyTeam && !team.isOpponentTeam);
        
        isLoading = false;
        
        // Update the UI
        updateUI();
        
        // Show success message
        showAlert('success', 'Teams loaded successfully!');
    }, 1000);
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

// Devig odds for a specific round within a region
function devigRegionalRoundOdds(teamsInRegion, round) {
    // Extract implied probabilities for the round
    const impliedProbabilities = teamsInRegion.map(team => team.rawImpliedProbabilities[round]);
    
    // Calculate the overround (sum of all implied probabilities)
    const overround = impliedProbabilities.reduce((sum, prob) => sum + prob, 0);
    
    // Normalize the probabilities to remove the vig
    teamsInRegion.forEach((team, index) => {
        team.odds[round] = team.rawImpliedProbabilities[round] / overround;
    });
}

// Devig odds for each round considering tournament structure
function devigRoundOdds() {
    const regions = ['East', 'West', 'South', 'Midwest'];
    
    // Process each region separately for early rounds
    regions.forEach(region => {
        const teamsInRegion = auctionTeams.filter(team => team.region === region);
        
        // Sort teams by seed for proper matchups
        teamsInRegion.sort((a, b) => a.seed - b.seed);
        
        // Process Round of 32 matchups (1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)
        const r32Matchups = [
            [1, 16], [8, 9], [5, 12], [4, 13], [6, 11], [3, 14], [7, 10], [2, 15]
        ];
        
        // Handle each R32 matchup separately
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
        
        // Process other rounds
        ['s16', 'e8'].forEach(round => {
            devigRegionalRoundOdds(teamsInRegion, round);
        });
    });
    
    // Process F4 and Championship rounds across all teams
    ['f4', 'f2', 'champ'].forEach(round => {
        devigRegionalRoundOdds(auctionTeams, round);
    });
}

// Calculate implied probabilities from American odds
function calculateImpliedProbabilities() {
    console.log('Calculating implied probabilities for', auctionTeams.length, 'teams');
    
    auctionTeams.forEach(team => {
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
    auctionTeams.forEach(team => {
        team.winPercentage = team.odds.champ;
        team.valuePercentage = team.odds.champ;
    });
    
    console.log('Implied probabilities calculated successfully');
}

// Add helper function to show alerts
function showAlert(type, message) {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alert, container.firstChild);
        setTimeout(() => {
            alert.remove();
        }, 3000);
    }
}

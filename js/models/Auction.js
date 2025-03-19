import Team from './Team.js';

class Auction {
    constructor() {
        this.teams = [];
        this.payoutRules = null;
        this.estimatedPotSize = null;
        this.projectedPotSize = 0;
        this.myTeams = [];
        this.opponentsTeams = [];
        this.availableTeams = [];
        this.currentPage = 1;
        this.teamsPerPage = 20;
        this.totalPages = 0;
        this.filteredTeams = [];
        this.regionFilter = 'All';
        this.statusFilter = 'All';
        this.searchTerm = '';
        this.sortOption = 'seed';
        this.sortDirection = 'asc';
        this.isLoading = false;
    }

    async initialize() {
        this.isLoading = true;
        try {
            // Load teams from storage
            const savedTeams = await this.loadTeamsFromStorage();
            
            // Create teams from default data
            this.teams = this.getDefaultTeams().map(teamData => {
                const existingTeam = savedTeams?.find(t => t.id === teamData.id);
                const team = new Team(
                    teamData.id,
                    teamData.name,
                    teamData.seed,
                    teamData.region,
                    teamData.americanOdds
                );
                
                if (existingTeam) {
                    team.purchasePrice = existingTeam.purchasePrice || 0;
                    team.isMyTeam = existingTeam.isMyTeam || false;
                    team.isOpponentTeam = existingTeam.isOpponentTeam || false;
                }
                
                return team;
            });

            // Calculate initial values
            this.calculateImpliedProbabilities();
            this.updateTeamCategories();
            this.calculateProjectedPotSize();
            this.calculateTeamValues();
            
            // Save teams to storage
            await this.saveTeamsToStorage();
            
            return true;
        } catch (error) {
            console.error('Error initializing auction:', error);
            return false;
        } finally {
            this.isLoading = false;
        }
    }

    getDefaultTeams() {
        return [
            // East Region
            { id: 1, name: "Duke", seed: 1, region: "East", americanOdds: { r32: -3752, s16: -700, e8: -240, f4: -125, f2: +172, champ: +329 } },
            // ... (rest of the teams data)
        ];
    }

    calculateImpliedProbabilities() {
        // Calculate implied probabilities for each team
        this.teams.forEach(team => {
            Object.keys(team.americanOdds).forEach(round => {
                team.odds[round] = team.calculateImpliedProbability(round);
            });
        });
    }

    updateTeamCategories() {
        this.myTeams = this.teams.filter(team => team.isMyTeam);
        this.opponentsTeams = this.teams.filter(team => team.isOpponentTeam);
        this.availableTeams = this.teams.filter(team => !team.isMyTeam && !team.isOpponentTeam);
    }

    calculateProjectedPotSize() {
        this.projectedPotSize = this.teams.reduce((total, team) => total + team.purchasePrice, 0);
    }

    calculateTeamValues() {
        const potSize = this.projectedPotSize > 0 ? this.projectedPotSize : this.estimatedPotSize;
        if (!potSize) return;

        this.teams.forEach(team => {
            const fairValue = team.calculateFairValue(potSize);
            team.winPercentage = fairValue.probability;
            team.valuePercentage = (fairValue.value / potSize) * 100;
        });
    }

    filterTeams() {
        this.filteredTeams = this.teams.filter(team => {
            const matchesRegion = this.regionFilter === 'All' || team.region === this.regionFilter;
            const matchesStatus = this.statusFilter === 'All' || 
                (this.statusFilter === 'My Teams' && team.isMyTeam) ||
                (this.statusFilter === 'Opponent Teams' && team.isOpponentTeam) ||
                (this.statusFilter === 'Available' && !team.isMyTeam && !team.isOpponentTeam);
            const matchesSearch = !this.searchTerm || 
                team.name.toLowerCase().includes(this.searchTerm.toLowerCase());
            
            return matchesRegion && matchesStatus && matchesSearch;
        });

        this.sortTeams();
        this.updatePagination();
    }

    sortTeams() {
        this.filteredTeams.sort((a, b) => {
            let comparison = 0;
            
            switch (this.sortOption) {
                case 'seed':
                    comparison = a.seed - b.seed;
                    break;
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'value':
                    comparison = b.valuePercentage - a.valuePercentage;
                    break;
                case 'win':
                    comparison = b.winPercentage - a.winPercentage;
                    break;
                default:
                    comparison = 0;
            }
            
            return this.sortDirection === 'asc' ? comparison : -comparison;
        });
    }

    updatePagination() {
        this.totalPages = Math.ceil(this.filteredTeams.length / this.teamsPerPage);
        this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));
    }

    getCurrentPageTeams() {
        const start = (this.currentPage - 1) * this.teamsPerPage;
        const end = start + this.teamsPerPage;
        return this.filteredTeams.slice(start, end);
    }

    async saveTeamsToStorage() {
        try {
            const teamsToSave = this.teams.map(team => ({
                id: team.id,
                purchasePrice: team.purchasePrice,
                isMyTeam: team.isMyTeam,
                isOpponentTeam: team.isOpponentTeam
            }));
            
            localStorage.setItem('calcuttaTeams', JSON.stringify(teamsToSave));
            
            // Save to server if logged in
            if (this.isLoggedIn()) {
                const userData = {
                    teams: teamsToSave,
                    payoutRules: this.payoutRules,
                    estimatedPotSize: this.estimatedPotSize
                };
                
                return await this.saveUserData(userData);
            }
            
            return true;
        } catch (error) {
            console.error('Error saving teams:', error);
            return false;
        }
    }

    async loadTeamsFromStorage() {
        try {
            let teams = null;
            
            // Try to load from server first if logged in
            if (this.isLoggedIn()) {
                const userData = await this.loadUserData();
                if (userData?.teams?.length > 0) {
                    teams = userData.teams;
                    this.payoutRules = userData.payoutRules;
                    this.estimatedPotSize = userData.estimatedPotSize;
                }
            }
            
            // Try localStorage if server data not available
            if (!teams) {
                const savedTeams = localStorage.getItem('calcuttaTeams');
                if (savedTeams) {
                    teams = JSON.parse(savedTeams);
                }
            }
            
            return teams;
        } catch (error) {
            console.error('Error loading teams:', error);
            return null;
        }
    }

    isLoggedIn() {
        // Implement your login check logic here
        return false;
    }

    async saveUserData(userData) {
        // Implement your server save logic here
        return true;
    }

    async loadUserData() {
        // Implement your server load logic here
        return null;
    }
}

export default Auction; 
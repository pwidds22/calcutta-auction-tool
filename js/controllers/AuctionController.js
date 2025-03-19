import Auction from '../models/Auction.js';
import TeamTableView from '../views/TeamTableView.js';

class AuctionController {
    constructor() {
        this.model = new Auction();
        this.teamTableView = new TeamTableView(document.querySelector('#teamTable'));
        this.initializeEventListeners();
    }

    async initialize() {
        const success = await this.model.initialize();
        if (success) {
            this.updateUI();
        } else {
            this.teamTableView.showAlert('danger', 'Failed to initialize auction data');
        }
    }

    initializeEventListeners() {
        // Team table event listeners
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('my-team-checkbox')) {
                this.handleMyTeamChange(e.target);
            } else if (e.target.classList.contains('opponent-team-checkbox')) {
                this.handleOpponentTeamChange(e.target);
            } else if (e.target.classList.contains('purchase-price-input')) {
                this.handlePurchasePriceChange(e.target);
            }
        });

        // Filter and sort event listeners
        document.addEventListener('change', (e) => {
            if (e.target.id === 'regionFilter') {
                this.model.regionFilter = e.target.value;
                this.updateUI();
            } else if (e.target.id === 'statusFilter') {
                this.model.statusFilter = e.target.value;
                this.updateUI();
            } else if (e.target.id === 'sortOption') {
                this.model.sortOption = e.target.value;
                this.updateUI();
            }
        });

        // Search input event listener
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.model.searchTerm = e.target.value;
                this.updateUI();
            });
        }

        // Pagination event listener
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page)) {
                    this.model.currentPage = page;
                    this.updateUI();
                }
            }
        });

        // Sort header event listeners
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'TH' && e.target.dataset.sort) {
                if (this.model.sortOption === e.target.dataset.sort) {
                    this.model.sortDirection = this.model.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.model.sortOption = e.target.dataset.sort;
                    this.model.sortDirection = 'asc';
                }
                this.updateUI();
            }
        });

        // Reset button event listener
        const resetButton = document.querySelector('#resetButton');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.handleReset());
        }
    }

    async handleMyTeamChange(checkbox) {
        const teamId = parseInt(checkbox.dataset.teamId);
        const team = this.model.teams.find(t => t.id === teamId);
        if (team) {
            team.isMyTeam = checkbox.checked;
            if (checkbox.checked) {
                team.isOpponentTeam = false;
            }
            await this.model.saveTeamsToStorage();
            this.updateUI();
        }
    }

    async handleOpponentTeamChange(checkbox) {
        const teamId = parseInt(checkbox.dataset.teamId);
        const team = this.model.teams.find(t => t.id === teamId);
        if (team) {
            team.isOpponentTeam = checkbox.checked;
            if (checkbox.checked) {
                team.isMyTeam = false;
            }
            await this.model.saveTeamsToStorage();
            this.updateUI();
        }
    }

    async handlePurchasePriceChange(input) {
        const teamId = parseInt(input.dataset.teamId);
        const team = this.model.teams.find(t => t.id === teamId);
        if (team) {
            team.purchasePrice = parseFloat(input.value) || 0;
            this.model.calculateProjectedPotSize();
            this.model.calculateTeamValues();
            await this.model.saveTeamsToStorage();
            this.updateUI();
        }
    }

    async handleReset() {
        if (confirm('Are you sure you want to reset all teams? This will clear all purchase prices and team selections.')) {
            this.model.teams.forEach(team => {
                team.purchasePrice = 0;
                team.isMyTeam = false;
                team.isOpponentTeam = false;
            });
            await this.model.saveTeamsToStorage();
            this.updateUI();
            this.teamTableView.showAlert('success', 'Auction has been reset');
        }
    }

    updateUI() {
        // Filter and sort teams
        this.model.filterTeams();
        
        // Get current page teams
        const currentPageTeams = this.model.getCurrentPageTeams();
        
        // Update table headers
        this.teamTableView.updateHeaders(this.model.showProfits);
        
        // Update table content
        this.teamTableView.updateTable(
            currentPageTeams,
            this.model.projectedPotSize,
            this.model.payoutRules
        );
        
        // Update summary statistics
        this.teamTableView.updateSummaryStatistics(
            this.model.teams,
            this.model.projectedPotSize
        );
        
        // Update pagination
        this.teamTableView.updatePagination(
            this.model.currentPage,
            this.model.totalPages
        );
    }
}

export default AuctionController; 
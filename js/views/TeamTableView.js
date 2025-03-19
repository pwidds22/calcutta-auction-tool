import View from './View.js';

class TeamTableView extends View {
    constructor(element) {
        super(element);
        this.tableBody = element.querySelector('tbody');
        this.tableHeaders = element.querySelector('thead');
    }

    updateHeaders(showProfits) {
        const headers = [
            { key: 'seed', label: 'Seed' },
            { key: 'name', label: 'Team' },
            { key: 'region', label: 'Region' },
            { key: 'purchasePrice', label: 'Purchase Price' },
            { key: 'winPercentage', label: 'Win %' },
            { key: 'valuePercentage', label: 'Value %' }
        ];

        if (showProfits) {
            headers.push(
                { key: 'r32', label: 'R32 Profit' },
                { key: 's16', label: 'S16 Profit' },
                { key: 'e8', label: 'E8 Profit' },
                { key: 'f4', label: 'F4 Profit' },
                { key: 'f2', label: 'F2 Profit' },
                { key: 'champ', label: 'Champ Profit' },
                { key: 'total', label: 'Total Profit' }
            );
        }

        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.label;
            th.dataset.sort = header.key;
            th.style.cursor = 'pointer';
            headerRow.appendChild(th);
        });

        this.tableHeaders.innerHTML = '';
        this.tableHeaders.appendChild(headerRow);
    }

    updateTable(teams, potSize, payoutRules) {
        this.tableBody.innerHTML = '';
        
        teams.forEach(team => {
            const row = document.createElement('tr');
            
            // Add team data cells
            row.innerHTML = `
                <td>${team.seed}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <input type="checkbox" class="form-check-input me-2 my-team-checkbox" 
                               data-team-id="${team.id}" ${team.isMyTeam ? 'checked' : ''}>
                        <input type="checkbox" class="form-check-input me-2 opponent-team-checkbox" 
                               data-team-id="${team.id}" ${team.isOpponentTeam ? 'checked' : ''}>
                        ${team.name}
                    </div>
                </td>
                <td>${team.region}</td>
                <td>
                    <input type="number" class="form-control form-control-sm purchase-price-input" 
                           data-team-id="${team.id}" value="${team.purchasePrice}" min="0">
                </td>
                <td>${this.formatPercentage(team.winPercentage)}</td>
                <td>${this.formatPercentage(team.valuePercentage)}</td>
            `;

            // Add profit cells if enabled
            if (this.showProfits) {
                const profits = team.calculateRoundProfits(potSize, payoutRules);
                Object.keys(profits).forEach(round => {
                    const cell = document.createElement('td');
                    cell.textContent = this.formatCurrency(profits[round]);
                    cell.className = profits[round] >= 0 ? 'text-success' : 'text-danger';
                    row.appendChild(cell);
                });
            }

            this.tableBody.appendChild(row);
        });
    }

    updateSummaryStatistics(teams, potSize) {
        const stats = {
            totalTeams: teams.length,
            myTeams: teams.filter(t => t.isMyTeam).length,
            opponentTeams: teams.filter(t => t.isOpponentTeam).length,
            totalPurchasePrice: teams.reduce((sum, t) => sum + t.purchasePrice, 0),
            averageWinPercentage: teams.reduce((sum, t) => sum + t.winPercentage, 0) / teams.length,
            averageValuePercentage: teams.reduce((sum, t) => sum + t.valuePercentage, 0) / teams.length
        };

        // Update the summary statistics display
        const statsContainer = document.querySelector('.summary-statistics');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="row">
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Total Teams</h5>
                                <p class="card-text">${stats.totalTeams}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">My Teams</h5>
                                <p class="card-text">${stats.myTeams}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Opponent Teams</h5>
                                <p class="card-text">${stats.opponentTeams}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Total Purchase Price</h5>
                                <p class="card-text">${this.formatCurrency(stats.totalPurchasePrice)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    updatePagination(currentPage, totalPages) {
        const pagination = document.querySelector('.pagination');
        if (!pagination) return;

        let html = '';
        
        // Previous button
        html += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        // Next button
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
            </li>
        `;

        pagination.innerHTML = html;
    }
}

export default TeamTableView; 
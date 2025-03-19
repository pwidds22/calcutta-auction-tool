import AuctionController from './controllers/AuctionController.js';

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const controller = new AuctionController();
        await controller.initialize();
    } catch (error) {
        console.error('Error initializing application:', error);
        // Show error message to user
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.role = 'alert';
        alertDiv.innerHTML = `
            Failed to initialize application. Please refresh the page or contact support.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild);
    }
}); 
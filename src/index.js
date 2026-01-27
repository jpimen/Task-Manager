/**
 * Application Entry Point - MVVM Admin-Client Task Manager
 * 
 * This is the main entry point that initializes the MVVM architecture.
 * It handles:
 * - Application initialization
 * - Role-based dashboard rendering
 * - Login/logout functionality
 * - Switching between Admin and Client views
 * 
 * MVVM Flow Summary:
 * 1. AuthService manages user authentication
 * 2. Based on user role, appropriate ViewModel is created
 * 3. Corresponding View is created with reference to ViewModel
 * 4. View subscribes to ViewModel for data updates
 * 5. User interacts with View → View delegates to ViewModel
 * 6. ViewModel updates Model → Persists to storage → Notifies View
 * 7. View re-renders with new data
 */

import { authService } from './services/authService.js';
import { themeService } from './services/themeService.js';
import { AdminViewModel } from './viewmodel/adminViewModel.js';
import { ClientViewModel } from './viewmodel/clientViewModel.js';
import { AdminView } from './view/adminView.js';
import { ClientView } from './view/clientView.js';
import { UserRole } from './model/userModel.js';

/**
 * Application class - Main controller for the app
 */
class App {
    constructor() {
        this.currentView = null;
        this.currentViewModel = null;

        // Cache DOM elements
        this.loginScreen = document.getElementById('login-screen');
        this.appScreen = document.getElementById('app-screen');
        this.adminDashboard = document.getElementById('admin-dashboard');
        this.clientDashboard = document.getElementById('client-dashboard');
        this.userListContainer = document.getElementById('user-list');
        this.currentUserName = document.getElementById('current-user-name');
        this.currentUserRole = document.getElementById('current-user-role');
        this.logoutBtn = document.getElementById('logout-btn');
        this.themeToggleBtn = document.getElementById('theme-toggle-btn');

        // Subscribe to auth state changes
        authService.subscribe(this.onAuthStateChange.bind(this));

        // Bind event listeners
        this.bindEvents();

        // Check initial auth state
        this.checkAuthState();
    }

    /**
     * Binds event listeners for login/logout
     */
    bindEvents() {
        // User selection for login
        this.userListContainer?.addEventListener('click', (e) => {
            const userCard = e.target.closest('.user-card');
            if (userCard) {
                const userId = userCard.dataset.userId;
                this.handleLogin(userId);
            }
        });

        // Logout button
        this.logoutBtn?.addEventListener('click', () => {
            this.handleLogout();
        });

        // Theme toggle button
        this.themeToggleBtn?.addEventListener('click', () => {
            themeService.toggle();
        });
    }

    /**
     * Checks initial authentication state
     */
    checkAuthState() {
        if (authService.isAuthenticated()) {
            this.showAppScreen();
        } else {
            this.showLoginScreen();
        }
    }

    /**
     * Handles auth state changes from AuthService
     * @param {Object} authState - Auth state object
     */
    onAuthStateChange(authState) {
        if (authState.isAuthenticated) {
            this.showAppScreen();
        } else {
            this.showLoginScreen();
        }
    }

    /**
     * Shows the login screen with user selection
     */
    showLoginScreen() {
        // Hide app screen
        this.appScreen.style.display = 'none';
        this.loginScreen.style.display = 'flex';

        // Render user list
        this.renderUserList();
    }

    /**
     * Renders the user selection list
     */
    renderUserList() {
        const users = authService.getAllUsers();

        this.userListContainer.innerHTML = users.map(user => `
            <div class="user-card ${user.role}" data-user-id="${user.id}">
                <div class="user-avatar ${user.role}">
                    ${user.role === UserRole.ADMIN ? '👔' : '👤'}
                </div>
                <div class="user-info">
                    <h3 class="user-name">${this.escapeHTML(user.name)}</h3>
                    <span class="user-role-badge ${user.role}">${user.role.toUpperCase()}</span>
                </div>
                <div class="user-card-arrow">→</div>
            </div>
        `).join('');
    }

    /**
     * Handles user login
     * @param {string} userId - ID of user to log in
     */
    handleLogin(userId) {
        const result = authService.login(userId);

        if (!result.success) {
            alert('Login failed: ' + result.error);
        }
    }

    /**
     * Handles user logout
     */
    handleLogout() {
        // Clear current view and viewmodel
        this.currentView = null;
        this.currentViewModel = null;

        authService.logout();
    }

    /**
     * Shows the main app screen based on user role
     */
    showAppScreen() {
        // Hide login screen
        this.loginScreen.style.display = 'none';
        this.appScreen.style.display = 'flex';

        const currentUser = authService.getCurrentUser();

        // Update header with current user info
        this.currentUserName.textContent = currentUser.name;
        this.currentUserRole.textContent = currentUser.role.toUpperCase();
        this.currentUserRole.className = `user-role-tag ${currentUser.role}`;

        // Show appropriate dashboard based on role
        if (currentUser.role === UserRole.ADMIN) {
            this.showAdminDashboard();
        } else {
            this.showClientDashboard();
        }
    }

    /**
     * Shows the Admin Dashboard
     */
    showAdminDashboard() {
        // Hide client dashboard
        this.clientDashboard.style.display = 'none';
        this.adminDashboard.style.display = 'block';

        // Create Admin ViewModel and View
        this.currentViewModel = new AdminViewModel();
        this.currentView = new AdminView(this.currentViewModel);
        this.currentView.init();

        console.log('🎯 Admin Dashboard loaded');
    }

    /**
     * Shows the Client Dashboard
     */
    showClientDashboard() {
        // Hide admin dashboard
        this.adminDashboard.style.display = 'none';
        this.clientDashboard.style.display = 'block';

        // Create Client ViewModel and View
        this.currentViewModel = new ClientViewModel();
        this.currentView = new ClientView(this.currentViewModel);
        this.currentView.init();

        console.log('👤 Client Dashboard loaded');
    }

    /**
     * Escapes HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * Initialize the application when DOM is ready
 */
function initApp() {
    console.log('🚀 Initializing MVVM Admin-Client Task Manager...');

    // Create the main application instance
    const app = new App();

    // Make available for debugging
    window.__app = app;
    window.__authService = authService;
    window.__themeService = themeService;

    console.log('✅ Application initialized successfully!');
    console.log('📊 Architecture: Model → ViewModel ← View');
    console.log('🔐 Roles: Admin (create/assign tasks) | Client (manage assigned tasks)');
}

// Wait for DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

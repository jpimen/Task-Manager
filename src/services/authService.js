/**
 * Auth Service - MVVM Architecture (Admin-Client System)
 * 
 * The Auth Service handles authentication and authorization logic.
 * It provides:
 * - Mock login/logout functionality
 * - Role-based access control
 * - Session management
 * - User initialization
 * 
 * This is a simplified auth system for demonstration purposes.
 * In a real application, this would connect to a backend API.
 */

import { User, UserList, UserRole, DEFAULT_USERS } from '../model/userModel.js';
import { StorageService } from './storageService.js';

/**
 * AuthService class - Handles authentication and user management
 */
export class AuthService {
    constructor() {
        this.userList = new UserList();
        this.currentUser = null;
        this.subscribers = [];

        // Initialize users from storage or defaults
        this.initializeUsers();

        // Restore session if exists
        this.restoreSession();
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    /**
     * Initializes users from storage or creates defaults
     */
    initializeUsers() {
        const storedUsers = StorageService.loadUsers();

        if (storedUsers.length === 0) {
            // First time - create default users
            this.userList.loadFromArray(DEFAULT_USERS);
            this.saveUsers();
            console.log('📋 Created default users');
        } else {
            // Load existing users
            this.userList.loadFromArray(storedUsers);
            console.log(`📋 Loaded ${storedUsers.length} users from storage`);
        }
    }

    /**
     * Restores user session from storage
     */
    restoreSession() {
        const storedUser = StorageService.loadCurrentUser();

        if (storedUser) {
            // Verify user still exists
            const user = this.userList.getUserById(storedUser.id);
            if (user) {
                this.currentUser = user;
                console.log(`🔓 Session restored for: ${user.name}`);
            } else {
                // User no longer exists, clear session
                StorageService.clearCurrentUser();
            }
        }
    }

    // ==========================================
    // OBSERVER PATTERN - Subscribe/Notify
    // ==========================================

    /**
     * Subscribes a callback function to receive auth state updates
     * @param {Function} callback - Function to call when auth state changes
     */
    subscribe(callback) {
        this.subscribers.push(callback);
    }

    /**
     * Unsubscribes a callback function
     * @param {Function} callback - Function to remove from subscribers
     */
    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter(sub => sub !== callback);
    }

    /**
     * Notifies all subscribers of auth state change
     */
    notify() {
        const authState = this.getAuthState();
        this.subscribers.forEach(callback => callback(authState));
    }

    /**
     * Gets current authentication state
     * @returns {Object} Auth state object
     */
    getAuthState() {
        return {
            isAuthenticated: this.isAuthenticated(),
            currentUser: this.currentUser,
            role: this.currentUser?.role || null
        };
    }

    // ==========================================
    // AUTHENTICATION METHODS
    // ==========================================

    /**
     * Logs in a user by their ID
     * @param {string} userId - ID of the user to log in
     * @returns {Object} Result object with success status and user/error
     */
    login(userId) {
        const user = this.userList.getUserById(userId);

        if (!user) {
            return {
                success: false,
                error: 'User not found'
            };
        }

        this.currentUser = user;
        StorageService.saveCurrentUser(user.toJSON());

        console.log(`🔓 Logged in as: ${user.name} (${user.role})`);

        // Notify subscribers of auth state change
        this.notify();

        return {
            success: true,
            user: user
        };
    }

    /**
     * Logs out the current user
     * @returns {boolean} True if successful
     */
    logout() {
        if (this.currentUser) {
            console.log(`🔒 Logged out: ${this.currentUser.name}`);
        }

        this.currentUser = null;
        StorageService.clearCurrentUser();

        // Notify subscribers of auth state change
        this.notify();

        return true;
    }

    /**
     * Checks if a user is currently authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Gets the current logged-in user
     * @returns {User|null} Current user or null
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Gets the current user's role
     * @returns {string|null} User role or null
     */
    getCurrentRole() {
        return this.currentUser?.role || null;
    }

    // ==========================================
    // AUTHORIZATION METHODS
    // ==========================================

    /**
     * Checks if current user is an admin
     * @returns {boolean} True if current user is admin
     */
    isAdmin() {
        return this.currentUser?.role === UserRole.ADMIN;
    }

    /**
     * Checks if current user is a client
     * @returns {boolean} True if current user is client
     */
    isClient() {
        return this.currentUser?.role === UserRole.CLIENT;
    }

    /**
     * Checks if current user has a specific role
     * @param {string} role - Role to check
     * @returns {boolean} True if user has the role
     */
    hasRole(role) {
        return this.currentUser?.role === role;
    }

    // ==========================================
    // USER MANAGEMENT
    // ==========================================

    /**
     * Gets all users
     * @returns {User[]} Array of all users
     */
    getAllUsers() {
        return this.userList.getAllUsers();
    }

    /**
     * Gets all client users
     * @returns {User[]} Array of client users
     */
    getClients() {
        return this.userList.getClients();
    }

    /**
     * Gets all admin users
     * @returns {User[]} Array of admin users
     */
    getAdmins() {
        return this.userList.getAdmins();
    }

    /**
     * Gets a user by ID
     * @param {string} userId - User ID
     * @returns {User|undefined} User or undefined
     */
    getUserById(userId) {
        return this.userList.getUserById(userId);
    }

    /**
     * Adds a new user
     * @param {Object} userData - User data
     * @returns {User|null} Created user or null if failed
     */
    addUser(userData) {
        const user = new User({
            id: this.generateUserId(),
            name: userData.name,
            role: userData.role || UserRole.CLIENT,
            email: userData.email || ''
        });

        if (this.userList.addUser(user)) {
            this.saveUsers();
            return user;
        }

        return null;
    }

    /**
     * Removes a user
     * @param {string} userId - ID of user to remove
     * @returns {boolean} True if successful
     */
    removeUser(userId) {
        // Can't remove yourself
        if (this.currentUser?.id === userId) {
            console.warn("Cannot remove currently logged in user");
            return false;
        }

        if (this.userList.removeUser(userId)) {
            this.saveUsers();
            return true;
        }

        return false;
    }

    /**
     * Saves users to storage
     */
    saveUsers() {
        StorageService.saveUsers(this.userList.toArray());
    }

    /**
     * Generates a unique user ID
     * @returns {string} Unique ID
     */
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ==========================================
    // UTILITY METHODS
    // ==========================================

    /**
     * Resets the auth service to initial state
     * Clears all users and creates defaults
     */
    reset() {
        this.logout();
        this.userList = new UserList();
        this.userList.loadFromArray(DEFAULT_USERS);
        this.saveUsers();
        console.log('🔄 Auth service reset to defaults');
    }
}

// Export a singleton instance
export const authService = new AuthService();

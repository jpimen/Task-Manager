/**
 * User Model - MVVM Architecture (Admin-Client System)
 * 
 * The User Model represents user data and role management.
 * It handles:
 * - User data structure (id, name, role)
 * - Role enumeration (admin/client)
 * - User collection management
 * 
 * The Model is completely independent of the View.
 */

/**
 * User roles enumeration
 */
export const UserRole = {
    ADMIN: 'admin',
    CLIENT: 'client'
};

/**
 * User class representing a single user entity
 */
export class User {
    /**
     * Creates a new User instance
     * @param {Object} params - User parameters
     * @param {string} params.id - Unique identifier for the user
     * @param {string} params.name - User's display name
     * @param {string} params.role - User role (admin/client)
     * @param {string} params.email - User's email (optional)
     * @param {Date} params.createdAt - User creation timestamp
     */
    constructor({
        id,
        name,
        role = UserRole.CLIENT,
        email = '',
        createdAt = new Date()
    }) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.email = email;
        this.createdAt = createdAt;
    }

    /**
     * Checks if the user is an admin
     * @returns {boolean} True if user is admin
     */
    isAdmin() {
        return this.role === UserRole.ADMIN;
    }

    /**
     * Checks if the user is a client
     * @returns {boolean} True if user is client
     */
    isClient() {
        return this.role === UserRole.CLIENT;
    }

    /**
     * Updates user properties
     * @param {Object} updates - Object containing properties to update
     */
    update(updates) {
        if (updates.name !== undefined) this.name = updates.name;
        if (updates.email !== undefined) this.email = updates.email;
        if (updates.role !== undefined && Object.values(UserRole).includes(updates.role)) {
            this.role = updates.role;
        }
    }

    /**
     * Converts User instance to a plain object for serialization
     * @returns {Object} Plain object representation of the user
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            role: this.role,
            email: this.email,
            createdAt: this.createdAt instanceof Date ? this.createdAt.toISOString() : this.createdAt
        };
    }

    /**
     * Creates a User instance from a plain object
     * @param {Object} obj - Plain object with user properties
     * @returns {User} New User instance
     */
    static fromJSON(obj) {
        return new User({
            id: obj.id,
            name: obj.name,
            role: obj.role,
            email: obj.email,
            createdAt: new Date(obj.createdAt)
        });
    }
}

/**
 * UserList Model - Manages a collection of users
 * Handles all business logic related to user collection operations
 */
export class UserList {
    constructor() {
        this.users = [];
    }

    /**
     * Adds a new user to the collection
     * @param {User} user - User to add
     */
    addUser(user) {
        // Check for duplicate ID
        if (this.getUserById(user.id)) {
            console.warn(`User with ID ${user.id} already exists`);
            return false;
        }
        this.users.push(user);
        return true;
    }

    /**
     * Removes a user by their ID
     * @param {string} id - ID of the user to remove
     * @returns {boolean} True if user was found and removed
     */
    removeUser(id) {
        const initialLength = this.users.length;
        this.users = this.users.filter(user => user.id !== id);
        return this.users.length < initialLength;
    }

    /**
     * Finds a user by their ID
     * @param {string} id - ID of the user to find
     * @returns {User|undefined} The found user or undefined
     */
    getUserById(id) {
        return this.users.find(user => user.id === id);
    }

    /**
     * Gets all users
     * @returns {User[]} Array of all users
     */
    getAllUsers() {
        return [...this.users];
    }

    /**
     * Gets all admin users
     * @returns {User[]} Array of admin users
     */
    getAdmins() {
        return this.users.filter(user => user.role === UserRole.ADMIN);
    }

    /**
     * Gets all client users
     * @returns {User[]} Array of client users
     */
    getClients() {
        return this.users.filter(user => user.role === UserRole.CLIENT);
    }

    /**
     * Gets user count by role
     * @returns {Object} Object with user counts
     */
    getUserCounts() {
        return {
            total: this.users.length,
            admins: this.getAdmins().length,
            clients: this.getClients().length
        };
    }

    /**
     * Loads users from an array of plain objects
     * @param {Object[]} userObjects - Array of plain user objects
     */
    loadFromArray(userObjects) {
        this.users = userObjects.map(obj => User.fromJSON(obj));
    }

    /**
     * Converts all users to an array of plain objects
     * @returns {Object[]} Array of plain user objects
     */
    toArray() {
        return this.users.map(user => user.toJSON());
    }

    /**
     * Searches users by name
     * @param {string} query - Search query
     * @returns {User[]} Array of matching users
     */
    searchUsers(query) {
        const lowerQuery = query.toLowerCase();
        return this.users.filter(user =>
            user.name.toLowerCase().includes(lowerQuery)
        );
    }
}

/**
 * Default users for the system
 * These are pre-populated when the system initializes
 */
export const DEFAULT_USERS = [
    {
        id: 'admin_001',
        name: 'Admin User',
        role: UserRole.ADMIN,
        email: 'admin@taskmanager.com',
        createdAt: new Date().toISOString()
    },
    {
        id: 'client_001',
        name: 'John Doe',
        role: UserRole.CLIENT,
        email: 'john@example.com',
        createdAt: new Date().toISOString()
    },
    {
        id: 'client_002',
        name: 'Jane Smith',
        role: UserRole.CLIENT,
        email: 'jane@example.com',
        createdAt: new Date().toISOString()
    },
    {
        id: 'client_003',
        name: 'Bob Johnson',
        role: UserRole.CLIENT,
        email: 'bob@example.com',
        createdAt: new Date().toISOString()
    }
];

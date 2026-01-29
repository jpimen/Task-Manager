/**
 * Category Model - Task Categories/Tags System
 * 
 * Provides task categorization and tagging functionality
 * Allows admins to organize tasks by categories for better management
 */

/**
 * Category class representing a task category/tag
 */
export class Category {
    /**
     * Creates a new Category instance
     * @param {Object} params - Category parameters
     * @param {string} params.id - Unique identifier
     * @param {string} params.name - Category name
     * @param {string} params.color - Hex color code for UI display
     * @param {string} params.description - Category description (optional)
     * @param {Date} params.createdAt - Creation timestamp
     */
    constructor({
        id,
        name,
        color = '#3498db',
        description = '',
        createdAt = new Date()
    }) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.description = description;
        this.createdAt = createdAt;
    }

    /**
     * Updates category properties
     * @param {Object} updates - Object containing properties to update
     */
    update(updates) {
        if (updates.name !== undefined) this.name = updates.name;
        if (updates.color !== undefined) this.color = updates.color;
        if (updates.description !== undefined) this.description = updates.description;
    }

    /**
     * Converts Category to plain object for serialization
     * @returns {Object} Plain object representation
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            description: this.description,
            createdAt: this.createdAt instanceof Date ? this.createdAt.toISOString() : this.createdAt
        };
    }

    /**
     * Creates Category from plain object
     * @param {Object} obj - Plain object with category properties
     * @returns {Category} New Category instance
     */
    static fromJSON(obj) {
        return new Category({
            id: obj.id,
            name: obj.name,
            color: obj.color,
            description: obj.description,
            createdAt: new Date(obj.createdAt)
        });
    }
}

/**
 * CategoryList - Manages collection of categories
 */
export class CategoryList {
    constructor() {
        this.categories = [];
    }

    /**
     * Adds a new category
     * @param {Category} category - Category to add
     */
    addCategory(category) {
        if (!this.categories.find(c => c.id === category.id)) {
            this.categories.push(category);
        }
    }

    /**
     * Removes a category by ID
     * @param {string} id - Category ID
     * @returns {boolean} True if removed
     */
    removeCategory(id) {
        const initialLength = this.categories.length;
        this.categories = this.categories.filter(c => c.id !== id);
        return this.categories.length < initialLength;
    }

    /**
     * Gets category by ID
     * @param {string} id - Category ID
     * @returns {Category|undefined} Found category or undefined
     */
    getCategoryById(id) {
        return this.categories.find(c => c.id === id);
    }

    /**
     * Gets all categories
     * @returns {Category[]} All categories
     */
    getAllCategories() {
        return [...this.categories];
    }

    /**
     * Loads categories from array
     * @param {Object[]} categoryObjects - Array of plain category objects
     */
    loadFromArray(categoryObjects) {
        this.categories = categoryObjects.map(obj => Category.fromJSON(obj));
    }

    /**
     * Converts to array of plain objects
     * @returns {Object[]} Array of plain objects
     */
    toArray() {
        return this.categories.map(cat => cat.toJSON());
    }
}

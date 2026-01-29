/**
 * Subtask Model - Task Decomposition
 * 
 * Allows tasks to be broken down into smaller subtasks
 * Each subtask can have its own status and progress tracking
 */

/**
 * Subtask class representing a single subtask
 */
export class Subtask {
    /**
     * Creates a new Subtask instance
     * @param {Object} params - Subtask parameters
     * @param {string} params.id - Unique identifier
     * @param {string} params.parentTaskId - ID of the parent task
     * @param {string} params.title - Subtask title
     * @param {boolean} params.completed - Completion status
     * @param {number} params.estimatedHours - Estimated hours to complete
     * @param {Date} params.createdAt - Creation timestamp
     */
    constructor({
        id,
        parentTaskId,
        title,
        completed = false,
        estimatedHours = 0,
        createdAt = new Date()
    }) {
        this.id = id;
        this.parentTaskId = parentTaskId;
        this.title = title;
        this.completed = completed;
        this.estimatedHours = estimatedHours;
        this.createdAt = createdAt;
        this.completedAt = null;
    }

    /**
     * Toggles subtask completion
     */
    toggle() {
        this.completed = !this.completed;
        if (this.completed) {
            this.completedAt = new Date();
        } else {
            this.completedAt = null;
        }
    }

    /**
     * Updates subtask properties
     * @param {Object} updates - Properties to update
     */
    update(updates) {
        if (updates.title !== undefined) this.title = updates.title;
        if (updates.estimatedHours !== undefined) this.estimatedHours = updates.estimatedHours;
    }

    /**
     * Converts to plain object
     * @returns {Object} Plain object representation
     */
    toJSON() {
        return {
            id: this.id,
            parentTaskId: this.parentTaskId,
            title: this.title,
            completed: this.completed,
            estimatedHours: this.estimatedHours,
            createdAt: this.createdAt instanceof Date ? this.createdAt.toISOString() : this.createdAt,
            completedAt: this.completedAt ? (this.completedAt instanceof Date ? this.completedAt.toISOString() : this.completedAt) : null
        };
    }

    /**
     * Creates from plain object
     * @param {Object} obj - Plain object
     * @returns {Subtask} New Subtask instance
     */
    static fromJSON(obj) {
        const subtask = new Subtask({
            id: obj.id,
            parentTaskId: obj.parentTaskId,
            title: obj.title,
            completed: obj.completed,
            estimatedHours: obj.estimatedHours,
            createdAt: new Date(obj.createdAt)
        });
        subtask.completedAt = obj.completedAt ? new Date(obj.completedAt) : null;
        return subtask;
    }
}

/**
 * SubtaskList - Manages subtasks for a task
 */
export class SubtaskList {
    constructor() {
        this.subtasks = [];
    }

    /**
     * Adds a subtask
     * @param {Subtask} subtask - Subtask to add
     */
    addSubtask(subtask) {
        this.subtasks.push(subtask);
    }

    /**
     * Removes a subtask by ID
     * @param {string} id - Subtask ID
     * @returns {boolean} True if removed
     */
    removeSubtask(id) {
        const initialLength = this.subtasks.length;
        this.subtasks = this.subtasks.filter(s => s.id !== id);
        return this.subtasks.length < initialLength;
    }

    /**
     * Gets subtask by ID
     * @param {string} id - Subtask ID
     * @returns {Subtask|undefined} Found subtask
     */
    getSubtaskById(id) {
        return this.subtasks.find(s => s.id === id);
    }

    /**
     * Gets all subtasks
     * @returns {Subtask[]} All subtasks
     */
    getAllSubtasks() {
        return [...this.subtasks];
    }

    /**
     * Gets completion statistics
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const total = this.subtasks.length;
        const completed = this.subtasks.filter(s => s.completed).length;
        const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        const totalEstimatedHours = this.subtasks.reduce((sum, s) => sum + s.estimatedHours, 0);

        return {
            total,
            completed,
            pending: total - completed,
            completionPercentage,
            totalEstimatedHours
        };
    }

    /**
     * Loads from array
     * @param {Object[]} subtaskObjects - Array of plain objects
     */
    loadFromArray(subtaskObjects) {
        this.subtasks = subtaskObjects.map(obj => Subtask.fromJSON(obj));
    }

    /**
     * Converts to array
     * @returns {Object[]} Array of plain objects
     */
    toArray() {
        return this.subtasks.map(s => s.toJSON());
    }
}

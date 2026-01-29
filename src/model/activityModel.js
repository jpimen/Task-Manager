/**
 * Activity Log Model - Task Activity Tracking
 * 
 * Tracks all changes made to tasks including:
 * - Task creation, updates, deletion
 * - Status changes
 * - Assignments
 * - Comments and notes
 */

/**
 * Activity types enumeration
 */
export const ActivityType = {
    CREATED: 'created',
    UPDATED: 'updated',
    DELETED: 'deleted',
    STATUS_CHANGED: 'status_changed',
    ASSIGNED: 'assigned',
    UNASSIGNED: 'unassigned',
    COMMENTED: 'commented',
    COMPLETED: 'completed'
};

/**
 * Activity class representing a single activity log entry
 */
export class Activity {
    /**
     * Creates a new Activity instance
     * @param {Object} params - Activity parameters
     * @param {string} params.id - Unique identifier
     * @param {string} params.taskId - ID of the task
     * @param {string} params.type - Activity type
     * @param {string} params.userId - ID of user who performed the action
     * @param {string} params.description - Human-readable description
     * @param {Object} params.details - Additional details about the action
     * @param {Date} params.timestamp - When the action occurred
     */
    constructor({
        id,
        taskId,
        type,
        userId,
        description = '',
        details = {},
        timestamp = new Date()
    }) {
        this.id = id;
        this.taskId = taskId;
        this.type = type;
        this.userId = userId;
        this.description = description;
        this.details = details;
        this.timestamp = timestamp;
    }

    /**
     * Converts Activity to plain object
     * @returns {Object} Plain object representation
     */
    toJSON() {
        return {
            id: this.id,
            taskId: this.taskId,
            type: this.type,
            userId: this.userId,
            description: this.description,
            details: this.details,
            timestamp: this.timestamp instanceof Date ? this.timestamp.toISOString() : this.timestamp
        };
    }

    /**
     * Creates Activity from plain object
     * @param {Object} obj - Plain object with activity properties
     * @returns {Activity} New Activity instance
     */
    static fromJSON(obj) {
        return new Activity({
            id: obj.id,
            taskId: obj.taskId,
            type: obj.type,
            userId: obj.userId,
            description: obj.description,
            details: obj.details,
            timestamp: new Date(obj.timestamp)
        });
    }
}

/**
 * ActivityLog - Manages activity log entries
 */
export class ActivityLog {
    constructor() {
        this.activities = [];
    }

    /**
     * Logs an activity
     * @param {Activity} activity - Activity to log
     */
    logActivity(activity) {
        this.activities.push(activity);
    }

    /**
     * Gets all activities for a specific task
     * @param {string} taskId - Task ID
     * @returns {Activity[]} Activities for the task
     */
    getTaskActivities(taskId) {
        return this.activities
            .filter(a => a.taskId === taskId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Gets all activities by a specific user
     * @param {string} userId - User ID
     * @returns {Activity[]} Activities by the user
     */
    getUserActivities(userId) {
        return this.activities
            .filter(a => a.userId === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Gets all activities
     * @returns {Activity[]} All activities sorted by timestamp
     */
    getAllActivities() {
        return [...this.activities].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    /**
     * Gets activities within a date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @returns {Activity[]} Activities in the range
     */
    getActivitiesByDateRange(startDate, endDate) {
        return this.activities.filter(a => {
            const timestamp = new Date(a.timestamp);
            return timestamp >= startDate && timestamp <= endDate;
        });
    }

    /**
     * Gets recent activities
     * @param {number} count - Number of recent activities to get
     * @returns {Activity[]} Recent activities
     */
    getRecentActivities(count = 10) {
        return this.getAllActivities().slice(0, count);
    }

    /**
     * Clears activities for a specific task
     * @param {string} taskId - Task ID
     */
    clearTaskActivities(taskId) {
        this.activities = this.activities.filter(a => a.taskId !== taskId);
    }

    /**
     * Loads activities from array
     * @param {Object[]} activityObjects - Array of plain activity objects
     */
    loadFromArray(activityObjects) {
        this.activities = activityObjects.map(obj => Activity.fromJSON(obj));
    }

    /**
     * Converts to array of plain objects
     * @returns {Object[]} Array of plain objects
     */
    toArray() {
        return this.activities.map(activity => activity.toJSON());
    }
}

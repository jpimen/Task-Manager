/**
 * Analytics Service - Performance and Metrics Tracking
 * 
 * Provides analytics and insights about task management:
 * - Task completion rates
 * - Performance metrics by client
 * - Time tracking (estimated vs actual)
 * - Productivity insights
 */

export class AnalyticsService {
    /**
     * Gets task completion rate statistics
     * @param {TaskList} taskList - TaskList instance
     * @returns {Object} Completion statistics
     */
    static getCompletionStats(taskList) {
        const tasks = taskList.getAllTasks();
        const total = tasks.length;
        
        if (total === 0) {
            return {
                totalTasks: 0,
                completedTasks: 0,
                pendingTasks: 0,
                completionRate: 0,
                completionRatePercentage: '0%'
            };
        }

        const completedTasks = tasks.filter(t => t.isCompleted()).length;
        const completionRate = completedTasks / total;

        return {
            totalTasks: total,
            completedTasks,
            pendingTasks: total - completedTasks,
            completionRate: completionRate.toFixed(2),
            completionRatePercentage: Math.round(completionRate * 100) + '%'
        };
    }

    /**
     * Gets performance metrics by client
     * @param {TaskList} taskList - TaskList instance
     * @param {UserList} userList - UserList instance
     * @returns {Object[]} Performance data per client
     */
    static getClientPerformance(taskList, userList) {
        const clients = userList.getClients();
        
        return clients.map(client => {
            const clientTasks = taskList.getTasksByClient(client.id);
            const completedTasks = clientTasks.filter(t => t.isCompleted()).length;
            const totalTasks = clientTasks.length;
            const completionRate = totalTasks > 0 
                ? Math.round((completedTasks / totalTasks) * 100) 
                : 0;

            return {
                clientId: client.id,
                clientName: client.name,
                totalAssignedTasks: totalTasks,
                completedTasks,
                pendingTasks: totalTasks - completedTasks,
                completionRate,
                overdueTasks: clientTasks.filter(t => t.isOverdue()).length
            };
        });
    }

    /**
     * Gets priority distribution
     * @param {TaskList} taskList - TaskList instance
     * @returns {Object} Priority distribution
     */
    static getPriorityDistribution(taskList) {
        const tasks = taskList.getAllTasks();
        
        return {
            high: tasks.filter(t => t.priority === 'high').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            low: tasks.filter(t => t.priority === 'low').length
        };
    }

    /**
     * Gets status distribution
     * @param {TaskList} taskList - TaskList instance
     * @returns {Object} Status distribution
     */
    static getStatusDistribution(taskList) {
        const tasks = taskList.getAllTasks();
        
        return {
            pending: tasks.filter(t => t.status === 'pending').length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            completed: tasks.filter(t => t.status === 'completed').length
        };
    }

    /**
     * Gets overdue task statistics
     * @param {TaskList} taskList - TaskList instance
     * @returns {Object} Overdue statistics
     */
    static getOverdueStats(taskList) {
        const overdueTasks = taskList.getOverdueTasks();
        
        return {
            totalOverdue: overdueTasks.length,
            overduePending: overdueTasks.filter(t => t.status === 'pending').length,
            overdueInProgress: overdueTasks.filter(t => t.status === 'in_progress').length,
            byPriority: {
                high: overdueTasks.filter(t => t.priority === 'high').length,
                medium: overdueTasks.filter(t => t.priority === 'medium').length,
                low: overdueTasks.filter(t => t.priority === 'low').length
            }
        };
    }

    /**
     * Gets estimated vs actual completion time
     * @param {TaskList} taskList - TaskList instance
     * @returns {Object} Time comparison
     */
    static getTimeAnalytics(taskList) {
        const completedTasks = taskList.getAllTasks().filter(t => t.isCompleted());
        
        if (completedTasks.length === 0) {
            return {
                tasksCompleted: 0,
                averageCompletionDays: 0,
                fastestCompletion: 0,
                slowestCompletion: 0
            };
        }

        const completionTimes = completedTasks.map(task => {
            const created = new Date(task.createdAt);
            const completed = new Date(task.completedAt);
            const daysDiff = (completed - created) / (1000 * 60 * 60 * 24);
            return daysDiff;
        });

        return {
            tasksCompleted: completedTasks.length,
            averageCompletionDays: (completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length).toFixed(2),
            fastestCompletion: Math.min(...completionTimes).toFixed(2),
            slowestCompletion: Math.max(...completionTimes).toFixed(2)
        };
    }

    /**
     * Gets productivity trends over time
     * @param {TaskList} taskList - TaskList instance
     * @param {number} daysBack - Number of days to analyze
     * @returns {Object[]} Daily productivity data
     */
    static getProductivityTrend(taskList, daysBack = 30) {
        const tasks = taskList.getAllTasks();
        const today = new Date();
        const trendData = {};

        // Initialize dates
        for (let i = 0; i < daysBack; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            trendData[dateStr] = { completed: 0, created: 0 };
        }

        // Count tasks by date
        tasks.forEach(task => {
            const createdStr = new Date(task.createdAt).toISOString().split('T')[0];
            if (trendData[createdStr]) {
                trendData[createdStr].created++;
            }

            if (task.completedAt) {
                const completedStr = new Date(task.completedAt).toISOString().split('T')[0];
                if (trendData[completedStr]) {
                    trendData[completedStr].completed++;
                }
            }
        });

        // Convert to array and sort by date
        return Object.entries(trendData)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    /**
     * Gets comprehensive dashboard summary
     * @param {TaskList} taskList - TaskList instance
     * @param {UserList} userList - UserList instance
     * @returns {Object} Complete summary
     */
    static getDashboardSummary(taskList, userList) {
        return {
            completion: this.getCompletionStats(taskList),
            status: this.getStatusDistribution(taskList),
            priority: this.getPriorityDistribution(taskList),
            overdue: this.getOverdueStats(taskList),
            timeAnalytics: this.getTimeAnalytics(taskList),
            clientPerformance: this.getClientPerformance(taskList, userList),
            productivity: this.getProductivityTrend(taskList, 7)
        };
    }
}

const KEYS = {
    USER_STATS: "ssc_gd_user_stats",
    SETTINGS: "ssc_gd_settings",
    EXAM_HISTORY: "ssc_gd_exam_history"
};

export const getSettings = () => {
    try {
        return JSON.parse(localStorage.getItem(KEYS.SETTINGS)) || { apiKey: "" };
    } catch {
        return { apiKey: "" };
    }
};

export const saveSettings = (settings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const getUserStats = () => {
    try {
        return JSON.parse(localStorage.getItem(KEYS.USER_STATS)) || {
            overallAccuracy: 0,
            topicStats: {}, // { "Topic Name": { correct: 10, total: 15, accuracy: 66.6 } }
            weakTopics: [],
            strongTopics: []
        };
    } catch {
        return { overallAccuracy: 0, topicStats: {}, weakTopics: [], strongTopics: [] };
    }
};

export const saveUserStats = (stats) => {
    localStorage.setItem(KEYS.USER_STATS, JSON.stringify(stats));
};

export const updateTopicStats = (results) => {
    const currentStats = getUserStats();

    results.forEach(({ topic, isCorrect }) => {
        if (!currentStats.topicStats[topic]) {
            currentStats.topicStats[topic] = { correct: 0, total: 0, accuracy: 0 };
        }

        currentStats.topicStats[topic].total += 1;
        if (isCorrect) currentStats.topicStats[topic].correct += 1;

        const { correct, total } = currentStats.topicStats[topic];
        currentStats.topicStats[topic].accuracy = (correct / total) * 100;
    });

    // Re-calculate weak/strong topics
    currentStats.weakTopics = Object.keys(currentStats.topicStats).filter(
        t => currentStats.topicStats[t].accuracy < 60
    );
    currentStats.strongTopics = Object.keys(currentStats.topicStats).filter(
        t => currentStats.topicStats[t].accuracy >= 80
    );

    // Calculate overall accuracy
    let totalCorrect = 0;
    let totalAttempted = 0;
    Object.values(currentStats.topicStats).forEach(s => {
        totalCorrect += s.correct;
        totalAttempted += s.total;
    });
    currentStats.overallAccuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

    saveUserStats(currentStats);
    return currentStats;
};

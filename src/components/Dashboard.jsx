import React, { useState, useEffect } from 'react';
import { Play, Target, BookOpen, AlertCircle, CheckCircle, Brain } from 'lucide-react';
import { getUserStats, getSettings } from '../utils/storage';
import { useExamStore } from '../store/useExamStore';

const Dashboard = () => {
    const [stats, setStats] = useState(getUserStats());
    const { startExam } = useExamStore();
    const [drillMode, setDrillMode] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [count, setCount] = useState(10);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setStats(getUserStats());
    }, []);

    const handleStartExam = async (type, subjectArg, topicArg, countArg) => {
        const settings = getSettings();
        const apiKey = settings.apiKey;

        if (!apiKey) {
            alert("Please set your Gemini API Key in Settings first!");
            return;
        }

        setLoading(true);
        let finalSubject = subjectArg;
        let finalTopic = topicArg;
        const difficulty = "Medium"; // Default, or logic to adapt

        if (type === 'full') {
            finalSubject = "General Knowledge & Reasoning"; // Simplified for prototype
            finalTopic = "Mixed Patterns";
            countArg = 20; // Prototype size
        } else if (type === 'weakness') {
            if (stats.weakTopics.length === 0) {
                alert("No weak topics identifying yet! Take a test first.");
                setLoading(false);
                return;
            }
            finalSubject = "Mixed"; // Or infer from topic
            // Pick a random weak topic
            finalTopic = stats.weakTopics[Math.floor(Math.random() * stats.weakTopics.length)];
            countArg = 10;
        }

        await startExam(finalSubject, finalTopic, difficulty, countArg, apiKey);
        setLoading(false);
    };

    if (drillMode) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-2">
                    <button onClick={() => setDrillMode(false)} className="text-gray-500 hover:text-blue-600">
                        &larr; Back to Dashboard
                    </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Subject Drill</h2>

                <div className="bg-white p-6 rounded-lg shadow-md space-y-4 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <select
                            className="w-full px-3 py-2 border rounded-md"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option value="">Select Subject</option>
                            <option value="General Intelligence & Reasoning">General Intelligence & Reasoning</option>
                            <option value="General Knowledge & Awareness">General Knowledge & Awareness</option>
                            <option value="Elementary Mathematics">Elementary Mathematics</option>
                            <option value="English/Hindi">English/Hindi</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="e.g. Percentage, Blood Relations, Rivers of India..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                        <input
                            type="number"
                            min="5" max="50"
                            className="w-full px-3 py-2 border rounded-md"
                            value={count}
                            onChange={(e) => setCount(parseInt(e.target.value))}
                        />
                    </div>

                    <button
                        disabled={!selectedSubject || !topic || loading}
                        onClick={() => handleStartExam('drill', selectedSubject, topic, count)}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {loading ? 'Generating Questions...' : (
                            <>
                                <Play className="w-4 h-4" /> Start Drill
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Overview */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                        <Target className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Overall Accuracy</h3>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{stats.overallAccuracy.toFixed(1)}%</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="flex items-center gap-2 text-gray-700 font-semibold mb-4 border-b pb-2">
                        <CheckCircle className="w-5 h-5 text-green-500" /> Strong Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {stats.strongTopics.length > 0 ? stats.strongTopics.map((t) => (
                            <span key={t} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                {t}
                            </span>
                        )) : <span className="text-gray-400 text-sm">No strong topics yet. Keep practicing!</span>}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="flex items-center gap-2 text-gray-700 font-semibold mb-4 border-b pb-2">
                        <AlertCircle className="w-5 h-5 text-red-500" /> Weak Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {stats.weakTopics.length > 0 ? stats.weakTopics.map((t) => (
                            <span key={t} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                {t}
                            </span>
                        )) : <span className="text-gray-400 text-sm">No weak topics found. Good job!</span>}
                    </div>
                </div>
            </section>

            {/* Action Buttons */}
            <section>
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-indigo-600" /> Start Practice
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                        onClick={() => handleStartExam('full')}
                        disabled={loading}
                        className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all text-left"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Play className="w-24 h-24" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Start Full Mock</h3>
                        <p className="opacity-90 text-sm">Standard 20 Qs pattern mix. Test your readiness.</p>
                        {loading && <div className="absolute inset-0 bg-black/20 flex items-center justify-center">Generating...</div>}
                    </button>

                    <button
                        onClick={() => handleStartExam('weakness')}
                        disabled={loading}
                        className="group bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:border-red-300 hover:shadow-md transition-all text-left"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Fix Weakness</h3>
                        </div>
                        <p className="text-gray-500 text-sm">Auto-generates questions from your lowest accuracy topics.</p>
                    </button>

                    <button
                        onClick={() => setDrillMode(true)}
                        disabled={loading}
                        className="group bg-white border border-gray-200 p-8 rounded-2xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all text-left"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Subject Drill</h3>
                        </div>
                        <p className="text-gray-500 text-sm">Select specific subject and topic to master.</p>
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;

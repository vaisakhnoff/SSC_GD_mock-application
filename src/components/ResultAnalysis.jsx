import React from 'react';
import { useExamStore } from '../store/useExamStore';
import { updateTopicStats } from '../utils/storage';

const ResultAnalysis = () => {
    const { score, resultAnalysis, resetExam, questions } = useExamStore();

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                <h2 className="text-3xl font-bold mb-4">Exam Results</h2>
                <div className="text-5xl font-bold text-blue-600 mb-2">{score.toFixed(2)}</div>
                <p className="text-gray-500">Your Score</p>

                <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{resultAnalysis?.correctCount || 0}</div>
                        <div className="text-xs uppercase text-green-800">Correct</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{resultAnalysis?.wrongCount || 0}</div>
                        <div className="text-xs uppercase text-red-800">Wrong</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-600">{resultAnalysis?.skipped || 0}</div>
                        <div className="text-xs uppercase text-gray-800">Skipped</div>
                    </div>
                </div>

                <button
                    onClick={resetExam}
                    className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Back to Dashboard
                </button>
            </div>

            {/* Detailed Analysis */}
            {resultAnalysis?.analysis && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold">Detailed Solutions</h3>
                    {resultAnalysis.analysis.map((item, idx) => {
                        // Re-hydrate question data from store's questions array
                        const q = questions.find(qu => qu.id === item.id) || {};

                        return (
                            <div key={idx} className={`p-4 rounded-lg border ${item.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                                <p className="font-medium mb-2">Q{idx + 1}. {q.question || "Question data unavailable"}</p>
                                <p className="text-sm">Your Answer: {item.selectedOption !== undefined ? q.options?.[item.selectedOption] : 'Skipped'}</p>
                                <p className="text-sm font-bold mt-1">Correct Answer: {q.options?.[q.correctIndex]}</p>
                                <p className="text-xs text-gray-600 mt-2 bg-white p-2 rounded">{q.explanation}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ResultAnalysis;

import React, { useEffect } from 'react';
import { useExamStore } from '../store/useExamStore';
import { Clock, Menu, ChevronLeft, ChevronRight, Flag, Monitor } from 'lucide-react';
import clsx from 'clsx';

const ExamInterface = () => {
    const {
        questions, currentQuestionIndex, answers, markedForReview, visitStatus, timer,
        nextQuestion, prevQuestion, setAnswer, clearAnswer, toggleMarkForReview, jumpToQuestion, submitExam, tickTimer, resetExam
    } = useExamStore();

    useEffect(() => {
        const interval = setInterval(() => {
            tickTimer();
        }, 1000);
        return () => clearInterval(interval);
    }, [tickTimer]);

    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return <div className="p-10 text-center">Loading Question...</div>;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleQuit = () => {
        if (confirm("Are you sure you want to quit? Your progress will be lost.")) {
            resetExam();
        }
    };

    const getPaletteColor = (q, idx) => {
        if (idx === currentQuestionIndex) return 'ring-2 ring-blue-500 ring-offset-2'; // highlight current
        // Determine status
        if (Array.isArray(markedForReview) && markedForReview.includes(q.id)) return 'bg-purple-600 text-white';
        if (answers[q.id] !== undefined) return 'bg-green-600 text-white';
        if (visitStatus[q.id] === 'visited') return 'bg-red-500 text-white'; // Visited but not answered
        return 'bg-white border text-gray-700'; // Not visited
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] md:flex-row gap-4">
            {/* Left Panel: Question */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                {/* Header: Timer & Subject */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div className="font-bold text-gray-700">Section: {currentQ.topic}</div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xl font-mono font-bold text-blue-800 bg-white px-3 py-1 rounded shadow-sm">
                            <Clock className="w-5 h-5 text-gray-500" />
                            {formatTime(timer)}
                        </div>
                        <button
                            onClick={handleQuit}
                            className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded border border-red-200"
                        >
                            <Menu className="w-4 h-4" /> Quit
                        </button>
                    </div>
                </div>

                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex gap-4">
                        <span className="font-bold text-gray-500">Q.{currentQuestionIndex + 1}</span>
                        <div className="space-y-6 flex-1">
                            <p className="text-lg font-medium text-gray-800 leading-relaxed">{currentQ.question}</p>

                            <div className="space-y-3">
                                {currentQ.options.map((opt, idx) => (
                                    <label
                                        key={idx}
                                        className={clsx(
                                            "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50",
                                            answers[currentQ.id] === idx ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${currentQ.id}`}
                                            checked={answers[currentQ.id] === idx}
                                            onChange={() => setAnswer(currentQ.id, idx)}
                                            className="w-5 h-5 text-blue-600"
                                        />
                                        <span className="text-gray-700">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer: Controls */}
                <div className="p-4 border-t bg-gray-50 flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex gap-2">
                        <button
                            onClick={() => toggleMarkForReview(currentQ.id)}
                            className={clsx(
                                "px-4 py-2 text-sm font-medium rounded-md border flex items-center gap-2",
                                Array.isArray(markedForReview) && markedForReview.includes(currentQ.id)
                                    ? "bg-purple-100 text-purple-800 border-purple-300"
                                    : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                            )}
                        >
                            <Flag className="w-4 h-4" /> Mark for Review
                        </button>
                        <button
                            onClick={() => clearAnswer(currentQ.id)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white hover:bg-gray-100 rounded-md border"
                        >
                            Clear Response
                        </button>
                    </div>

                    <div className="flex gap-2">
                        {currentQuestionIndex > 0 && (
                            <button
                                onClick={prevQuestion}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white hover:bg-gray-100 rounded-md border"
                            >
                                Previous
                            </button>
                        )}
                        <button
                            onClick={nextQuestion}
                            className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm"
                        >
                            Save & Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel: Palette */}
            <div className="w-full md:w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-2 font-bold text-gray-700">
                        <Monitor className="w-5 h-5" /> Question Palette
                    </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((q, idx) => (
                            <button
                                key={q.id}
                                onClick={() => jumpToQuestion(idx)}
                                className={clsx(
                                    "h-10 w-10 rounded-md flex items-center justify-center text-sm font-medium transition-all",
                                    getPaletteColor(q, idx)
                                )}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-8 grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-600 rounded"></div> Answered</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded"></div> Not Answered</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-600 rounded"></div> Marked</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-gray-300 rounded"></div> Not Visited</div>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50">
                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to submit the exam?")) {
                                submitExam();
                            }
                        }}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all"
                    >
                        Submit Test
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamInterface;

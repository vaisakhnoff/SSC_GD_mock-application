import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateQuestions } from '../services/AIService';
import { updateTopicStats } from '../utils/storage';

const QUESTIONS_CACHE_KEY = 'ssc_gd_questions_data';

export const useExamStore = create(
    persist(
        (set, get) => ({
            questions: (() => {
                try {
                    return JSON.parse(localStorage.getItem(QUESTIONS_CACHE_KEY)) || [];
                } catch {
                    return [];
                }
            })(),
            currentQuestionIndex: 0,
            answers: {}, // { questionId: selectedOptionIndex }
            markedForReview: [],
            visitStatus: {},
            timer: 0,
            examStatus: 'idle',
            examConfig: { subject: '', topic: '', mode: 'full' },
            score: 0,
            resultAnalysis: null,

            // Actions
            setExamConfig: (config) => set({ examConfig: { ...get().examConfig, ...config } }),

            startExam: async (subject, topic, difficulty, count, apiKey) => {
                set({ examStatus: 'loading', questions: [], answers: {}, markedForReview: [], currentQuestionIndex: 0, resultAnalysis: null });

                const questions = await generateQuestions(subject, topic, difficulty, count, apiKey);

                // Manual Cache for Performance
                localStorage.setItem(QUESTIONS_CACHE_KEY, JSON.stringify(questions));

                set({
                    questions,
                    examStatus: 'active',
                    timer: count * 45
                });
            },

            setAnswer: (questionId, optionIndex) => set((state) => ({
                answers: { ...state.answers, [questionId]: optionIndex },
                visitStatus: { ...state.visitStatus, [questionId]: 'answered' }
            })),

            clearAnswer: (questionId) => set((state) => {
                const newAnswers = { ...state.answers };
                delete newAnswers[questionId];
                return { answers: newAnswers, visitStatus: { ...state.visitStatus, [questionId]: 'visited' } };
            }),

            toggleMarkForReview: (questionId) => set((state) => {
                const currentList = Array.from(state.markedForReview || []);
                const idx = currentList.indexOf(questionId);
                let newList;
                if (idx >= 0) {
                    newList = currentList.filter(id => id !== questionId);
                } else {
                    newList = [...currentList, questionId];
                }
                return { markedForReview: newList };
            }),

            jumpToQuestion: (index) => set((state) => ({ currentQuestionIndex: index })),

            nextQuestion: () => set((state) => {
                if (state.currentQuestionIndex < state.questions.length - 1) {
                    return { currentQuestionIndex: state.currentQuestionIndex + 1 };
                }
                return {};
            }),

            prevQuestion: () => set((state) => {
                if (state.currentQuestionIndex > 0) {
                    return { currentQuestionIndex: state.currentQuestionIndex - 1 };
                }
                return {};
            }),

            tickTimer: () => set((state) => {
                if (state.timer > 0 && state.examStatus === 'active') {
                    return { timer: state.timer - 1 };
                } else if (state.timer === 0 && state.examStatus === 'active') {
                    get().submitExam();
                    return {};
                }
                return {};
            }),

            submitExam: () => {
                const { questions, answers } = get();
                let correctCount = 0;
                let wrongCount = 0;
                const analysis = [];

                questions.forEach((q) => {
                    const selected = answers[q.id];
                    const isCorrect = selected !== undefined && selected === q.correctIndex;
                    if (selected !== undefined) {
                        if (isCorrect) correctCount++;
                        else wrongCount++;
                    }

                    // Lightweight analysis: Store ONLY what's needed for logic, NOT the full question
                    analysis.push({
                        id: q.id,
                        selectedOption: selected,
                        isCorrect,
                        isSkipped: selected === undefined
                    });
                });

                const score = (correctCount * 2) - (wrongCount * 0.25);

                updateTopicStats(questions.map((q, i) => ({
                    topic: q.topic,
                    isCorrect: analysis[i].isCorrect
                })));

                set({
                    examStatus: 'finished',
                    score,
                    resultAnalysis: { correctCount, wrongCount, skipped: questions.length - (correctCount + wrongCount), analysis },
                    timer: 0
                });
            },

            resetExam: () => {
                localStorage.removeItem(QUESTIONS_CACHE_KEY);
                set({ examStatus: 'idle', questions: [], answers: {}, currentQuestionIndex: 0, markedForReview: [], resultAnalysis: null });
            }
        }),
        {
            name: 'ssc-gd-exam-storage',
            partialize: (state) => ({
                // EXCLUDE 'questions' from auto-persistence to speed up 'Next'/'Submit'
                currentQuestionIndex: state.currentQuestionIndex,
                answers: state.answers,
                markedForReview: state.markedForReview,
                visitStatus: state.visitStatus,
                examStatus: state.examStatus,
                resultAnalysis: state.resultAnalysis
            }),
        }
    )
);

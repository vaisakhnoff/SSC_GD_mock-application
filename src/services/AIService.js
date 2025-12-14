

const FALLBACK_QUESTIONS = [
    {
        id: "fallback-1",
        question: "The river Ganga originates from which glacier?",
        options: ["Gangotri", "Yamunotri", "Siachen", "Pindari"],
        correctIndex: 0,
        explanation: "The Ganga originates from the Gangotri glacier in Uttarakhand.",
        topic: "General Knowledge"
    },
    {
        id: "fallback-2",
        question: "If Rahul buys a shirt for ₹500 and sells it for ₹550, what is his profit percentage?",
        options: ["10%", "15%", "20%", "5%"],
        correctIndex: 0,
        explanation: "Profit = 550 - 500 = ₹50. Profit % = (50/500) * 100 = 10%.",
        topic: "Elementary Mathematics"
    },
    {
        id: "fallback-3",
        question: "Which pattern series correctly completes: 2, 5, 10, 17, ?",
        options: ["24", "26", "25", "27"],
        correctIndex: 1,
        explanation: "The pattern is n^2 + 1. 1^2+1=2, 2^2+1=5... 5^2+1=26.",
        topic: "General Intelligence & Reasoning"
    },
    {
        id: "fallback-4",
        question: "Select the synonym of 'ABANDON'.",
        options: ["Keep", "Forsake", "Cherish", "Enlarge"],
        correctIndex: 1,
        explanation: "Abandon means to leave or forsake.",
        topic: "English/Hindi"
    },
    {
        id: "fallback-5",
        question: "Who was the first President of India?",
        options: ["Jawaharlal Nehru", "Dr. Rajendra Prasad", "B.R. Ambedkar", "Sardar Patel"],
        correctIndex: 1,
        explanation: "Dr. Rajendra Prasad was the first President of India.",
        topic: "General Knowledge"
    }
];

// Helper to delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateQuestions = async (subject, topic, difficulty, count, apiKey) => {
    console.log("Generating questions via Groq...", { subject, topic, count, hasKey: !!apiKey });
    if (!apiKey) {
        console.warn("No API Key provided, using fallback questions.");
        return FALLBACK_QUESTIONS.slice(0, count);
    }

    const prompt = `
      You are an expert SSC GD & Government Exam Question Setter. 
      Generate ${count} high-quality unique ${subject} questions on the topic '${topic}'.
      
      Strict Constraints:
      1. LANGUAGE: All questions, options, and explanations must be in PURE ENGLISH.
      2. CONTEXT: Use INDIAN Context strictly. 
         - Currency: Use Rupees (₹) instead of Dollars ($).
         - Names: Use Indian names (e.g., Rahul, Priya, Amit).
         - Places: Use Indian cities/states (e.g., Delhi, Mumbai, Bihar).
      3. SOURCE: Base on Previous Year Questions (PYQs) from SSC GD, CGL, CHSL, Railway (2018-2025).
      4. PATTERN: Exact SSC GD and other government exams pattern. Options must be tricky and realistic.
      5. DIFFICULTY: ${difficulty}.

      Return a STRICT JSON ARRAY of objects (start with '[' and end with ']'): 
      [
        {
          "id": "unique_id",
          "question": "Question text in English",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctIndex": 0-3 (integer),
          "explanation": "Detailed explanation in English.",
          "topic": "${topic}"
        }
      ]
      
      Ensure strict JSON syntax. No markdown.
    `;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey.trim()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant that generates mock exam questions in strict JSON format."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: "llama-3.3-70b-versatile", // Updated to supported model
                temperature: 0.7,
                stream: false,
                response_format: { type: "json_object" } // Force JSON mode
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Groq API Error: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        console.log("Groq Raw Response:", content);

        if (!content) throw new Error("No content received from Groq");

        // Clean up text if needed (though json_object mode should be clean)
        let questions;
        try {
            const parsed = JSON.parse(content);

            if (Array.isArray(parsed)) {
                questions = parsed;
            } else if (parsed.questions && Array.isArray(parsed.questions)) {
                questions = parsed.questions;
            } else if (parsed.question && Array.isArray(parsed.options)) {
                // Determine if it's a single question object
                questions = [parsed];
            } else {
                // Try to find an array of objects in values, but be careful not to pick internal arrays like 'options'
                const possibleArray = Object.values(parsed).find(v => Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0].question);
                if (possibleArray) {
                    questions = possibleArray;
                } else {
                    throw new Error("Could not extract questions array from response");
                }
            }
        } catch (e) {
            console.error("JSON Parse/Validation Error:", e);
            throw new Error("Invalid structure from AI");
        }

        if (!Array.isArray(questions)) {
            throw new Error("AI did not return an array of questions.");
        }

        // Validate content
        if (questions.some(q => !q.options || !Array.isArray(q.options))) {
            throw new Error("Validation Failed: Missing options in generated questions.");
        }

        return questions.slice(0, count);

    } catch (error) {
        console.error("AI Generation Failed:", error);
        alert(`AI Generation Failed: ${error.message}`);
        return FALLBACK_QUESTIONS.slice(0, count);
    }
};

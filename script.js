document.addEventListener('DOMContentLoaded', () => {
    // App State
    let state = {
        name: '',
        rollno: '',
        questions: [],
        chapters: [],
        currentChapter: null,
        chapterMode: '',
        currentQuestionIndex: 0,
        score: {
            correct: 0,
            wrong: 0
        },
        theme: 'dark'
    };

    // DOM Elements
    const screens = {
        splash: document.getElementById('splash-screen'),
        input: document.getElementById('input-screen'),
        options: document.getElementById('options-screen'),
        chapter: document.getElementById('chapter-screen'),
        faq: document.getElementById('faq-screen'),
        quiz: document.getElementById('quiz-screen'),
        result: document.getElementById('result-screen')
    };

    const userForm = document.getElementById('user-form');
    const themeToggle = document.getElementById('theme-toggle');
    const faqContainer = document.getElementById('faq-container');
    const chapterContainer = document.getElementById('chapter-container');
    const optionsContainer = document.getElementById('options-container');
    const feedbackContainer = document.getElementById('feedback-container');
    const quizProgressBar = document.getElementById('quiz-progress-bar');

    // 1. Initial Data Load
    loadData();

    // Splash Intro Logic
    setTimeout(() => {
        showScreen('input');
    }, 3000);

    // 2. User Input Logic
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameVal = document.getElementById('name').value;
        const rollVal = document.getElementById('rollno').value;

        if (/^\d+$/.test(rollVal)) {
            state.name = nameVal;
            state.rollno = rollVal;
            document.getElementById('display-name').textContent = state.name;
            showScreen('options');
        } else {
            document.getElementById('rollno-error').classList.remove('d-none');
        }
    });

    // 3. Navigation
    document.getElementById('btn-start-quiz').addEventListener('click', () => {
        state.chapterMode = 'quiz';
        const titleEl = document.getElementById('chapter-selection-title');
        if(titleEl) titleEl.textContent = "Select Quiz Chapter";
        showScreen('chapter');
    });

    document.getElementById('btn-read-questions').addEventListener('click', () => {
        state.chapterMode = 'faq';
        const titleEl = document.getElementById('chapter-selection-title');
        if(titleEl) titleEl.textContent = "Select Short Questions";
        showScreen('chapter');
    });

    document.querySelectorAll('.btn-back, .btn-back-main').forEach(btn => {
        btn.addEventListener('click', () => showScreen('options'));
    });

    document.querySelectorAll('.btn-back-chapter').forEach(btn => {
        btn.addEventListener('click', () => showScreen('chapter'));
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
        startQuiz();
    });

    // 4. Chapter & FAQ Logic (Short Questions)
    function renderChapters() {
        if (!chapterContainer) return;
        chapterContainer.innerHTML = '';
        if (!state.chapters || state.chapters.length === 0) {
            chapterContainer.innerHTML = '<p class="text-center p-5 w-100">No chapters found.</p>';
            return;
        }

        const icons = ['fa-globe', 'fa-code', 'fa-paint-brush', 'fa-layer-group', 'fa-file-code', 'fa-sitemap', 'fa-bolt', 'fa-react', 'fa-node-js', 'fa-database', 'fa-rocket'];

        state.chapters.forEach((chapter, index) => {
            const col = document.createElement('div');
            col.className = 'col-6 col-md-4 col-lg-3';
            
            const iconClass = icons[index % icons.length];
            
            col.innerHTML = `
                <div class="chapter-card h-100">
                    <i class="fas ${iconClass}"></i>
                    <span class="chapter-title">${chapter.title}</span>
                </div>
            `;
            
            col.addEventListener('click', () => {
                state.currentChapter = chapter;
                if (state.chapterMode === 'faq') {
                    document.getElementById('faq-chapter-title').textContent = chapter.title;
                    renderFAQs(chapter.faqs);
                    showScreen('faq');
                } else if (state.chapterMode === 'quiz') {
                    startQuiz(chapter);
                }
            });
            
            chapterContainer.appendChild(col);
        });
    }

    function renderFAQs(faqsArray) {
        faqContainer.innerHTML = '';
        if (!faqsArray || faqsArray.length === 0) {
            faqContainer.innerHTML = '<p class="text-center p-5 w-100">No questions found in this chapter.</p>';
            return;
        }
        
        faqsArray.forEach((faq, index) => {
            const item = document.createElement('div');
            item.className = 'faq-item';
            
            // Clean render of FAQ layout
            item.innerHTML = `
                <div class="faq-header" id="faq-header-${index}">
                    <h5 class="m-0">${faq.question}</h5>
                    <i class="fas fa-plus faq-icon"></i>
                </div>
                <div class="faq-answer" id="faq-answer-${index}">
                    <p class="mt-3 mb-0 text-muted">${faq.answer}</p>
                </div>
            `;
            
            faqContainer.appendChild(item);
            
            // Attach event listener directly to the newly created element
            const header = document.getElementById(`faq-header-${index}`);
            header.addEventListener('click', () => togglerFAQ(index, item));
        });
    }

    function togglerFAQ(index, clickedItem) {
        const answer = clickedItem.querySelector('.faq-answer');
        const isOpen = answer.classList.contains('show');

        // Close all other FAQs
        document.querySelectorAll('.faq-answer').forEach(ans => ans.classList.remove('show'));
        document.querySelectorAll('.faq-item').forEach(it => it.classList.remove('active'));

        // Toggle the clicked one
        if (!isOpen) {
            answer.classList.add('show');
            clickedItem.classList.add('active');
        }
    }

    // 5. Quiz Logic (MCQs)
    function startQuiz(chapter = null) {
        if (chapter) {
            state.questions = chapter.mcqs;
        } else if (!state.questions.length && state.currentChapter) {
            state.questions = state.currentChapter.mcqs;
        }
        state.currentQuestionIndex = 0;
        state.score.correct = 0;
        state.score.wrong = 0;
        document.getElementById('quiz-student-name').textContent = state.name;
        showScreen('quiz');
        showQuestion(); // Required modular function name
    }

    function showQuestion() {
        if (state.currentQuestionIndex >= 30 || state.currentQuestionIndex >= state.questions.length) {
            showResults();
            return;
        }

        const q = state.questions[state.currentQuestionIndex];
        
        document.getElementById('current-q').textContent = state.currentQuestionIndex + 1;
        document.getElementById('total-q').textContent = Math.min(30, state.questions.length);
        document.getElementById('question-text').textContent = q.question;
        
        // Progress bar smooth transition
        const progress = ((state.currentQuestionIndex) / 30) * 100;
        quizProgressBar.style.width = `${progress}%`;

        optionsContainer.innerHTML = '';
        q.options.forEach((opt, idx) => {
            const col = document.createElement('div');
            col.className = 'col-md-6';
            col.innerHTML = `
                <button class="option-btn" data-index="${idx}">${opt}</button>
            `;
            const btn = col.querySelector('.option-btn');
            btn.addEventListener('click', () => handleAnswer(idx, btn));
            optionsContainer.appendChild(col);
        });

        feedbackContainer.classList.add('d-none');
        feedbackContainer.innerHTML = ''; // Clear previous feedback entirely including loader
    }

    function handleAnswer(selectedIndex, clickedBtn) {
        // Disable all option buttons immediately
        const allBtns = optionsContainer.querySelectorAll('.option-btn');
        allBtns.forEach(b => b.disabled = true);
        
        // Add styling for selected state (violet glow)
        clickedBtn.classList.add('selected');
        
        // Show subtle loading effect briefly
        feedbackContainer.classList.remove('d-none');
        feedbackContainer.innerHTML = '<div class="spinner-border text-gold my-3" role="status" style="width: 1.5rem; height: 1.5rem;"><span class="visually-hidden">Loading...</span></div>';

        setTimeout(() => {
            const q = state.questions[state.currentQuestionIndex];
            const isCorrect = selectedIndex === q.answer;
            
            // Remove spinner and selection state
            clickedBtn.classList.remove('selected');
            
            if (isCorrect) {
                state.score.correct++;
                clickedBtn.classList.add('correct'); // Highlights Green
                showFeedback('Correct! Well done.', 'text-success');
            } else {
                state.score.wrong++;
                clickedBtn.classList.add('wrong'); // Highlights Red
                // Automatically highlight the correct answer
                if(allBtns[q.answer]) {
                    allBtns[q.answer].classList.add('correct');
                }
                showFeedback('Wrong Answer.', 'text-danger');
            }

            // Load next question quickly
            setTimeout(() => {
                state.currentQuestionIndex++;
                showQuestion();
            }, 800); 

        }, 400); // Wait just 400ms before showing result
    }

    function showFeedback(text, colorClass) {
        feedbackContainer.innerHTML = `<h4 class="fw-bold p-3 rounded-pill d-inline-block" style="background: rgba(255,255,255,0.05);"><span class="${colorClass}">${text}</span></h4>`;
    }

    // 6. Result Logic
    function showResults() {
        showScreen('result');
        document.getElementById('result-name').textContent = state.name;
        document.getElementById('result-roll').textContent = state.rollno;
        document.getElementById('result-correct').textContent = state.score.correct;
        document.getElementById('result-wrong').textContent = state.score.wrong;
        
        const percent = Math.round((state.score.correct / 30) * 100);
        document.getElementById('percentage-text').textContent = `${percent}%`;
    }

    // Helpers
    function showScreen(screenId) {
        Object.values(screens).forEach(screen => {
            if (screen) screen.classList.add('d-none');
        });
        
        if (screens[screenId]) {
            screens[screenId].classList.remove('d-none');
            // Trigger reflow for animation
            void screens[screenId].offsetWidth;
            screens[screenId].style.opacity = 0;
            screens[screenId].style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                screens[screenId].style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                screens[screenId].style.opacity = 1;
                screens[screenId].style.transform = 'translateY(0)';
            }, 10);
        }
    }

    function loadData() {
        try {
            if (typeof quizData !== 'undefined') {
                state.questions = quizData.mcqs;
                state.chapters = quizData.chapters;
            } else {
                throw new Error("quizData is not defined");
            }
            
            // Render chapters initially
            renderChapters();
            
        } catch (err) {
            console.error("Failed to load local data:", err);
            faqContainer.innerHTML = '<p class="text-center p-5 text-danger">Failed to load local quiz data.</p>';
            if(chapterContainer) chapterContainer.innerHTML = '<p class="text-center p-5 text-danger w-100">Failed to load local quiz data.</p>';
        }
    }

    // Theme Toggle Logic
    themeToggle.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', state.theme);
        const icon = themeToggle.querySelector('i');
        icon.className = state.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    });
});

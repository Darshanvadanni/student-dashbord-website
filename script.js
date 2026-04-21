class StudySmart {
    constructor() {
        this.assignments = [];
        this.exams = [];
        this.studySessions = [];
        this.streak = 0;
        this.lastStudyDate = null;
        this.pomodoroCount = 0;
        this.timerInterval = null;
        this.timeLeft = 25 * 60;
        this.currentMode = 'pomodoro';
        this.currentTipIndex = 0;
        this.studyChart = null;
        
        this.loadData();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.render();
        this.updateStreak();
        this.initChart();
        this.startTipRotation();
    }
    
    loadData() {
        // Load assignments
        const savedAssignments = localStorage.getItem('studysmart_assignments');
        if (savedAssignments) {
            this.assignments = JSON.parse(savedAssignments);
        } else {
            // Sample data
            this.assignments = [
                { id: 1, title: "Math Assignment", subject: "Mathematics", dueDate: this.getFutureDate(3), priority: "high", completed: false, createdAt: new Date().toISOString() },
                { id: 2, title: "Physics Lab Report", subject: "Physics", dueDate: this.getFutureDate(5), priority: "medium", completed: false, createdAt: new Date().toISOString() },
                { id: 3, title: "Programming Project", subject: "Computer Science", dueDate: this.getFutureDate(7), priority: "high", completed: false, createdAt: new Date().toISOString() }
            ];
        }
        
        // Load exams
        const savedExams = localStorage.getItem('studysmart_exams');
        if (savedExams) {
            this.exams = JSON.parse(savedExams);
        } else {
            this.exams = [
                { id: 1, title: "Mid-Term Exams", date: this.getFutureDate(14), importance: "high" },
                { id: 2, title: "Final Project Submission", date: this.getFutureDate(30), importance: "high" }
            ];
        }
        
        // Load study sessions
        const savedSessions = localStorage.getItem('studysmart_sessions');
        if (savedSessions) {
            this.studySessions = JSON.parse(savedSessions);
        } else {
            this.studySessions = [];
        }
        
        // Load streak
        const savedStreak = localStorage.getItem('studysmart_streak');
        if (savedStreak) {
            this.streak = parseInt(savedStreak);
        }
        
        const savedLastDate = localStorage.getItem('studysmart_lastdate');
        if (savedLastDate) {
            this.lastStudyDate = savedLastDate;
        }
        
        const savedPomodoro = localStorage.getItem('studysmart_pomodoro');
        if (savedPomodoro) {
            this.pomodoroCount = parseInt(savedPomodoro);
        }
    }
    
    saveData() {
        localStorage.setItem('studysmart_assignments', JSON.stringify(this.assignments));
        localStorage.setItem('studysmart_exams', JSON.stringify(this.exams));
        localStorage.setItem('studysmart_sessions', JSON.stringify(this.studySessions));
        localStorage.setItem('studysmart_streak', this.streak.toString());
        localStorage.setItem('studysmart_lastdate', this.lastStudyDate || '');
        localStorage.setItem('studysmart_pomodoro', this.pomodoroCount.toString());
    }
    
    getFutureDate(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = btn.getAttribute('data-page');
                this.switchPage(page);
            });
        });
        
        // Assignment modal
        const addAssignmentBtn = document.getElementById('addAssignmentBtn');
        if (addAssignmentBtn) {
            addAssignmentBtn.addEventListener('click', () => this.openModal('assignment'));
        }
        
        const assignmentForm = document.getElementById('assignmentForm');
        if (assignmentForm) {
            assignmentForm.addEventListener('submit', (e) => this.addAssignment(e));
        }
        
        // Exam modal
        const addExamBtn = document.getElementById('addExamBtn');
        if (addExamBtn) {
            addExamBtn.addEventListener('click', () => this.openModal('exam'));
        }
        
        const examForm = document.getElementById('examForm');
        if (examForm) {
            examForm.addEventListener('submit', (e) => this.addExam(e));
        }
        
        // Timer
        const startTimer = document.getElementById('startTimer');
        if (startTimer) startTimer.addEventListener('click', () => this.startTimer());
        
        const pauseTimer = document.getElementById('pauseTimer');
        if (pauseTimer) pauseTimer.addEventListener('click', () => this.pauseTimer());
        
        const resetTimer = document.getElementById('resetTimer');
        if (resetTimer) resetTimer.addEventListener('click', () => this.resetTimer());
        
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                this.switchMode(mode);
            });
        });
        
        // GPA Calculator
        const convertCgpa = document.getElementById('convertCgpa');
        if (convertCgpa) convertCgpa.addEventListener('click', () => this.convertCgpa());
        
        const calculateGrade = document.getElementById('calculateGrade');
        if (calculateGrade) calculateGrade.addEventListener('click', () => this.calculateGrade());
        
        // GPA type buttons
        document.querySelectorAll('.gpa-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type');
                this.switchGpaType(type);
            });
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.filterAssignments(filter);
            });
        });
        
        // Focus mode
        const enableFocusMode = document.getElementById('enableFocusMode');
        if (enableFocusMode) enableFocusMode.addEventListener('click', () => this.enableFocusMode());
        
        // Quotes
        const newQuoteBtn = document.getElementById('newQuoteBtn');
        if (newQuoteBtn) newQuoteBtn.addEventListener('click', () => this.getRandomQuote());
        
        const nextTip = document.getElementById('nextTip');
        if (nextTip) nextTip.addEventListener('click', () => this.nextTip());
        
        // Close modals
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', () => this.closeModal());
        });
        
        // Click outside modal to close
        window.addEventListener('click', (e) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
    
    switchPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        
        // Show selected page
        const targetPage = document.getElementById(`${page}Page`);
        if (targetPage) targetPage.classList.add('active');
        
        // Update nav active state
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-page') === page) {
                btn.classList.add('active');
            }
        });
        
        // Update chart if dashboard
        if (page === 'dashboard') {
            this.updateChart();
        }
    }
    
    openModal(type) {
        const modalId = type === 'assignment' ? 'assignmentModal' : 'examModal';
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'block';
    }
    
    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    addAssignment(e) {
        e.preventDefault();
        
        const title = document.getElementById('assignmentTitle').value;
        const subject = document.getElementById('assignmentSubject').value;
        const dueDate = document.getElementById('assignmentDueDate').value;
        const priority = document.getElementById('assignmentPriority').value;
        
        if (!title || !dueDate) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }
        
        const assignment = {
            id: Date.now(),
            title: title,
            subject: subject,
            dueDate: dueDate,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.assignments.push(assignment);
        this.saveData();
        this.closeModal();
        this.renderAssignments();
        this.renderDashboard();
        this.showNotification(`✅ Assignment "${title}" added!`, 'success');
        
        // Reset form
        document.getElementById('assignmentForm').reset();
    }
    
    addExam(e) {
        e.preventDefault();
        
        const title = document.getElementById('examTitle').value;
        const date = document.getElementById('examDate').value;
        const importance = document.getElementById('examImportance').value;
        
        if (!title || !date) {
            this.showNotification('Please fill all required fields', 'error');
            return;
        }
        
        const exam = {
            id: Date.now(),
            title: title,
            date: date,
            importance: importance
        };
        
        this.exams.push(exam);
        this.saveData();
        this.closeModal();
        this.renderExams();
        this.renderDashboard();
        this.showNotification(`📚 Exam "${title}" added! Start preparing!`, 'success');
        
        // Reset form
        document.getElementById('examForm').reset();
    }
    
    completeAssignment(id) {
        const assignment = this.assignments.find(a => a.id === id);
        if (assignment && !assignment.completed) {
            assignment.completed = true;
            this.saveData();
            this.renderAssignments();
            this.renderDashboard();
            this.addStudySession(30);
            this.showNotification(`🎉 Great job! Completed "${assignment.title}"`, 'success');
        }
    }
    
    deleteAssignment(id) {
        if (confirm('Are you sure you want to delete this assignment?')) {
            this.assignments = this.assignments.filter(a => a.id !== id);
            this.saveData();
            this.renderAssignments();
            this.renderDashboard();
            this.showNotification('Assignment deleted', 'info');
        }
    }
    
    deleteExam(id) {
        if (confirm('Are you sure you want to delete this exam?')) {
            this.exams = this.exams.filter(e => e.id !== id);
            this.saveData();
            this.renderExams();
            this.renderDashboard();
            this.showNotification('Exam deleted', 'info');
        }
    }
    
    addStudySession(minutes) {
        this.studySessions.push({
            date: new Date().toISOString(),
            minutes: minutes
        });
        
        // Update streak
        const today = new Date().toDateString();
        if (this.lastStudyDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toDateString();
            
            if (this.lastStudyDate === yesterdayString) {
                this.streak++;
            } else {
                this.streak = 1;
            }
            this.lastStudyDate = today;
        }
        
        this.saveData();
        this.updateStreak();
        this.updateChart();
        this.renderDashboard();
    }
    
    updateStreak() {
        const streakElement = document.getElementById('streakCount');
        if (streakElement) streakElement.textContent = this.streak;
    }
    
    // Timer Functions
    startTimer() {
        if (this.timerInterval) return;
        
        this.timerInterval = setInterval(() => {
            if (this.timeLeft <= 0) {
                this.completeTimer();
            } else {
                this.timeLeft--;
                this.updateTimerDisplay();
            }
        }, 1000);
    }
    
    pauseTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    resetTimer() {
        this.pauseTimer();
        this.setModeTime(this.currentMode);
        this.updateTimerDisplay();
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        this.pauseTimer();
        this.setModeTime(mode);
        this.updateTimerDisplay();
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-mode') === mode) {
                btn.classList.add('active');
            }
        });
    }
    
    setModeTime(mode) {
        switch(mode) {
            case 'pomodoro':
                this.timeLeft = 25 * 60;
                break;
            case 'shortBreak':
                this.timeLeft = 5 * 60;
                break;
            case 'longBreak':
                this.timeLeft = 15 * 60;
                break;
        }
    }
    
    completeTimer() {
        this.pauseTimer();
        
        if (this.currentMode === 'pomodoro') {
            this.pomodoroCount++;
            const pomodoroElement = document.getElementById('pomodoroCount');
            if (pomodoroElement) pomodoroElement.textContent = this.pomodoroCount;
            this.addStudySession(25);
            this.showNotification('🍅 Pomodoro completed! Take a break!', 'success');
            this.playNotificationSound();
        } else {
            this.showNotification('☕ Break finished! Ready to study?', 'info');
        }
        
        this.resetTimer();
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        
        if (minutesElement) minutesElement.textContent = String(minutes).padStart(2, '0');
        if (secondsElement) secondsElement.textContent = String(seconds).padStart(2, '0');
    }
    
    playNotificationSound() {
        // Simple beep using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 880;
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            setTimeout(() => {
                oscillator.stop();
            }, 500);
        } catch(e) {
            console.log('Sound not supported');
        }
    }
    
    // GPA Calculator
    convertCgpa() {
        const cgpaInput = document.getElementById('cgpaInput');
        if (!cgpaInput) return;
        
        const cgpa = parseFloat(cgpaInput.value);
        const resultDiv = document.getElementById('cgpaResult');
        
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) {
            resultDiv.innerHTML = '❌ Please enter a valid CGPA (0-10)';
            return;
        }
        
        const percentage = (cgpa * 9.5).toFixed(2);
        const grade = this.getGrade(percentage);
        resultDiv.innerHTML = `
            <strong>📊 Results:</strong><br>
            ${cgpa} CGPA = ${percentage}%<br>
            🎓 Grade: ${grade}
        `;
    }
    
    calculateGrade() {
        const marksInput = document.getElementById('marksInput');
        if (!marksInput) return;
        
        const marks = parseFloat(marksInput.value);
        const resultDiv = document.getElementById('gradeResult');
        
        if (isNaN(marks) || marks < 0 || marks > 100) {
            resultDiv.innerHTML = '❌ Please enter valid marks (0-100)';
            return;
        }
        
        const grade = this.getGrade(marks);
        const points = this.getGradePoints(marks);
        resultDiv.innerHTML = `
            <strong>📊 Results:</strong><br>
            📝 Marks: ${marks}%<br>
            🎓 Grade: ${grade}<br>
            ⭐ Grade Points: ${points}
        `;
    }
    
    getGrade(percentage) {
        if (percentage >= 90) return 'A+ (Outstanding)';
        if (percentage >= 80) return 'A (Excellent)';
        if (percentage >= 70) return 'B+ (Very Good)';
        if (percentage >= 60) return 'B (Good)';
        if (percentage >= 50) return 'C+ (Average)';
        if (percentage >= 40) return 'C (Pass)';
        return 'F (Need Improvement)';
    }
    
    getGradePoints(percentage) {
        if (percentage >= 90) return 10;
        if (percentage >= 80) return 9;
        if (percentage >= 70) return 8;
        if (percentage >= 60) return 7;
        if (percentage >= 50) return 6;
        if (percentage >= 40) return 5;
        return 0;
    }
    
    switchGpaType(type) {
        document.querySelectorAll('.calc-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${type}Calc`);
        if (targetSection) targetSection.classList.add('active');
        
        document.querySelectorAll('.gpa-type-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-type') === type) {
                btn.classList.add('active');
            }
        });
    }
    
    // Render Functions
    render() {
        this.renderDashboard();
        this.renderAssignments();
        this.renderExams();
    }
    
    renderDashboard() {
        const pending = this.assignments.filter(a => !a.completed).length;
        const todayDate = new Date().toISOString().split('T')[0];
        const todayDue = this.assignments.filter(a => !a.completed && a.dueDate === todayDate).length;
        const totalMinutes = this.studySessions.reduce((sum, s) => sum + s.minutes, 0);
        const totalHours = (totalMinutes / 60).toFixed(1);
        const upcomingExams = this.exams.filter(e => new Date(e.date) > new Date()).length;
        
        const pendingElement = document.getElementById('pendingAssignments');
        const todayElement = document.getElementById('todayTasks');
        const hoursElement = document.getElementById('totalStudyHours');
        const examsElement = document.getElementById('upcomingExams');
        
        if (pendingElement) pendingElement.textContent = pending;
        if (todayElement) todayElement.textContent = todayDue;
        if (hoursElement) hoursElement.textContent = totalHours;
        if (examsElement) examsElement.textContent = upcomingExams;
        
        // Today's tasks
        const todayTasks = this.assignments.filter(a => !a.completed && a.dueDate === todayDate);
        const tasksContainer = document.getElementById('todayTasksList');
        
        if (tasksContainer) {
            if (todayTasks.length > 0) {
                tasksContainer.innerHTML = todayTasks.map(task => `
                    <div class="task-item">
                        <div>
                            <strong>${this.escapeHtml(task.title)}</strong><br>
                            <small>📚 ${task.subject}</small>
                        </div>
                        <div class="task-priority priority-${task.priority}">
                            ${task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                        </div>
                    </div>
                `).join('');
            } else {
                tasksContainer.innerHTML = '<p style="text-align:center;padding:20px;">🎉 No tasks due today! Relax or study ahead!</p>';
            }
        }
    }
    
    renderAssignments(filter = 'all') {
        let filtered = [...this.assignments];
        
        if (filter === 'pending') filtered = filtered.filter(a => !a.completed);
        else if (filter === 'completed') filtered = filtered.filter(a => a.completed);
        else if (filter === 'overdue') filtered = filtered.filter(a => !a.completed && new Date(a.dueDate) < new Date());
        
        const container = document.getElementById('assignmentsList');
        if (!container) return;
        
        if (filtered.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:40px;">📭 No assignments found!</div>';
            return;
        }
        
        container.innerHTML = filtered.map(assignment => {
            const isOverdue = !assignment.completed && new Date(assignment.dueDate) < new Date();
            const daysLeft = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 3600 * 24));
            
            return `
                <div class="task-item">
                    <div style="flex:1;">
                        <strong>${this.escapeHtml(assignment.title)}</strong><br>
                        <small>📚 ${assignment.subject}</small><br>
                        <small>📅 Due: ${assignment.dueDate} ${isOverdue ? '⚠️ Overdue!' : `(${daysLeft} days left)`}</small>
                    </div>
                    <div style="text-align:right;">
                        <div class="task-priority priority-${assignment.priority}">
                            ${assignment.priority === 'high' ? '🔴 High' : assignment.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                        </div>
                        ${!assignment.completed ? `
                            <button onclick="studySmart.completeAssignment(${assignment.id})" style="margin-top:5px;padding:5px 10px;background:#10b981;color:white;border:none;border-radius:5px;cursor:pointer;">✅ Complete</button>
                        ` : '<span style="color:green;">✓ Completed</span>'}
                        <button onclick="studySmart.deleteAssignment(${assignment.id})" style="margin-top:5px;padding:5px 10px;background:#ef4444;color:white;border:none;border-radius:5px;cursor:pointer;">🗑️ Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    filterAssignments(filter) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            }
        });
        this.renderAssignments(filter);
    }
    
    renderExams() {
        const container = document.getElementById('examsList');
        if (!container) return;
        
        const sorted = [...this.exams].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        if (sorted.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:40px;">📅 No exams added yet!</div>';
            return;
        }
        
        container.innerHTML = sorted.map(exam => {
            const examDate = new Date(exam.date);
            const today = new Date();
            const daysLeft = Math.ceil((examDate - today) / (1000 * 3600 * 24));
            const isUrgent = daysLeft <= 7 && daysLeft > 0;
            const isOverdue = daysLeft < 0;
            
            let countdownText = '';
            if (isOverdue) countdownText = '📅 Exam passed';
            else if (daysLeft === 0) countdownText = '🔥 TODAY!';
            else countdownText = `${daysLeft} days left`;
            
            return `
                <div class="exam-card" style="border-left: 5px solid ${isUrgent ? '#dc2626' : '#667eea'}">
                    <h3>${this.escapeHtml(exam.title)}</h3>
                    <p>📅 ${exam.date}</p>
                    <div class="exam-countdown" style="font-size:24px;font-weight:bold;color:${isUrgent ? '#dc2626' : '#667eea'};">
                        ${countdownText}
                    </div>
                    ${isUrgent ? '<p style="color:#dc2626;margin-top:10px;">⚠️ Urgent! Start preparing!</p>' : ''}
                    <button onclick="studySmart.deleteExam(${exam.id})" style="margin-top:10px;padding:5px 10px;background:#ef4444;color:white;border:none;border-radius:5px;cursor:pointer;">🗑️ Delete</button>
                </div>
            `;
        }).join('');
    }
    
    deleteExam(id) {
        if (confirm('Delete this exam?')) {
            this.exams = this.exams.filter(e => e.id !== id);
            this.saveData();
            this.renderExams();
            this.renderDashboard();
            this.showNotification('Exam deleted', 'info');
        }
    }
    
    // Chart
    initChart() {
        const canvas = document.getElementById('studyChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        this.studyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Study Hours',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        this.updateChart();
    }
    
    updateChart() {
        if (!this.studyChart) return;
        
        // Get last 7 days of study data
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const hoursData = days.map((day, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));
            const dateStr = date.toISOString().split('T')[0];
            
            const totalMinutes = this.studySessions
                .filter(s => s.date.split('T')[0] === dateStr)
                .reduce((sum, s) => sum + s.minutes, 0);
            
            return +(totalMinutes / 60).toFixed(1);
        });
        
        this.studyChart.data.datasets[0].data = hoursData;
        this.studyChart.update();
    }
    
    // Quotes and Tips
    getRandomQuote() {
        const quotes = [
            '"The expert in anything was once a beginner." - Helen Hayes',
            '"Success is the sum of small efforts, repeated day in and day out." - Robert Collier',
            '"Don\'t watch the clock; do what it does. Keep going." - Sam Levenson',
            '"The future depends on what you do today." - Mahatma Gandhi',
            '"Study while others are sleeping; work while others are loafing." - William Arthur Ward',
            '"Education is the most powerful weapon which you can use to change the world." - Nelson Mandela',
            '"The beautiful thing about learning is that no one can take it away from you." - B.B. King'
        ];
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const quoteElement = document.getElementById('dailyQuote');
        if (quoteElement) quoteElement.textContent = randomQuote;
    }
    
    startTipRotation() {
        this.nextTip();
        // Rotate tip every 10 seconds
        setInterval(() => this.nextTip(), 10000);
    }
    
    nextTip() {
        const tips = [
            '💡 Use active recall - test yourself instead of just reading!',
            '💡 Study in 25-minute Pomodoro sessions for better focus',
            '💡 Teach others what you learn - it reinforces your understanding',
            '💡 Take handwritten notes for better retention than typing',
            '💡 Get 7-8 hours of sleep - it improves memory consolidation',
            '💡 Exercise before studying - it increases blood flow to the brain',
            '💡 Use the Feynman Technique: Explain it simply, like teaching a child',
            '💡 Space out your studying over days, not hours (Spaced Repetition)'
        ];
        
        this.currentTipIndex = (this.currentTipIndex + 1) % tips.length;
        const activeTip = document.querySelector('.tip.active');
        const nextTipElement = document.querySelector(`.tip:nth-child(${this.currentTipIndex + 1})`);
        
        if (activeTip && nextTipElement) {
            activeTip.classList.remove('active');
            nextTipElement.classList.add('active');
        } else {
            const firstTip = document.querySelector('.tip');
            if (firstTip) firstTip.classList.add('active');
        }
    }
    
    // Focus Mode
    enableFocusMode() {
        const checkedSites = document.querySelectorAll('.blocked-sites input:checked');
        const sites = Array.from(checkedSites).map(cb => cb.value);
        
        if (sites.length === 0) {
            this.showNotification('Please select at least one site to block', 'error');
            return;
        }
        
        this.showNotification(`🔒 Focus mode enabled! ${sites.length} sites will be blocked during study time`, 'success');
        
        // In a real extension, this would block sites
        // For demo, we'll just show a warning
        setTimeout(() => {
            this.showNotification('Remember: Stay focused! You can do this! 💪', 'info');
        }, 2000);
    }
    
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

// Initialize the app
let studySmart;
document.addEventListener('DOMContentLoaded', () => {
    studySmart = new StudySmart();
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
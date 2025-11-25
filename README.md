# **Engineering English Coach 🚀**

## ***Create by Gemini 3 Pro***

A specialized Spaced Repetition System (SRS) designed for software engineers to master technical English sentence patterns.
Unlike traditional flashcards that only test vocabulary, this app uses a **Sentence Builder** approach. You must reconstruct full sentences from scrambled words, training your brain on **sentence structure**, **grammar**, and **contextual usage** relevant to Pull Requests, code reviews, and daily stand-ups.

## **✨ Features**

### **🧠 Core Learning Engine**

* **SuperMemo-2 (SM-2) Algorithm**: scientifically calculates the optimal review interval for each card based on your performance.
* **Sentence Construction**: Drag-and-drop word selection interface to build sentences actively (Active Recall).
* **Context-First**: Every card starts with a real-world engineering scenario (e.g., "PR Review", "System Design") before testing you.

### **⚡ Auto-Grading System**

The app automatically rates your performance to reduce decision fatigue:

* **Timer & Mistake Tracking**: Measures how fast and accurately you build the sentence.
* **Smart Suggestions**:
  * **Easy**: Fast & flawless (\< 2.5s per word).
  * **Good**: Correct but took some thought.
  * **Hard**: Made mistakes during construction.
  * **Forgot**: Gave up and viewed the answer.

### **🛠️ Technical Highlights**

* **Zero Backend**: All progress is saved locally in your browser's localStorage (Privacy-first).
* **Dark Mode UI**: Designed for engineers, by engineers.
* **Responsive**: Works on desktop and mobile.

## **🛠 Tech Stack**

* **Runtime/Package Manager**: [Bun](https://bun.sh/)
* **Framework**: React 18 \+ TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **Icons**: Lucide React

## **🚀 Getting Started**

### **Prerequisites**

* [Bun](https://bun.sh/) installed on your machine.

### **Installation**

1. Clone the repository:
   git clone \[https://github.com/KunYi/engineering-english-coach.git\](https://github.com/KunYi/engineering-english-coach.git)
   cd engineering-english-coach

2. Install dependencies:
   bun install

3. Start the development server:
   bun run dev

4. Open your browser at http://localhost:5173.

## **📖 Usage Guide**

1. **Start a Session**: The app loads cards due for review today.
2. **Read the Scenario**: Understand *when* to use the phrase (e.g., "Disagreeing politely in a code review").
3. **Build the Sentence**: Tap the words at the bottom to construct the target sentence.
   * *Tap a selected word to remove it if you make a mistake.*
4. **Check Answer**:
   * If correct, the system suggests a rating (Easy/Good/Hard).
   * If incorrect, try again or choose "Give Up" to learn the correct pattern.
5. **Review**: Cards rated "Hard" appear sooner (e.g., 2 days); cards rated "Easy" appear later (e.g., 7 days).

## **📂 Project Structure**

```
src/
├── App.tsx          \# Main application logic & UI
├── index.css        \# Tailwind directives
├── main.tsx         \# Entry point
└── ...
```

* **Data Source**: The sentence deck is currently defined in INITIAL\_DECKS within App.tsx.
* **State Management**: React useState \+ localStorage for persistence.

## **🤝 Contributing**

1. Fork the Project
2. Create your Feature Branch (git checkout \-b feature/AmazingFeature)
3. Commit your Changes (git commit \-m 'Add some AmazingFeature')
4. Push to the Branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## **📄 License**

Distributed under the MIT License. See LICENSE for more information.

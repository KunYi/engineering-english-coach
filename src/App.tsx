import { useState, useEffect } from 'react';
import { CheckCircle, RotateCcw, Brain, Check, X } from 'lucide-react';

// --- 1. 定義型別介面 (TypeScript Interfaces) ---

interface Card {
  id: string;
  pattern: string;
  meaning: string;
  scenario: string;
  example: string;
  interval: number;
  repetition: number;
  efactor: number;
  dueDate: number;
}

interface Word {
  id: string;
  text: string;
}

// --- 2. 靜態資料庫 (Seed Data) ---

const INITIAL_DECKS: Card[] = [
  {
    id: '1',
    pattern: "LGTM ... once ...",
    meaning: "看起來沒問題，一旦...就...",
    scenario: "PR Review / 同意合併",
    example: "LGTM! I'll merge this once the CI passes.",
    interval: 0, repetition: 0, efactor: 2.5, dueDate: Date.now()
  },
  {
    id: '2',
    pattern: "Nit: ...",
    meaning: "小建議/吹毛求疵",
    scenario: "Review Code，提出非必要的小修改",
    example: "Nit: consistent indentation here would be nice.",
    interval: 0, repetition: 0, efactor: 2.5, dueDate: Date.now()
  },
  {
    id: '3',
    pattern: "Let's sync up",
    meaning: "我們對焦/討論一下",
    scenario: "Slack/會議，提議進行簡短討論",
    example: "This is complex so let's sync up offline.",
    interval: 0, repetition: 0, efactor: 2.5, dueDate: Date.now()
  },
  {
    id: '4',
    pattern: "Workaround",
    meaning: "變通方法 / 權宜之計",
    scenario: "無法完美解決 Bug 時的暫時解法",
    example: "It is a temporary workaround until we fix the root cause.",
    interval: 0, repetition: 0, efactor: 2.5, dueDate: Date.now()
  },
  {
    id: '5',
    pattern: "Deprecate",
    meaning: "廢棄 / 不再建議使用",
    scenario: "標記舊 API 或功能即將移除",
    example: "We plan to deprecate the v1 API by next quarter.",
    interval: 0, repetition: 0, efactor: 2.5, dueDate: Date.now()
  },
  {
    id: '6',
    pattern: "Showstopper",
    meaning: "阻礙進度的重大問題",
    scenario: "Bug 嚴重到必須立即停止發布",
    example: "The crash on login is a showstopper for the release.",
    interval: 0, repetition: 0, efactor: 2.5, dueDate: Date.now()
  },
  {
    id: '7',
    pattern: "Bottleneck",
    meaning: "瓶頸",
    scenario: "效能分析，指出系統變慢的環節",
    example: "Database I/O is the main bottleneck currently.",
    interval: 0, repetition: 0, efactor: 2.5, dueDate: Date.now()
  },
  {
    id: '8',
    pattern: "Edge case",
    meaning: "邊緣情況 / 極端案例",
    scenario: "測試時考慮不常見的輸入狀況",
    example: "Did you handle the edge case where the list is empty?",
    interval: 0, repetition: 0, efactor: 2.5, dueDate: Date.now()
  },
  {
    id: '9',
    pattern: "Tech debt",
    meaning: "技術債",
    scenario: "為了快速發布而犧牲程式碼品質",
    example: "We need a sprint to pay down some tech debt.",
    interval: 0, repetition: 0, efactor: 2.5, dueDate: Date.now()
  },
  {
    id: '10',
    pattern: "Reproduce",
    meaning: "重現 (Bug)",
    scenario: "QA 或開發者嘗試觸發同樣的錯誤",
    example: "I can't reproduce this bug on my local machine.",
    interval: 0, repetition: 0, efactor: 2.5, dueDate: Date.now()
  }
];

// --- 3. SuperMemo-2 演算法邏輯 ---
const calculateNextReview = (card: Card, grade: number): Card => {
  let { interval, repetition, efactor } = card;

  if (grade >= 3) {
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * efactor);

    repetition += 1;
    efactor = efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (efactor < 1.3) efactor = 1.3;
  } else {
    repetition = 0;
    interval = 1;
  }

  const nextDueDate = Date.now() + interval * 24 * 60 * 60 * 1000;
  return { ...card, interval, repetition, efactor, dueDate: nextDueDate };
};

// --- Helper: Shuffle Array (泛型) ---
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- Helper: Tokenize Sentence ---
const tokenizeSentence = (sentence: string): Word[] => {
  return sentence.split(' ').map((word, index) => ({
    id: `word-${index}`,
    text: word,
  }));
};

export default function App() {
  // 加上型別參數 <Card[]> 解決 useState([]) 推斷為 never[] 的問題
  const [cards, setCards] = useState<Card[]>([]);
  const [dueCards, setDueCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // State for Sentence Builder Interaction
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedWords, setSelectedWords] = useState<Word[]>([]);
  const [availableWords, setAvailableWords] = useState<Word[]>([]);
  const [checkResult, setCheckResult] = useState<'correct' | 'incorrect' | null>(null);

  const [view, setView] = useState<'loading' | 'empty' | 'review'>('loading');

  // 初始化
  useEffect(() => {
    const savedData = localStorage.getItem('eng_cards_v4');
    let loadedCards: Card[] = [];
    if (savedData) {
      loadedCards = JSON.parse(savedData);
    } else {
      loadedCards = INITIAL_DECKS;
    }
    setCards(loadedCards);
    checkDueCards(loadedCards);
  }, []);

  const checkDueCards = (allCards: Card[]) => {
    const now = Date.now();
    const due = allCards.filter(c => c.dueDate <= now);
    setDueCards(due);

    if (due.length > 0) {
      setView('review');
      // 注意：這裡如果不加判斷，可能會有 index out of bounds，雖然邏輯上 due.length > 0 即可
      prepareCard(due[0]);
    } else {
      setView('empty');
    }
  };

  const prepareCard = (card: Card) => {
    const tokens = tokenizeSentence(card.example);
    setAvailableWords(shuffleArray(tokens));
    setSelectedWords([]);
    setCheckResult(null);
    setShowAnswer(false);
  };

  useEffect(() => {
    if (dueCards.length > 0 && currentCardIndex < dueCards.length) {
      prepareCard(dueCards[currentCardIndex]);
    }
  }, [currentCardIndex, dueCards]);

  const handleWordSelect = (wordObj: Word) => {
    if (checkResult === 'correct') return;
    setAvailableWords(prev => prev.filter(w => w.id !== wordObj.id));
    setSelectedWords(prev => [...prev, wordObj]);
    setCheckResult(null);
  };

  const handleWordDeselect = (wordObj: Word) => {
    if (checkResult === 'correct') return;
    setSelectedWords(prev => prev.filter(w => w.id !== wordObj.id));
    setAvailableWords(prev => [...prev, wordObj]);
    setCheckResult(null);
  };

  const handleCheckAnswer = () => {
    const card = dueCards[currentCardIndex];
    const userSentence = selectedWords.map(w => w.text).join(' ');

    if (userSentence.trim() === card.example.trim()) {
      setCheckResult('correct');
      setShowAnswer(true);
    } else {
      setCheckResult('incorrect');
    }
  };

  const handleGrade = (grade: number) => {
    const currentCard = dueCards[currentCardIndex];
    const updatedCard = calculateNextReview(currentCard, grade);

    const newAllCards = cards.map(c => c.id === updatedCard.id ? updatedCard : c);
    setCards(newAllCards);
    localStorage.setItem('eng_cards_v4', JSON.stringify(newAllCards));

    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      checkDueCards(newAllCards);
      setCurrentCardIndex(0);
    }
  };

  const resetProgress = () => {
    if(confirm("Are you sure? This will wipe your progress.")) {
      localStorage.removeItem('eng_cards_v4');
      window.location.reload();
    }
  };

  // --- UI Components ---

  const DashboardStats = () => {
    const total = cards.length;
    const learned = cards.filter(c => c.repetition > 0).length;
    const mastery = total > 0 ? Math.round((learned / total) * 100) : 0;

    return (
      <div className="grid grid-cols-3 gap-4 mb-8 w-full max-w-md">
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
          <div className="text-2xl font-bold text-white">{total}</div>
          <div className="text-xs text-slate-400">Sentences</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
          <div className="text-2xl font-bold text-green-400">{learned}</div>
          <div className="text-xs text-slate-400">Learned</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
          <div className="text-2xl font-bold text-blue-400">{mastery}%</div>
          <div className="text-xs text-slate-400">Mastery</div>
        </div>
      </div>
    );
  };

  if (view === 'empty') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-6 font-sans">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">All Caught Up!</h1>
          <p className="text-slate-400 mb-8">
            Excellent work! You've practiced all your sentence structures for today.
          </p>
          <DashboardStats />
          <button onClick={resetProgress} className="mt-12 text-xs text-red-900/50 hover:text-red-500 flex items-center justify-center mx-auto gap-1">
            <RotateCcw size={12} /> Reset Progress
          </button>
        </div>
      </div>
    );
  }

  if (view === 'review' && dueCards.length > 0) {
    const card = dueCards[currentCardIndex];

    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center p-4 pt-8 font-sans">

        {/* Header */}
        <div className="w-full max-w-2xl flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-2 text-blue-400 font-bold tracking-tight">
            <Brain size={20} />
            <span>SENTENCE_BUILDER_v1</span>
          </div>
          <div className="text-sm font-mono text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            {currentCardIndex + 1} / {dueCards.length}
          </div>
        </div>

        {/* Main Interface */}
        <div className="w-full max-w-2xl space-y-4">

          {/* 1. Context / Scenario Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center shadow-lg">
             <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase bg-slate-800 rounded-md mb-3 border border-slate-700">
                Scenario
              </span>
            <p className="text-lg text-slate-300 mb-2">{card.scenario}</p>
            <p className="text-sm text-slate-500 italic">Target Meaning: {card.meaning}</p>
          </div>

          {/* 2. Construction Area (Where user builds the sentence) */}
          <div
            className={`min-h-[120px] bg-slate-950 border-2 border-dashed rounded-xl p-4 flex flex-wrap content-start gap-2 transition-colors duration-300
              ${checkResult === 'correct' ? 'border-green-500/50 bg-green-900/10' :
                checkResult === 'incorrect' ? 'border-red-500/50 bg-red-900/10' : 'border-slate-700 hover:border-slate-600'}
            `}
          >
            {selectedWords.length === 0 && (
              <div className="w-full h-full flex items-center justify-center text-slate-600 pointer-events-none select-none">
                Tap words below to build the sentence...
              </div>
            )}

            {selectedWords.map((word) => (
              <button
                key={word.id}
                onClick={() => handleWordDeselect(word)}
                className="bg-slate-800 hover:bg-red-900/30 text-slate-200 px-3 py-2 rounded-lg border border-slate-700 shadow-sm transition-all text-lg font-medium animate-in zoom-in-95 duration-100"
              >
                {word.text}
              </button>
            ))}
          </div>

          {/* 3. Feedback Message */}
          <div className="h-8 flex items-center justify-center">
            {checkResult === 'incorrect' && (
              <span className="text-red-400 text-sm font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-2">
                <X size={14}/> Try again. Structure doesn't match.
              </span>
            )}
             {checkResult === 'correct' && (
              <span className="text-green-400 text-sm font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-2">
                <Check size={14}/> Perfect Match!
              </span>
            )}
          </div>

          {/* 4. Word Bank (Source) */}
          <div className="bg-slate-900/50 rounded-xl p-6 flex flex-wrap justify-center gap-3 min-h-[100px]">
             {availableWords.map((word) => (
              <button
                key={word.id}
                onClick={() => handleWordSelect(word)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-lg font-medium"
              >
                {word.text}
              </button>
            ))}

            {availableWords.length === 0 && !showAnswer && (
               <button
                 onClick={handleCheckAnswer}
                 className="bg-green-600 hover:bg-green-500 text-white px-8 py-2 rounded-full font-bold shadow-lg shadow-green-900/20 transition-all hover:scale-105 flex items-center gap-2"
               >
                 Check Sentence <CheckCircle size={18}/>
               </button>
            )}
          </div>

          {/* 5. Reveal & Grading Controls */}
          {(!showAnswer) ? (
            <div className="flex justify-center pt-4">
               <button
                 onClick={() => setShowAnswer(true)}
                 className="text-slate-500 text-sm hover:text-slate-300 underline flex items-center gap-1"
               >
                 I give up, show me the answer
               </button>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
               <div className="text-center mb-6">
                 <p className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">Correct Pattern</p>
                 <p className="text-xl font-mono text-white bg-black/30 p-4 rounded-lg border border-slate-700 inline-block">
                   {card.example}
                 </p>
               </div>

               <div className="grid grid-cols-4 gap-3">
                  <button onClick={() => handleGrade(0)} className="p-3 rounded-xl bg-red-900/20 border border-red-900/50 text-red-200 hover:bg-red-900/40 transition-colors">
                    <div className="font-bold text-sm">Forgot</div>
                    <div className="text-[10px] opacity-60">Reset</div>
                  </button>
                  <button onClick={() => handleGrade(3)} className="p-3 rounded-xl bg-orange-900/20 border border-orange-900/50 text-orange-200 hover:bg-orange-900/40 transition-colors">
                    <div className="font-bold text-sm">Hard</div>
                    <div className="text-[10px] opacity-60">2d</div>
                  </button>
                  <button onClick={() => handleGrade(4)} className="p-3 rounded-xl bg-blue-900/20 border border-blue-900/50 text-blue-200 hover:bg-blue-900/40 transition-colors">
                    <div className="font-bold text-sm">Good</div>
                    <div className="text-[10px] opacity-60">4d</div>
                  </button>
                  <button onClick={() => handleGrade(5)} className="p-3 rounded-xl bg-green-900/20 border border-green-900/50 text-green-200 hover:bg-green-900/40 transition-colors">
                    <div className="font-bold text-sm">Easy</div>
                    <div className="text-[10px] opacity-60">7d</div>
                  </button>
               </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Initializing Sentence Matrix...</div>;
}

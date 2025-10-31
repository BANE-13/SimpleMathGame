import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from './types';
import { TOTAL_ROUNDS, POINTS_PER_CORRECT_ANSWER } from './constants';
import { CorrectIcon, IncorrectIcon } from './components/Icons';

const generateRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('start');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [round, setRound] = useState(1);
    const [numbers, setNumbers] = useState<number[]>([]);
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
    const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);
    const [systemMessage, setSystemMessage] = useState<string>('숫자 버튼 중 하나를 선택하세요.');
    const [playerInput, setPlayerInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        const savedHighScore = localStorage.getItem('number_game_highscore');
        if (savedHighScore) {
            setHighScore(parseInt(savedHighScore, 10));
        }
    }, []);

    const startNewRound = useCallback(() => {
        const uniqueNumbers = new Set<number>();
        while (uniqueNumbers.size < 4) {
            uniqueNumbers.add(generateRandomNumber(1, 10));
        }
        setNumbers(Array.from(uniqueNumbers));
        setSelectedNumber(null);
        setCorrectAnswer(null);
        setPlayerInput('');
        setFeedback(null);
        setIsChecking(false);
        setSystemMessage('숫자 버튼 중 하나를 선택하세요.');
    }, []);

    const handleStartGame = () => {
        setScore(0);
        setRound(1);
        setGameState('playing');
        startNewRound();
    };

    const handleRetry = () => {
        setGameState('start');
    };

    const handleNumberSelect = (num: number) => {
        if (selectedNumber !== null) return;

        setSelectedNumber(num);
        const modifier = generateRandomNumber(-10, 10);
        const answer = num + modifier;
        setCorrectAnswer(answer);

        if (modifier > 0) {
            setSystemMessage(`${num}에 ${modifier}을(를) 더하면 얼마일까요?`);
        } else if (modifier < 0) {
            setSystemMessage(`${num}에서 ${Math.abs(modifier)}을(를) 빼면 얼마일까요?`);
        } else {
            setSystemMessage(`${num}에 변화가 없다면 얼마일까요?`);
        }
    };

    const handleCheckAnswer = () => {
        if (isChecking || playerInput === '') return;

        setIsChecking(true);
        const playerAnswer = parseInt(playerInput, 10);

        if (playerAnswer === correctAnswer) {
            setFeedback('correct');
            setScore(prev => prev + POINTS_PER_CORRECT_ANSWER);
        } else {
            setFeedback('incorrect');
        }

        setTimeout(() => {
            if (round === TOTAL_ROUNDS) {
                const finalScore = playerAnswer === correctAnswer ? score + POINTS_PER_CORRECT_ANSWER : score;
                const newHighScore = Math.max(highScore, finalScore);
                setHighScore(newHighScore);
                localStorage.setItem('number_game_highscore', newHighScore.toString());
                setGameState('result');
            } else {
                setRound(prev => prev + 1);
                startNewRound();
            }
        }, 1500);
    };

    const renderStartScreen = () => (
        <div className="text-center text-white animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-pixel mb-4">Number Ops</h1>
            <h2 className="text-2xl md:text-3xl mb-8">숫자 연산 게임</h2>
            <button
                onClick={handleStartGame}
                className="font-pixel bg-blue-500 hover:bg-blue-600 text-white text-xl md:text-2xl font-bold py-4 px-10 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
            >
                START
            </button>
        </div>
    );
    
    const renderGameScreen = () => (
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-4 text-white">
                <h2 className="text-2xl md:text-3xl font-pixel">SCORE: {score}</h2>
                <h2 className="text-2xl md:text-3xl font-pixel">ROUND: {round}/{TOTAL_ROUNDS}</h2>
            </div>
            
            <div className="bg-black bg-opacity-30 p-6 rounded-xl shadow-lg min-h-[350px] md:min-h-[400px] flex flex-col justify-between">
                <div className="flex-grow flex items-center justify-center">
                    {feedback ? (
                        <div className="animate-pop-in">
                            {feedback === 'correct' ? <CorrectIcon /> : <IncorrectIcon />}
                        </div>
                    ) : (
                         <p className="text-xl md:text-2xl text-center text-sky-200 h-16 flex items-center">{systemMessage}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                    {numbers.map((num, index) => (
                        <button
                            key={index}
                            onClick={() => handleNumberSelect(num)}
                            disabled={selectedNumber !== null}
                            className={`font-pixel text-3xl md:text-4xl p-4 md:p-6 rounded-lg shadow-md transition-all duration-200 ${
                                selectedNumber !== null
                                ? 'bg-sky-800 text-sky-500 cursor-not-allowed'
                                : 'bg-sky-400 hover:bg-sky-300 text-white transform hover:-translate-y-1'
                            }`}
                        >
                            {num}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="number"
                        value={playerInput}
                        onChange={(e) => setPlayerInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                        disabled={selectedNumber === null || isChecking}
                        placeholder="정답"
                        className="flex-grow text-center text-xl md:text-2xl p-3 rounded-lg border-2 border-gray-400 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-400 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={handleCheckAnswer}
                        disabled={selectedNumber === null || isChecking || playerInput === ''}
                        className="font-pixel bg-blue-500 text-white text-lg md:text-xl font-bold py-3 px-8 rounded-lg shadow-lg transition-transform duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed enabled:hover:bg-blue-600 enabled:transform enabled:hover:scale-105"
                    >
                        CHECK
                    </button>
                </div>
            </div>
        </div>
    );
    
    const renderResultScreen = () => (
        <div className="text-center text-white animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-pixel mb-6">GAME OVER</h1>
            <div className="bg-black bg-opacity-30 p-8 rounded-xl shadow-lg space-y-4 mb-8">
                <div className="text-2xl md:text-3xl">
                    <span className="font-pixel text-sky-300">FINAL SCORE : </span>
                    <span className="font-bold text-4xl">{score}</span>
                </div>
                <div className="text-2xl md:text-3xl">
                    <span className="font-pixel text-sky-300">HIGH SCORE : </span>
                    <span className="font-bold text-4xl">{highScore}</span>
                </div>
            </div>
            <button
                onClick={handleRetry}
                className="font-pixel bg-green-500 hover:bg-green-600 text-white text-xl md:text-2xl font-bold py-4 px-10 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-200"
            >
                RETRY
            </button>
        </div>
    );

    return (
        <main className="min-h-screen w-full bg-gradient-to-b from-sky-400 to-sky-700 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-4xl bg-black bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-10">
                {gameState === 'start' && renderStartScreen()}
                {gameState === 'playing' && renderGameScreen()}
                {gameState === 'result' && renderResultScreen()}
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }

                @keyframes pop-in {
                    0% { transform: scale(0.5); opacity: 0; }
                    80% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pop-in { animation: pop-in 0.3s ease-out forwards; }
            `}</style>
        </main>
    );
};

export default App;
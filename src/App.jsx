import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Star, Clock, Trophy, Info, Medal, BarChart, Zap, Settings, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';


function App() {
  const [gamePhase, setGamePhase] = useState('welcome');
  const [selectedTime, setSelectedTime] = useState(null);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStatus, setGameStatus] = useState('not_started');
  const timerRef = useRef(null);

  const timeOptions = [
    { label: '1:00', seconds: 60 },
    { label: '1:30', seconds: 90 },
    { label: '2:00', seconds: 120 },
    { label: '2:30', seconds: 150 },
    { label: '5:00', seconds: 300 },
    { label: 'Ilimitado', seconds: Infinity }
  ];

  const cardIcons = ['🚀', '🌍', '🌈', '🍕', '🐶', '🏀', '🎸', '🚲'];

  const startGame = () => {
    const doubledIcons = [...cardIcons, ...cardIcons];
    const shuffledCards = doubledIcons
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false
      }));
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setScore(0);
    setTimeLeft(selectedTime);
    setGameStatus('playing');
    setGamePhase('game');

    if (selectedTime !== Infinity) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setGameStatus('lost');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  useEffect(() => {
    if (matchedPairs.length === cardIcons.length * 2) {
      clearInterval(timerRef.current);
      setGameStatus('won');
      calculateFinalScore();
    }
  }, [matchedPairs]);

  const calculateFinalScore = () => {
    const timeFactor = timeLeft > 0 ? timeLeft : 0;
    const moveFactor = moves > 0 ? Math.max(100 - moves * 2, 0) : 100;
    const finalScore = timeFactor + moveFactor;
    setScore(finalScore);
  };

  const handleCardClick = (clickedCard) => {
    if (
      gameStatus !== 'playing' ||
      flippedCards.length === 2 || 
      matchedPairs.includes(clickedCard.id) || 
      flippedCards.some(card => card.id === clickedCard.id)
    ) return;

    const newCards = cards.map(card => 
      card.id === clickedCard.id ? { ...card, isFlipped: true } : card
    );

    setCards(newCards);
    setFlippedCards([...flippedCards, clickedCard]);
    setMoves(moves + 1);

    if (flippedCards.length === 1) {
      setTimeout(() => {
        const firstCard = flippedCards[0];
        if (firstCard.icon === clickedCard.icon) {
          setMatchedPairs([...matchedPairs, firstCard.id, clickedCard.id]);
        } else {
          const resetCards = cards.map(card => 
            card.id === firstCard.id || card.id === clickedCard.id 
              ? { ...card, isFlipped: false } 
              : card
          );
          setCards(resetCards);
        }
        setFlippedCards([]);
      }, 1000);
    }
  }
  const renderWelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 text-center w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-blue-600">Juego de la Memoria</h1>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center justify-center md:justify-start mb-4">
            <Info className="mr-2 text-blue-500" />
            <h2 className="text-xl font-semibold text-blue-700">Reglas del Juego</h2>
          </div>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Encuentra todos los pares de tarjetas idénticas.</li>
            <li>Voltea dos tarjetas en cada turno.</li>
            <li>Si los iconos coinciden, las tarjetas permanecerán visibles.</li>
            <li>Si no coinciden, las tarjetas se volverán a ocultar.</li>
          </ul>
        </div>

        <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center justify-center md:justify-start mb-4">
            <Trophy className="mr-2 text-green-500" />
            <h2 className="text-xl font-semibold text-green-700">Sistema de Puntuación</h2>
          </div>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Puntos basados en tiempo restante y precisión.</li>
            <li>Menos movimientos = Más puntos.</li>
            <li>Tiempo restante suma puntos adicionales.</li>
            <li>Objetivo: Máxima puntuación posible.</li>
          </ul>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-center justify-center md:justify-start mb-4">
            <Clock className="mr-2 text-purple-500" />
            <h2 className="text-xl font-semibold text-purple-700">Selección de Tiempo</h2>
          </div>
          <p className="text-gray-700 mb-4">Elige el tiempo de juego:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {timeOptions.map((option) => (
              <button
                key={option.seconds}
                onClick={() => setSelectedTime(option.seconds)}
                className={`
                  py-3 rounded-lg transition-colors
                  ${selectedTime === option.seconds 
                    ? 'bg-green-500 text-white' 
                    : 'bg-purple-500 text-white hover:bg-purple-600'}
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {selectedTime !== null && (
            <button
              onClick={startGame}
              className="w-full bg-blue-500 text-white py-4 rounded-lg 
              hover:bg-blue-600 transition-colors text-xl font-bold"
            >
              🎮 INICIAR JUEGO
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderGameScreen = () => (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 text-center w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Clock className="mr-2 text-blue-500" />
            <span className="font-bold text-xl">
              {timeLeft === Infinity ? '∞' : `${timeLeft}s`}
            </span>
          </div>
          <div className="flex items-center">
            <Trophy className="mr-2 text-yellow-500" />
            <span className="font-bold text-xl">{score}</span>
          </div>
        </div>

        {gameStatus === 'playing' && (
          <div className="mb-4 text-gray-600">Movimientos: {moves}</div>
        )}
        
        {gameStatus === 'won' && (
          <div className="text-green-600 font-bold mb-4 text-2xl animate-bounce">
            🎉 ¡Ganaste! Puntuación: {score} 🎉
          </div>
        )}

        {gameStatus === 'lost' && (
          <div className="text-red-600 font-bold mb-4 text-2xl animate-pulse">
            ⏰ ¡Tiempo agotado! 😢
          </div>
        )}
        
        <div className="grid grid-cols-4 gap-4">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={gameStatus !== 'playing' || matchedPairs.includes(card.id)}
              className={`
                w-20 h-20 flex items-center justify-center 
                text-4xl rounded-2xl transition-all duration-500
                transform hover:scale-105
                ${card.isFlipped || matchedPairs.includes(card.id) 
                  ? 'bg-green-500 text-white scale-110' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'}
                ${gameStatus !== 'playing' ? 'opacity-50' : ''}
              `}
            >
              {(card.isFlipped || matchedPairs.includes(card.id)) 
                ? card.icon 
                : <Star className="w-10 h-10" />}
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => setGamePhase('welcome')}
          className="mt-6 bg-purple-500 text-white px-6 py-3 rounded-lg 
          hover:bg-purple-600 flex items-center mx-auto transition-transform 
          active:scale-95 shadow-md"
        >
          <RefreshCw className="mr-2" /> Nuevo Juego
        </button>
      </div>
    </div>
  );

  return gamePhase === 'welcome' 
    ? renderWelcomeScreen() 
    : renderGameScreen();
}

export default App

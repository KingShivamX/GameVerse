import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Matchmaking from './pages/Matchmaking';
import Leaderboard from './pages/Leaderboard';
import GameReviews from './pages/GameReviews';
import MyStats from './pages/MyStats';
import ChatPage from './pages/ChatPage';
import GamesPage from './pages/GamesPage';
import SnakeGame from './pages/SnakeGame';
import TicTacToeGame from './pages/TicTacToeGame';
import { AudioProvider } from './context/AudioContext';

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <AudioProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/matchmaking" element={<Matchmaking />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/reviews" element={<GameReviews />} />
            <Route path="/stats" element={<MyStats />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/games" element={<GamesPage />} />
            <Route path="/games/snake" element={<SnakeGame />} />
            <Route path="/games/tictactoe" element={<TicTacToeGame />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AudioProvider>
  );
}

export default App;

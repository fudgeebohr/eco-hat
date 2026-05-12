import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
});

export const getUserData = async (studentId) => {
    const response = await fetch(`${API_URL}/user-history/${studentId}`);
    if (!response.ok) throw new Error('Failed to fetch user data');
    return response.json(); // This usually returns { points, activities: [] }
};

export const getLeaderboard = async () => {
    const response = await fetch(`${API_URL}/leaderboard`);
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
};

export default api;
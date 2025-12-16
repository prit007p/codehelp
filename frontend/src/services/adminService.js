import axios from 'axios';

const API_URL = '/api/admin';

export const getProblems = async () => {
    const response = await axios.get(`${API_URL}/problems`);
    return response.data;
};

export const addProblem = async (newProblem) => {
    const response = await axios.post(`${API_URL}/problem`, { newProblem });
    return response.data;
};

export const updateProblem = async (change) => {
    const response = await axios.put(`${API_URL}/problem`, { change });
    return response.data;
};

export const deleteProblem = async (problemName) => {
    const response = await axios.delete(`${API_URL}/problem`, { data: { problem: problemName } });
    return response.data;
};

export const getUsers = async () => {
    const response = await axios.get(`${API_URL}/user`);
    return response.data;
};

export const updateUser = async (user) => {
    const response = await axios.put(`${API_URL}/user`, { user: user.username, ...user });
    return response.data;
};

export const deleteUser = async (username) => {
    const response = await axios.delete(`${API_URL}/user`, { data: { user: username } });
    return response.data;
};

// api.js
import axios from 'axios';

// Tu URL válida de Ngrok
const API_URL = 'https://9f76-2806-264-4482-c39-4060-60b5-e133-1f84.ngrok-free.app';

export const fetchLugares = async () => {
  try {
    const response = await axios.get(`${API_URL}/lugares`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los lugares:', error);
    return [];
  }
};

import axios from 'axios';

const API_URL = 'https://abc12345.ngrok.io'; // Reemplaza con tu URL ngrok

export const fetchLugares = async () => {
  try {
    const response = await axios.get($,{API_URL}/puntos);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los lugares:', error);
    return [];
  }
};
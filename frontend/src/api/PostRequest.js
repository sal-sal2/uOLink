import axios from 'axios'


const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'https://uolink.ib-salat272.workers.dev' });

export const getTimelinePosts = (id) => API.get(`/posts/${id}/timeline`)
export const likePost = (id, userId) => API.put(`post/${id}/like`, {userId: userId})
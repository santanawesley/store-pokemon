import axios from 'axios';

const baseApi = axios.create({
  baseURL: "https://pokeapi.co/api/v2/"
})

export default baseApi;

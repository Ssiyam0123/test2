import axios from "axios";
import { apiURL } from "../../Constant.js";

const URL = apiURL.api_url;

// export const URL = "https://api.cibdhk.com/api";
// console.log(URL);
// const URL = "http://localhost:3043/api";

export const API = axios.create({
  baseURL: URL,
  withCredentials: true,
});

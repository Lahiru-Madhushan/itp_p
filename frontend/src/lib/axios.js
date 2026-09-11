import axios from "axios";
import { API_ROOT } from "./api";

const axiosInstance = axios.create({
	baseURL: API_ROOT,
	withCredentials: true, // send cookies to the server
});

export default axiosInstance;
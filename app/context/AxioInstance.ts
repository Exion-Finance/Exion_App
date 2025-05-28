import axios from "axios";

import { PESACHAIN_URL } from "@/constants/urls";

const axioConfig = axios.create({
    baseURL: PESACHAIN_URL,
    headers: {
        "Content-Type": "Application/json"
    }
})

export { axioConfig}
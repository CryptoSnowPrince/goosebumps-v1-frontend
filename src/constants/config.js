import dotenv from "dotenv";

dotenv.config();

const config = {
    INFURA_ID: process.env.REACT_APP_INFURA_ID,
    GET_TOEKN_LIST_API_KEY: process.env.REACT_APP_BITQUERY_API_KEY
};

export default config;

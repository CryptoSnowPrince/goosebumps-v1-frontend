import dotenv from "dotenv";

dotenv.config();

const config = {
    INFURA_ID: process.env.REACT_APP_INFURA_ID,
};

export default config;

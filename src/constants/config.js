import dotenv from "dotenv";

dotenv.config();

const config = {
    chainHexID: {
        1: "0x1",
        56: "0x38",
        97: "0x61",
    },
    INFURA_ID: process.env.REACT_APP_INFURA_ID,
};

export default config;

let IS_PROD = process.env.NODE_ENV === "production";
const server = process.env.REACT_APP_BACKEND_URL || (IS_PROD ? "" : "http://localhost:8000");

export default server;
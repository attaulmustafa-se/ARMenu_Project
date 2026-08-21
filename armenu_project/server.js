

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import menuroute from './routes/menu.routes.js';
dotenv.config();

const app = express();
app.use("/ARModels", express.static("ARModels"));
app.use(express.json());
app.use(cors());
app.use('/',menuroute);
connectDB();
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

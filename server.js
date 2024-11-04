const express = require("express");
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const errorHandler = require('./middlewares/errorHandler');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json()); 
app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes); 
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

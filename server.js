const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

//routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const blogRoutes = require('./routes/blog');
const categoryRoutes = require('./routes/category');
const blogCategoryRoutes = require('./routes/blogCategory');
const tag = require('./routes/tag');
//app
const app = express();
//db

mongoose
	.connect(process.env.DATABASE, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true
	})
	.then(() => {
		console.log('DB connected');
	});

//middleware

app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '15mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
	app.use(cors({ origin: `${process.env.DEVELOPMENT_URL}` }));
}

//route middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', blogRoutes);
app.use('/api', categoryRoutes);
app.use('/api', blogCategoryRoutes);
app.use('/api', tag);

//port

const port = process.env.PORT || 8000;
app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

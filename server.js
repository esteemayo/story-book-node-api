const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
	console.log('UNCAUGHT EXCEPTION! 🔥 Shutting down...');
	console.log(err.name, err.message);
	process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// db local
const dbLocal = process.env.DATABASE_LOCAL;

// db atlas
const db = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
);

// mongoDB connection
mongoose.connect(db, {
// mongoose.connect(dbLocal, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
})
	.then(() => console.log(`Connected to MongoDB → ${db}`));
	// .then(() => console.log(`Connected to MongoDB → ${dbLocal}`));

app.set('port', process.env.PORT || 9090);

const server = app.listen(app.get('port'), () =>
	console.log(`Server running at port → ${server.address().port}`)
);

process.on('unhandledRejection', (err) => {
	console.log('UNHANDLED REJECTION! 🔥 Shutting down...');
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});

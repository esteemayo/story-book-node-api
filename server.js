const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors');

process.on('uncaughtException', (err) => {
	console.log('UNCAUGHT EXCEPTION! 🔥 Shutting down...'.red.bold);
	console.log(err.name, err.message);
	process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// db local
const db = process.env.DATABASE_LOCAL;

// atlas mongo uri
const mongoUri = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
);

// mongoDB connection
mongoose.connect(mongoUri)
	.then(() => console.log(`Connected to MongoDB → ${mongoUri}`.gray.bold));

app.set('port', process.env.PORT || 9090);

const server = app.listen(app.get('port'), () =>
	console.log(`Server running at port → ${server.address().port}`.blue.bold)
);

process.on('unhandledRejection', (err) => {
	console.log('UNHANDLED REJECTION! 🔥 Shutting down...'.red.bold);
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});

process.on('SIGTERM', () => {
	console.log('👏 SIGTERM RECEIVED!, Shutting down gracefully...');
	server.close(() => {
		console.log('Process terminated! 🔥');
	});
});

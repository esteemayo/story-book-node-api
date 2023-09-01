import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import 'colors';

// models
import Bookmark from '../../models/Bookmark.js';
import Story from '../../models/Story.js';
import Comment from '../../models/Comment.js';
import User from '../../models/User.js';
import History from '../../models/History.js';
import connectDB from '../../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './config.env' });

// mongoDB connection
connectDB();

// read JSON file
const comments = JSON.parse(
  fs.readFileSync(`${__dirname}/comments.json`, 'utf-8')
);
const stories = JSON.parse(
  fs.readFileSync(`${__dirname}/stories.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// import data into DB
const importData = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    await Comment.create(comments);
    await Story.create(stories);
    console.log(
      '👍👍👍👍👍👍 Data successfully loaded! 👍👍👍👍👍👍'.green.bold
    );
    process.exit();
  } catch (err) {
    console.log(
      '\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n'
        .red.bold
    );
    console.error(err);
    process.exit();
  }
};

// delete all data from DB
const deleteData = async () => {
  try {
    console.log('😢😢 Goodbye Data...'.blue.bold);
    await Comment.deleteMany();
    await Story.deleteMany();
    await User.deleteMany();
    await Bookmark.deleteMany();
    await History.deleteMany();
    console.log(
      'Data successfully deleted! To load sample data, run\n\n\t npm run sample\n\n'
        .green.bold
    );
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

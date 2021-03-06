const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
require('colors');

// models
const Bookmark = require('../../models/Bookmark');
const Story = require('../../models/Story');
const Comment = require('../../models/Comment');
const User = require('../../models/User');
const History = require('../../models/History');

dotenv.config({ path: './config.env' });

// db local
const db = process.env.DATABASE_LOCAL;

// atlas mongo uri
const mongoUri = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const devEnv = process.env.NODE_ENV !== 'production';

// mongoDB connection
mongoose
  .connect(`${devEnv ? db : mongoUri}`)
  .then(() =>
    console.log(`Connected to MongoDB ā ${devEnv ? db : mongoUri}`.gray.bold)
  )
  .catch((err) =>
    console.log(`Could not connect to MongoDB ā ${err}`.red.bold)
  );

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
      'šššššš Data successfully loaded! šššššš'.green.bold
    );
    process.exit();
  } catch (err) {
    console.log(
      '\nšššššššš Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n'
        .red.bold
    );
    console.error(err);
    process.exit();
  }
};

// delete all data from DB
const deleteData = async () => {
  try {
    console.log('š¢š¢ Goodbye Data...'.blue.bold);
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

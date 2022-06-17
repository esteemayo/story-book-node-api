const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    story: {
      type: mongoose.Types.ObjectId,
      ref: 'Story',
      required: [true, 'A bookmark must belong to a story'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'A bookmark must belong to a user'],
    },
  },
  {
    timestamps: true,
  }
);

bookmarkSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'story',
    select: 'title body status author',
  }).populate({
    path: 'user',
    select: 'name username photo',
  });

  next();
});

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;

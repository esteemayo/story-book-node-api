import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'A bookmark must belong to a user'],
    },
    story: {
      type: mongoose.Types.ObjectId,
      ref: 'Story',
      required: [true, 'A bookmark must belong to a story'],
    },
  },
  {
    timestamps: true,
  }
);

bookmarkSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
  }).populate({
    path: 'story',
    select: 'title body status author',
  });

  next();
});

const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;

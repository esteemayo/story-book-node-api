import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: [true, 'Body cannot be empty'],
    },
    story: {
      type: mongoose.Types.ObjectId,
      ref: 'Story',
      required: [true, 'Comment must belong to a story'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment must belong to a user'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name email username photo',
  });

  next();
});

const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

export default Comment;

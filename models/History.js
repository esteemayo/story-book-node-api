const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    story: {
      type: mongoose.Types.ObjectId,
      ref: 'Story',
      required: [true, 'An history must belong to a story'],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'An history must belong to a user'],
    },
  },
  {
    timestamps: true,
  }
);

historySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'story',
    select: 'title body status author',
  }).populate({
    path: 'user',
    select: 'name username photo',
  });

  next();
});

const History = mongoose.model('History', historySchema);

module.exports = History;

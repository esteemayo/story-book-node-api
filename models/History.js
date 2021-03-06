const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'An history must belong to a user'],
    },
    story: {
      type: mongoose.Types.ObjectId,
      ref: 'Story',
      required: [true, 'An history must belong to a story'],
    },
  },
  {
    timestamps: true,
  }
);

historySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
  }).populate({
    path: 'story',
    select: 'title body status author',
  });

  next();
});

const History = mongoose.model('History', historySchema);

module.exports = History;

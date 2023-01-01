import slugify from 'slugify';
import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A story must have a title'],
    },
    slug: String,
    body: {
      type: String,
      required: [true, 'A story must have a body'],
    },
    status: {
      type: String,
      enum: ['public', 'private', 'unpublished'],
      default: 'public',
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: Array,
      isAsync: true,
      validate: {
        validator: function (val) {
          return val && val.length > 0;
        },
        message: 'A story should have at least one tag',
      },
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'A story must belong to a user'],
    },
    author: {
      type: String,
      required: [true, 'A story must have an author'],
    },
    likes: {
      type: [String],
      default: [],
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

storySchema.index({
  title: 'text',
  body: 'text',
});

storySchema.index({ title: 1, author: 1 });
storySchema.index({ slug: -1 });

storySchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'story',
});

storySchema.pre('save', async function (next) {
  if (!this.isModified('title')) return next();

  this.slug = slugify(this.title, { lower: true });

  const slugRegExp = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const storyWithSlug = await this.constructor.find({ slug: slugRegExp });

  if (storyWithSlug.length) {
    this.slug = `${this.slug}-${storyWithSlug.length + 1}`;
  }
});

storySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name username email photo',
  });

  next();
});

storySchema.statics.getTagsList = function () {
  return this.aggregate([
    {
      $unwind: '$tags',
    },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

const Story = mongoose.models.Story || mongoose.model('Story', storySchema);

export default Story;

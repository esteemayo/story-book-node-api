const mongoose = require('mongoose');
const slugify = require('slugify');

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
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true, 'A story must belong to a user']
        },
        author: {
            type: String,
            required: [true, 'A story must have an author']
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

storySchema.index({ title: 1, author: 1 });
storySchema.index({ slug: -1 });

storySchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'story'
});

storySchema.pre('save', async function (next) {
    if (!this.isModified('title')) return next();

    this.slug = slugify(this.title, { lower: true });

    const slugRegExp = new RegExp(`(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storyWithSlug = await this.constructor.find({ slug: slugRegExp });

    if (storyWithSlug.length) {
        this.slug = `${this.slug}-${storyWithSlug.length + 1}`;
    }

    next();
});

storySchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name username email photo'
    });

    next();
});

const Story = mongoose.model('Story', storySchema);

module.exports = Story;

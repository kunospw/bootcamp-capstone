import mongoose from "mongoose";

const savedJobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: [true, 'Job ID is required']
    },
    note: {
        type: String,
        maxlength: [500, 'Note cannot exceed 500 characters'],
        trim: true,
        default: ''
    },
    dateSaved: {
        type: Date,
        default: Date.now
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot exceed 50 characters']
    }],
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    reminderDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate saves
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Indexes for better query performance
savedJobSchema.index({ userId: 1, isActive: 1 });
savedJobSchema.index({ dateSaved: -1 });
savedJobSchema.index({ priority: 1 });
savedJobSchema.index({ reminderDate: 1 });

// Virtual to populate job details
savedJobSchema.virtual('job', {
    ref: 'Job',
    localField: 'jobId',
    foreignField: '_id',
    justOne: true
});

// Method to update note
savedJobSchema.methods.updateNote = function(note) {
    this.note = note;
    return this.save();
};

// Method to add tag
savedJobSchema.methods.addTag = function(tag) {
    if (!this.tags.includes(tag)) {
        this.tags.push(tag);
        return this.save();
    }
    return this;
};

// Method to remove tag
savedJobSchema.methods.removeTag = function(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    return this.save();
};

// Method to set reminder
savedJobSchema.methods.setReminder = function(date) {
    this.reminderDate = date;
    return this.save();
};

// Static method to get saved jobs by user with filters - FIXED
savedJobSchema.statics.getSavedJobsByUser = function(userId, filters = {}) {
    const query = { userId, isActive: true };

    if (filters.priority) {
        query.priority = filters.priority;
    }

    if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
    }

    if (filters.hasReminder) {
        query.reminderDate = { $exists: true, $ne: null };
    }

    // Return query object, not executed find() so it can be chained with populate
    return this.find(query).sort({ dateSaved: -1 });
};

export default mongoose.model("SavedJob", savedJobSchema);
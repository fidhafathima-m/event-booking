import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    }
})

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
    },
    category: {
        type: String,
        enum: ["venue", "caterer", "dj", "photographer", "decorator"],
        required: [true, "Category is required"],
    },
    pricePerDay: {
        type: Number,
        required: [true, "Price per day is required"],
        min: [0, "Proce must not be negative"],
    },
    location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    }
  },
  images: [{
    type: String,
    default: []
  }],
  availability: [availabilitySchema],
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  features: [{
    type: String,
    default: []
  }],
  capacity: {
    type: Number,
    default: null
  },
  tags: [{
    type: String,
    default: []
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
serviceSchema.index({ category: 1, location: 1 });
serviceSchema.index({ pricePerDay: 1 });
serviceSchema.index({ rating: -1 });
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Update timestamp before update
serviceSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
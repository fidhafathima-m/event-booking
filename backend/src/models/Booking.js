import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  bookingDates: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalDays: {
      type: Number,
      required: true,
      min: 1
    }
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  specialRequirements: {
    type: String,
    trim: true,
    default: ''
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: null
  },
  guestsCount: {
    type: Number,
    default: 1,
    min: 1
  },
  contactPerson: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate total days before saving
bookingSchema.pre('save', function(next) {
  if (this.bookingDates.startDate && this.bookingDates.endDate) {
    const start = new Date(this.bookingDates.startDate);
    const end = new Date(this.bookingDates.endDate);
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    this.bookingDates.totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }
  next();
});

// Update timestamp before update
bookingSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Indexes
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ service: 1, status: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'bookingDates.startDate': 1, 'bookingDates.endDate': 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
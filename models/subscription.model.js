import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Subscription name is required'],
            trim: true,
            minlength: 3,
            maxlength: 200,
        },
        price: {
            type: Number,
            required: [true, 'Subscription price is required'],
            min: [0, 'Price must be >= 0'],
            max: [1000, 'Price must be <= 1000'],
        },
        currency: {
            type: String,
            enum: ['EUR', 'USD', 'GBP', 'INR'],
            default: 'USD',
        },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly'],
            required: [true, 'Frequency is required'],
            default: 'monthly',
        },
        category: {
            type: String,
            enum: [
                'sports',
                'news',
                'entertainment',
                'lifestyle',
                'technology',
                'finance',
                'politics',
                'other',
            ],
            required: [true, 'Please enter a category'],
        },
        paymentMethod: {
            type: String,
            required: [true, 'Payment method is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'canceled'],
            default: 'active',
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
            validate: {
                validator: (value) => value <= new Date(),
                message: 'Start date must be in the past',
            },
        },
        renewalDate: {
            type: Date,
            required: [true, 'Renewal date is required'],
            validate: {
                validator: function (value) {
                    return this.startDate ? value >= this.startDate : true;
                },
                message: 'Renewal date must be on/after the start date',
            },
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

// Auto-calc renewalDate if missing (before validation so "required" passes)
subscriptionSchema.pre('validate', function (next) {
    if (!this.renewalDate && this.startDate && this.frequency) {
        const daysByFreq = { daily: 1, weekly: 7, monthly: 30, yearly: 365 };
        const days = daysByFreq[this.frequency];
        if (days) {
            const d = new Date(this.startDate);
            d.setDate(d.getDate() + days);
            this.renewalDate = d;
        }
    }

    if (this.renewalDate && this.renewalDate < new Date()) {
        this.status = 'expired';
    }

    next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;

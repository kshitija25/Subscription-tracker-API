import Subscription from '../models/subscription.model.js';
import { workflowClient } from '../config/upstash.js';

const BASE_URL = process.env.SERVER_URL || process.env.PUBLIC_BASE_URL || 'http://localhost:5500';

export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,
        });

        // ✅ Correct JS object, no inline TS, proper commas, defined URL
        const { workflowRunId } = await workflowClient.trigger({
            url: `${BASE_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subscriptionId: subscription.id, // ok: Mongoose string getter
            },
            headers: {
                'content-type': 'application/json',
            },
            retries: 0,
        });

        // (optional) log
        // console.log('workflowRunId', workflowRunId);

        res.status(201).json({
            success: true,
            data: subscription,
        });
    } catch (err) {
        next(err);
    }
};

export const getUserSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user._id });
        res.status(200).json({ success: true, data: subscriptions });
    } catch (e) {
        next(e);
    }
};

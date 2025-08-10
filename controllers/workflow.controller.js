import { createRequire } from 'module';
import dayjs from 'dayjs';
import Subscription from '../models/subscription.model.js';
import {sendReminderEmail} from "../utils/send-email.js";

const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;

    const subscription = await fetchSubscription(context, subscriptionId);
    if (!subscription || subscription.status !== 'active') return;

    const renewalDate = dayjs(subscription.renewalDate);

    if (renewalDate.isBefore(dayjs())) {
        console.log(`renewal date has passed for subscription ${subscriptionId}. Stopping workflow`);
        return;
    }

    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');

        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `reminder ${daysBefore} days before`, reminderDate);
        }

        await triggerReminder(context, `reminder ${daysBefore} days before`);
    }
});

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return await Subscription.findById(subscriptionId).populate('user', 'name email').exec();
    });
};

const sleepUntilReminder = async (context, label, date) => {
    console.log(`sleeping until ${label} for ${date.toISOString()}`);
    await context.sleepUntil(label, date.toDate()); // ✅ no dot after await
};

const triggerReminder = async (context, label) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label} reminder`);
        // TODO: send email/SMS/push here
        await sendReminderEmail({
            to: subscription.user.email,
            type: reminder.label.subscription,

        })
    });
};

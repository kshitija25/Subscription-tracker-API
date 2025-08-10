import {Router} from "express";
import authorize from "../middlewares/auth.middleware.js";
import {createSubscription, getUserSubscriptions} from "../controllers/subscriptions.controller.js";
const subscriptionRouter = Router();

subscriptionRouter.get('/',(req, res) =>
res.send({title: ' Get all subscriptions of all users'}));

subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

subscriptionRouter.get('/:id',(req, res) =>
    res.send({title: 'Get subscriptions details'}));

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.put('/:id',(req, res) =>
    res.send({title: 'Update a subscription'}));

subscriptionRouter.put('/:id/cancel',(req, res) =>
    res.send({title: 'cancel a subscription'}));

subscriptionRouter.get('/upcoming-renewals',(req, res) =>
    res.send({title: 'Get upcoming renewals'}));


subscriptionRouter.delete('/:id',(req, res) =>
    res.send({title: 'Delete a subscription'}));

export default subscriptionRouter;
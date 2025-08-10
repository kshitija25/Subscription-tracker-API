import {Router} from "express";
const authRouter = Router();
import {signUp} from "../controllers/auth.controller.js";
import {signIn} from "../controllers/auth.controller.js";
import {signOut} from "../controllers/auth.controller.js";

// /api/v1/auth/sign-up ->POST ->signup
//authRouter.post('/sign-up', (req, res) =>
//res.send({title: "Sign up "}));
authRouter.post("/sign-up", signUp);

//authRouter.post('/sign-in', (req, res) =>
//    res.send({title: "Sign in "}));
authRouter.post("/sign-in", signIn);

//authRouter.post('/sign-out', (req, res) =>
//    res.send({title: "Sign out "}));
authRouter.post("/sign-out", signOut);
export default authRouter;
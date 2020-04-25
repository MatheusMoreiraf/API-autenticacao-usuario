import express from "express";
import AccountModel from "../model/accountModel";
import Cryptr from "cryptr";
import jwt from "jsonwebtoken";

const authRouter = express.Router();
let securePass = new Cryptr("aes256");

authRouter.route("/").post((req, resp) => {

});

export default authRouter;

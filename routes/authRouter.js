import express from "express";
import AccountModel from "../model/accountModel";
import Cryptr from "cryptr";
import jwt from "jsonwebtoken";

const authRouter = express.Router();
let securePass = new Cryptr("aes256");

authRouter.route("/").post((req, resp) => {
    try {
        let token = req.headers['token'];
        if (token) {
            jwt.verify(token, process.env.SECRET, function (err, decoded) {
                if (err) {
                    status401(resp, "2", "Token invalido, inexistente ou expirado");
                } else if (decoded) {
                    AccountModel.findOne({
                        "email": req.body.email
                    }, (err, account) => {
                        if (err) {
                            status400(resp, err);
                        } else if (!account) {
                            status404(resp);
                        } else if (req.body.password != securePass.decrypt(account.password)) {
                            status401(resp, "5", "Password incorreto");
                        } else {
                            let data = {
                                "token": token,
                                "account": {
                                    "id": account._id,
                                    "email": account.email,
                                    "firstName": account.firstName,
                                    "lastName": account.lastName
                                }
                            }
                            status200(resp, data);
                        }
                    })
                }
            })
        } else {
            status401(resp, "2", "Token invalido, inexistente ou expirado");
        }
    } catch (error) {
        status500(resp, error);
    }
});

function status200(resp, data) {
    resp.statusMessage = "OK";
    resp.status(200).json(data);
}

function status400(resp, err) {
    console.error(`Erro: ${err}`);
    resp.statusMessage = "Bad request";
    resp.status(400).json({
        'codigo': '3',
        'mensagem': 'Dados request enviados incorretos'
    });
}

function status401(resp, code, message) {
    resp.statusMessage = "Unauthorized";
    resp.status(401).json({
        'codigo': code,
        'mensagem': message
    });
}

function status404(resp) {
    resp.statusMessage = "Not found";
    resp.status(404).json({
        'codigo': '4',
        'mensagem': `Usuário não encontrado`
    });
}

function status500(resp, error) {
    console.error(error);
    resp.statusMessage = "Internal error";
    resp.status(500).json({
        'codigo': '1',
        'mensagem': 'Erro no servidor'
    });
}

export default authRouter;

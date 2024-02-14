// controllers/authController.ts
import { Request, Response } from 'express';
import { UserModel } from '../database/models/User';
export class AuthController {
    public static async registerUser (req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;
        try {
            const user = await UserModel.create({
                username: username,
                password: password
            });
            
            const token = user.generateAuthToken();
            
            user.token = token;
            user.save();
            
            const userData = {
                ...user.toJSON(),
                token,
                password: undefined,
                createdAt: undefined,
                updatedAt: undefined
            };

            res.status(201).json({ message: 'User registered successfully', user: userData });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    public static async authenticateUser (req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;
        try {
            const user = await UserModel.findByCredentials(username, password);
            //console.log(user);
            if (user == -1) {
                res.status(401).json({ message: 'Incorrect username or password' });
                return;
            }
            if (user == null) {
                return AuthController.registerUser(req, res);
            }

            const userData = user.toJSON();
            delete userData.password;
            delete userData.createdAt;
            delete userData.updatedAt;

            res.status(200).json({ message: 'Authentication successful', user: userData });
        } catch (error) {
            console.error('Error authenticating user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    };
}
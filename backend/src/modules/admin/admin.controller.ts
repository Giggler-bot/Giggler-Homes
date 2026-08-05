import { RequestHandler } from "express";

export function getAdminDashboard(): RequestHandler {

    return(req, res) => {
        res.status(200).json({
            success: true,
            message: "Welcome to the admin dashboard",
            data: {
                user: req.user
            }
        })
    }
}
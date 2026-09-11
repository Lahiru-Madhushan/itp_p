import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie=(res, userId) => {
    const token =jwt.sign ({userId}, process.env.JWT_SECRET, {
expiresIn: "7d",
    })

    // In production the SPA and the API sit on different domains (Vercel and
    // Render), so the cookie must be SameSite=None or the browser drops it on
    // every request. SameSite=None is only accepted alongside Secure, and both
    // are unnecessary locally where the two share localhost.
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token",token,{
        httpOnly:true,
        secure: isProd,
        sameSite: isProd ? "none" : "strict",
        maxAge:7*24*60*60*1000
    });
    return token
};
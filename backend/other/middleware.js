import { getAuth } from '@clerk/express';
import { getOrCreateUserFromClerk, setRequestUser } from './clerkUser.js';

const middleware = async (req, res, next) => {
    try {
        const auth = getAuth(req);

        if (!auth?.isAuthenticated || !auth.userId) {
            return res.status(401).json({ status: false, redirect: '/login', message: 'Please login' });
        }

        const appUser = await getOrCreateUserFromClerk(auth.userId);
        setRequestUser(req, appUser, auth);
        return next();
    } catch (err) {
        console.error("Clerk auth middleware error", err);
        return res.status(401).json({ status: false, redirect: '/login', message: "Authentication failed" });
    }
}

export default middleware;

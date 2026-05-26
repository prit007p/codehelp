import express from 'express';

const router = express.Router();

router.all('/', (_req, res) => {
    res.status(410).json({
        status: false,
        provider: 'clerk',
        message: 'Registration is handled by Clerk on the frontend.',
    });
});

export default router;

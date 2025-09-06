import express from 'express';
const router = express.Router();

router.get('/solution',(req,res)=>{
    console.log("solution page is here");
    res.send("hi");
});

export default router;
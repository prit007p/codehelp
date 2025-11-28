import express from 'express';
const router = express.Router();
import Problem from '../models/Problem.js';

router.get('/problems', async (req, res) => {
      try{
        const problems = await Problem.find();
        res.json(problems);
      }
      catch(err){
        console.log("error in fetching problems",err);
      }
});

router.post('/problem',async(req,res)=>{
    try{
        const problem = req.body.problem;
        const newProblem =  new Problem(problem);
        await  newProblem.save();
        console.log("new problem created",newProblem.problemName)
        return res.json({status:true});
    }catch(err){
        console.log("error in adding problem",err);
        return res.json({status:false});
    }
});

router.put('/problem',async(req,res)=>{
    try{
        const change = req.body.change;
        await Problem.findOneAndUpdate({problemName:change.problename},req.body,{new:true});
        return res.json({status:true});
    }catch(err){
        console.log("error in editing problem",err);
        return res.json({status:false});
    }
});

export default router;
import express from 'express';
const router = express.Router();
import Problem from '../models/Problem.js';
import User from '../models/User.js';

router.get('/problems', async (req, res) => {
      try{
        const problems = await Problem.find();
        res.json({problems,status:true,message:"problems fetched successfully"}  );
      }
      catch(err){
        console.log("error in fetching problems",err);
        return res.json({status:false,message:"error in fetching problems"});
      }
});

router.post('/problem',async(req,res)=>{
    try{
        const problem = req.body.newProblem;
        const newProblem =  new Problem(problem);
        await  newProblem.save();
        console.log("new problem created",newProblem.problemName)
        return res.json({status:true,message:"problem added successfully"});
    }catch(err){
        console.log("error in adding problem",err);
        return res.json({status:false,message:"error in adding problem"});
    }
});

router.put('/problem',async(req,res)=>{
    try{
        const change = req.body.change;
        await Problem.findOneAndUpdate({problemName:change.problename},req.body,{new:true});
        return res.json({status:true,message:"problem updated successfully"});
    }catch(err){
        console.log("error in editing problem",err);
        return res.json({status:false,message:"error in editing problem"});
    }
});

router.delete('/problem',async(req,res)=>{
    try{
        const problem = req.body.problem;
        await Problem.findOneAndDelete({problemName:problem});
        return res.json({status:true,message:"problem deleted successfully"});
    }catch(err){
        console.log("error in deleting problem",err);
        return res.json({status:false,message:"error in deleting problem"});
    }
});

router.get('/user',async(req,res)=>{
    try{
        const users = await User.find();
        return res.json({users,status:true,message:"users fetched successfully"});
    }catch(err){
        console.log("error in fetching users",err);
        return res.json({status:false,message:"error in fetching users"});
    }
});

router.delete('/user',async(req,res)=>{
    try{
        const user = req.body.user;
        await User.findOneAndDelete({username:user});
        return res.json({status:true,message:"user deleted successfully"});
    }catch(err){
        console.log("error in deleting user",err);
        return res.json({status:false,message:"error in deleting user"});
    }
});

router.put('/user',async(req,res)=>{
    try{
        const user = req.body.user;
        await User.findOneAndUpdate({username:user},req.body,{new:true});
        return res.json({status:true,message:"user updated successfully"});
    }catch(err){
        console.log("error in updating user",err);
        return res.json({status:false,message:"error in updating user"});
    }
});


export default router;
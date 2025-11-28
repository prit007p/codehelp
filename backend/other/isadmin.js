const isadmin = (req, res, next) => {
  const user = req.user;
  if(user.role !== 'admin'){
   
  }
  next();
}

export default isadmin;
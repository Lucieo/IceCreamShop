module.exports = (req, res, next)=>{
    if(!req.user || !req.user.admin){
        res.redirect('/login');
    }
    next();
}
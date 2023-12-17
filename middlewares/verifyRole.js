
const VerifyRole = (permissions) => {
    return (req, res, next) =>{
        const userRole = req.body.role
        if (permissions.includes(userRole)){
            next()
        } else{
            return res.status(401).json("You dont have Permission!")
        }
    };
};

const checkRole = (roles) => {
    return (req, res, next) => {
      console.log("What is the role of the user?: ", req.user)
      if (roles.includes(req.user.role)) {
        next();
      } else {
        console.log("Access Denied!")
        return res.status(401).json("Access Denied!");
      }
    };
  };

module.exports = {VerifyRole, checkRole};
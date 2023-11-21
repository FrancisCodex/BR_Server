
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
      if (roles.includes(req.user.role)) {
        next();
      } else {
        return res.status(401).json("Access Denied!");
      }
    };
  };

module.exports = {VerifyRole, checkRole};
const pool = require("../config/database")

exports.userdata = async (res, req) =>{
    const userData = await pool.query('SELECT name, email from boardroom.users WHERE user_id = $1', [req.user]);

    console.log("The userdata: ", userData);
    try{

    if(userData.rows.lenght === 0 ){
        return res.status(404).json({message : "User not Found"});
    }

    const { name, email } = userData.rows[0];
    res.status(200).json({user : {name, email: email}});

    } catch(error){
        console.error(error);
        res.status(500).json({message: "Internal server error"})
    }
}

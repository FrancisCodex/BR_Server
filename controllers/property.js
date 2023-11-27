const pool = require('../config/database');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();



exports.viewproperty = async (req, res) =>{
    //viewproperty api here
    //lets user view property
    //this is used to view specific property pages and show their property details
    
}

exports.uploadproperty = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1]; // Assuming the token is in the format "Bearer <token>"
  

    // Verify the token and extract the payload (which should include user_id)
    const decoded = jwt.verify(token, process.env.ACCESSTOKEN_SECRET); // Replace 'your-secret-key' with your actual secret key
    const user_id = decoded.userId;


  const { type, address, num_beds, num_bathrooms, num_rooms, description, longitude, latitude, amenities, city} = req.body;
  // console.log("Request property Type: ", req.body.user_id);
  try {
    const query = `
      INSERT INTO boardroom.property_info 
      (property_type, address, property_description, longitude, latitude, amenities, num_bedrooms, num_bathrooms, num_rooms, city, user_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING property_id
    `;

    const values = [type, address, description, longitude, latitude, amenities, num_beds, num_bathrooms, num_rooms, city, user_id];

    const result = await pool.query(query, values);
    
    const propertyId = result.rows[0].property_id;
    console.log("propertyId: ", propertyId)

    // Insert image
    const imageQuery = `
      INSERT INTO boardroom.property_images 
      (property_id, user_id, image_name, image_path, image_mimetype, image_size) 
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const imagePath = req.file.path;
    const imageName = req.file.originalname;
    const imageMimetype = req.file.mimetype;
    const imageSize = req.file.size;

    const imageValues = [propertyId, user_id, imageName, imagePath, imageMimetype, imageSize];

    await pool.query(imageQuery, imageValues);

    res.status(200).json({message: 'Property Uploaded Successfully!', propertyId: propertyId});
  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.uploadtest = async (req, res) =>{
  console.log(req.body);
  console.log(req.file);
}


exports.deleteproperty = async (req, res) =>{
    //deleteproperty api here
    //this api can delete a property uploaded
    //this is used to delete a property from the database

    const { propertyId } = req.body;

    try {
      const query = `
        DELETE FROM boardroom.property_info 
        WHERE property_id = $1
      `;
  
      const values = [propertyId];
  
      await pool.query(query, values);
  
      res.status(200).json({message: 'Property Deleted Successfully!'});
    } catch(error) {    
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
    
}
exports.propertylistings = async (req, res) =>{
    //uploadlistings api here
    //this api can list a property
    //this api is used when for example: listing pages so the users can see all the properties that are listed
    //this api must show the property listing details so the users can know the details of every property that is being listed on the system
}
exports.propertyedit = async (req, res) =>{
    //uploadedit api here
    //this api is to update the property details
    //only the owner role can only update the property details
    //this api can be edit the details of the properties
}
exports.deletelisting = async (req, res) =>{
    //deletelisting api here
    //this api is to to delete the listed property
    //only the owner or the admin can delete the property listing
}

exports.editlisting = async (req, res) =>{
    //editlisting api here
    //this api is to to edit the listed property
    //only the owner or the admin can edit the property listing

}

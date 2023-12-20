const pool = require('../config/database');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config();
const path = require('path');



exports.viewproperty = async (req, res) =>{
    //viewproperty api here
    //lets user view property
    //this is used to view specific property pages and show their property details

    const { propertyId } = req.params;
    const staticPath = path.join(__dirname, './images/property_images');
    console.log('Static files path:', staticPath);

    console.log("propertyId: ", propertyId);

  try {
    const propertyQuery = `
    SELECT pi.*, pl.*, u.first_name || ' ' || u.last_name AS full_name, u.email FROM boardroom.property_listings pl
    INNER JOIN boardroom.property_info pi ON pi.property_id = pl.property_id
    INNER JOIN boardroom.users u ON u.user_id = pi.user_id
          WHERE pi.property_id = $1
    `;

    const propertyResult = await pool.query(propertyQuery, [propertyId]);

    const imageQuery = `
      SELECT * FROM boardroom.property_images 
      WHERE property_id = $1
    `;

    const imageResult = await pool.query(imageQuery, [propertyId]);

    if (propertyResult.rows.length > 0 && imageResult.rows.length > 0) {
      const propertyDetails = propertyResult.rows[0];
      const imageDetails = imageResult.rows[0];
      console.log("imageDetails: ", imageDetails.image_path);

      res.status(200).json({ propertyDetails, imageDetails });
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }

    
}

exports.getImage = async (req, res) => {
  const { propertyId } = req.params;
  const {filename} = req.params;

  try {
    const query = `
      SELECT image_name, image_path, image_mimetype, image_size FROM boardroom.property_images 
      WHERE property_id = $1 and image_name = $2
    `;

    const result = await pool.query(query, [propertyId, filename]);

    if (result.rows.length > 0) {
      const imageDetails = result.rows[0];
      const imagePath = path.join(__dirname, '../' + imageDetails.image_path);
      console.log("imagePath: ", imagePath);
      res.status(200).sendFile(imagePath);
    } else {
      res.status(404).json({ message: 'Image not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.uploadproperty = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1]; // Assuming the token is in the format "Bearer <token>"
  

    // Verify the token and extract the payload (which should include user_id)
    const decoded = jwt.verify(token, process.env.ACCESSTOKEN_SECRET); // Replace 'your-secret-key' with your actual secret key
    const user_id = decoded.userId;




  const { type, address, num_beds, num_bathrooms, num_rooms, description, longitude, latitude, amenities, city, listing_title, price} = req.body;

  console.log('Request body:', req.body)
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

    const response = await pool.query('SELECT owner_id FROM boardroom.property_owners WHERE user_id = $1', [user_id]);
    const ownerid = response.rows[0].owner_id;
    await pool.query('INSERT INTO boardroom.property_listings (property_id, owner_id, price, listing_title) VALUES ($1, $2, $3, $4)', [propertyId, ownerid, price, listing_title]);

    res.status(200).json({message: 'Property Uploaded Successfully!', propertyId: propertyId});
  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.uploadtest = async (req, res) =>{
  const { user_id } = req.params;
  const response = await pool.query('SELECT owner_id FROM boardroom.property_owners WHERE user_id = $1', [user_id]);
  const ownerid = response.rows[0].owner_id;
  

  res.status(200).json({message: 'Property Uploaded Successfully!', ownerid: ownerid});
}

exports.properties = async (req, res) => {
  const { user_id } = req.params;

  try {
    const query = `
      SELECT * FROM boardroom.property_info 
      WHERE user_id = $1
    `;

    const values = [user_id];

    const properties = await pool.query(query, values);

    res.status(200).json(properties.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


exports.deleteproperty = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  console.log("token: ", token);

  const { propertyId } = req.params;
  console.log("propertyId: ", propertyId);

  try {
      // Decode the JWT token to get the user_id
      const decodedToken = jwt.verify(token, process.env.ACCESSTOKEN_SECRET);
      const userId = decodedToken.userId;

      // First, check if the property exists
      const existQuery = `
          SELECT * FROM boardroom.property_info 
          WHERE property_id = $1
      `;

      const existValues = [propertyId];

      const existResponse = await pool.query(existQuery, existValues);

      if (existResponse.rows.length === 0) {
          return res.status(404).json({ message: 'Property does not exist or already deleted' });
      }

      // Then, check if the user owns the property
      const checkQuery = `
          SELECT * FROM boardroom.property_info 
          WHERE property_id = $1 AND user_id = $2
      `;

      const checkValues = [propertyId, userId];

      const checkResponse = await pool.query(checkQuery, checkValues);

      if (checkResponse.rows.length === 0) {
          return res.status(403).json({ message: 'You do not have permission to delete this property' });
      }

      // If the user owns the property, proceed with the deletion
      const deleteQuery = `
          DELETE FROM boardroom.property_info 
          WHERE property_id = $1
      `;

      const deleteValues = [propertyId];

      const deleteResponse = await pool.query(deleteQuery, deleteValues);

      res.status(200).json({message: 'Property Deleted Successfully!'});
  } catch(error) {    
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
}

exports.propertylistings = async (req, res) => {
  try {
      const sortOrder = req.query.sort;
      let query = `
        SELECT 
          listings.*, 
          COALESCE(reviews.review_count, 0) as review_count,
          COALESCE(ROUND(reviews.average_rating::numeric, 1), 0) as average_rating
        FROM 
          boardroom.getAllListings2() as listings
        LEFT JOIN 
          (SELECT property_id, COUNT(*) as review_count, AVG(rating) as average_rating FROM boardroom.reviews GROUP BY property_id) as reviews
        ON 
          listings.property_id = reviews.property_id
      `;

      if (sortOrder === 'lowest') {
          query += ' ORDER BY price ASC';
      } else if (sortOrder === 'highest') {
          query += ' ORDER BY price DESC';
      }

      const listings = await pool.query(query);
      res.status(200).json(listings.rows);
  } catch(error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
}

exports.propertyPins = async (req, res) =>{
  try{
      const listings = await pool.query('SELECT * FROM boardroom.propertyCoordinates()');
      res.status(200).json(listings.rows);
  }catch(error){
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }

}

exports.getAllProperty = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  try {
      // Decode the JWT token to get the user_id
      const decodedToken = jwt.verify(token, process.env.ACCESSTOKEN_SECRET);
      const userId = decodedToken.userId;

      const query = `
          SELECT pi.*, pl.*, COALESCE(AVG(r.rating), 0) as average_rating, img.image_name FROM boardroom.property_info pi
          INNER JOIN boardroom.property_listings pl ON pi.property_id = pl.property_id
          LEFT JOIN boardroom.reviews r ON pi.property_id = r.property_id
          LEFT JOIN boardroom.property_images img ON pi.property_id = img.property_id
          WHERE pi.user_id = $1
          GROUP BY pi.property_id, pl.listing_id, img.image_name
      `;

      const values = [userId];

      const response = await pool.query(query, values);

      res.status(200).json(response.rows);
  } catch(error) {    
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
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

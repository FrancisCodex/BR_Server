exports.viewproperty = async (res, req) =>{
    //viewproperty api here
    //lets user view property
    //this is used to view specific property pages and show their property details
    
}

exports.uploadproperty = async (res, req) =>{
    //uploadproperty api here
    //this api must be used by users who have owner role
    //this api must be used when owners want to list their properties
}
exports.propertylistings = async (res, req) =>{
    //uploadlistings api here
    //this api can list a property
    //this api is used when for example: listing pages so the users can see all the properties that are listed
    //this api must show the property listing details so the users can know the details of every property that is being listed on the system
}
exports.propertyedit = async (res, req) =>{
    //uploadedit api here
    //this api is to update the property details
    //only the owner role can only update the property details
    //this api can be edit the details of the properties
}
exports.deletelisting = async (res, req) =>{
    //deletelisting api here
    //this api is to to delete the listed property
    //only the owner or the admin can delete the property listing
}
var express = require('express');
var fs = require('fs');
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var productSchema = mongoose.Schema({
    product : {
	    name  		 	  : String,
	    description  	  : String,
		quantity     	  : Number,
		price      	 	  : Number,
		category 		  : String,
		specifications 	  : String,
		discount	 	  : Number,
		discountStartDate : Date,
		discountEndDate	  : Date,
		couponsAplicable  : Boolean,
		sellerID 		  : String,
		noOfItemsSold 	  : Number
	}
});

// create a field named productID for productSchema
/*productSchema.product.virtual('productID').get(function() {
    return this._id;
});
*/

/* saves the product details in collection named 'products' */
productSchema.methods.updateProduct = function(request, response, gfs, redirectTo){
	this.product.name = request.body.product_name;
	this.product.description = request.body.product_description;
	this.product.quantity = request.body.product_quantity;
	this.product.price = request.body.product_price;
	this.product.category = request.body.product_category;
	this.product.specifications = request.body.product_specifications;
	this.product.discount = request.body.product_discount;
	this.product.discountStartDate = request.body.product_startDate;
	this.product.discountEndDate = request.body.product_endDate;
	if(request.body.product_couponsApplicable == 'yes'){
		this.product.couponsAplicable = true;
	}
	else if(request.body.product_couponsApplicable == 'no'){
		this.product.couponsAplicable = false;
	}
	else{
		this.product.couponsAplicable = null;
	}
	this.product.noOfItemsSold = 0;
	this.product.sellerID = request.user.user.email;

	this.product.save(function(err) {
		if (err){
	        throw err;
		}
	    else{
			if(request.files.length > 0){		// images are attached
				for(var i=0; i<request.files.length;i++){
					var writeStream = gfs.createWriteStream({
			            filename: request.files[i].originalname,
			        	metadata: {"productname": request.body.product_name, "sellerID": request.user.user.email}
			    	});
			    	fs.createReadStream(request.files[i].path).pipe(writeStream);

			    	if(i == request.files.length-1){ // once all images are created redirect to the url passed in 'redirectTo' arguement
			    		response.redirect(redirectTo);
			    	}
				}
		    }
		    else{								// images not attached
		    	response.redirect(redirectTo);
		    }
	    }
    });
};

/* deletes the product passed in as arguement from the products collection */
productSchema.methods.deleteProduct = function(request, response, product, gfs, redirectTo){
	product.remove(function(err){
		if (err){
			throw err;
		} 
	    else{
	    	console.log("product deleted");
			gfs.files.find({$and: [{'metadata.productname': product.product.name}, {'metadata.sellerID': product.product.sellerID}]}).toArray(function (err, images) {
			    if (err) { throw (err); }		// error occured while fetching images
			    else if(images.length == 0){ 	// no images found for the product
			    	response.redirect(redirectTo); }		
			    else{							// images found for the product															
			    	var imagecounter = images.length;
				    images.forEach(function(image){									
				    	gfs.remove(image, function(err){
				    		if (err){ console.log("error in deleting image"); } 
				    		else { 
				    			imagecounter--; 
				    			console.log("image deleted successfully"); 
				    			if(imagecounter == 0) { response.redirect(redirectTo); }
				    		}
				    	});
				    });
			    }
			});
	    }
	});
}

module.exports = mongoose.model('Product', productSchema);

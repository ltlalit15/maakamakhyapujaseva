const Product = require('../models/productModels');
const AsyncAwaitError = require('../middleware/AsyncAwaitError');
const ApiFeatures = require('../utils/ApiFeatures');
const Cloudinary = require("cloudinary")

// Creating products by ADMIN
// exports.createProduct = AsyncAwaitError(async (req, res, next) => {

//   let images = [];
//   if (typeof req.body.images === "string") {
//     images.push(req.body.images);
//   } else if (Array.isArray(req.body.images)) {
//     images = req.body.images;
//   }


//   if (images && images.length > 0) {
//     let imageLink = [];

//     for (let i = 0; i < images.length; i++) {
//       const result = await Cloudinary.v2.uploader.upload(images[i], {
//         folder: "productsImages"
//       })

//       imageLink.push({
//         result: result.public_id,
//         url: result.secure_url
//       })
//     }

//     req.body.images = imageLink;
//   } else {
//     req.body.images = [];
//   }

//   req.body.user = req.ourUser.id;

//   const product = await Product.create(req.body);

//   res.status(201).json({
//     success: true,
//     product
//   })
// });
exports.createProduct = async (req, res, next) => {
  const { ...rest } = req.body;
  const img = req.uploadedImages;
  const poojaVideo = req.poojaVideo; // Video URL
  const freeParasad = req.freeParasad;
  const paidRemedy = req.paidRemedy;

  const result = await Product.create({
    images: img,
    poojaVideo, // Video URL Store kar raha hai
    freeParasad,
    paidRemedy,
    ...rest
  });

  res.status(201).json(result);
};

// Creating all products
exports.getAllProducts = AsyncAwaitError(async (req, res) => {

  // How many Items Will show in a single page below line
  const productsPerPage = 500;

  // Counting the Products for Frontend 
  const productCount = await Product.countDocuments();

  const features = new ApiFeatures(Product.find(), req.query).search().filter().pagination(productsPerPage);
  const products = await features.query;

  res.status(201).json({
    success: true,
    products,
    productCount,
    productsPerPage
  })
});

// Getting the Single product details
exports.getProductsDetails = AsyncAwaitError(async (req, res, next) => {
  const getProduct = await Product.findById(req.params.id);

  if (!getProduct) {
    return res.status(500).json({
      success: false,
      message: "Product Details not found"
    })
  }
  res.status(200).json({
    success: true,
    getProduct
  })
});

// Updating the products
exports.updateProducts = AsyncAwaitError(async (req, res, next) => {
  let updatedProduct = await Product.findById(req.params.id);

  if (!updatedProduct) {
    return res.status(500).json({
      success: false,
      message: "Product Not Found"
    })
  }

  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else if (Array.isArray(req.body.images)) {
    images = req.body.images;
  }

  if (images === undefined) {
    for (let i = 0; i < updatedProduct.images.length; i++) {
      await Cloudinary.v2.uploader.destroy(updatedProduct.images[i].public_id)
    }
  }

  if (images && images.length > 0) {
    let imageLink = [];

    for (let i = 0; i < images.length; i++) {
      const result = await Cloudinary.v2.uploader.upload(images[i], {
        folder: "productsImages"
      })

      imageLink.push({
        result: result.public_id,
        url: result.secure_url
      })
    }

    req.body.images = imageLink;
  } else {
    req.body.images = [];
  }

  updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  });

  res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
    updatedProduct
  })
});

// Deleting the product
exports.deleteProduct = AsyncAwaitError(async (req, res, next) => {

  try {
    let deletedProduct = await Product.findByIdAndDelete(req.params.id);

    // if (!deletedProduct) {
    //   return res.status(500).json({
    //     success: false,
    //     message: "Product Not Found"
    //   })
    // }

    // for (let i = 0; i < deletedProduct.images.length; i++) {
    //   await Cloudinary.v2.uploader.destroy(deletedProduct.images[i]?.public_id)
    // }
    // deletedProduct.remove();


    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
      deletedProduct
    })
  } catch (error) {
    console.log(error)
  }

});

// Search Products by Keyword
exports.searchProduct = AsyncAwaitError(async (req, res, next) => {
  let result = await Product.find({
    "$or": [
      {
        name: { $regex: req.params.keyword },
      },
      {
        category: { $regex: req.params.keyword },
      },
      {
        description: { $regex: req.params.keyword },
      }
    ]
  })
  res.status(200).json({ success: true, result })
})



// REVIEWS GIVEN BY CUSTOMERS TO PARTICULAR PRODUCT 
exports.createProductReview = AsyncAwaitError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const reviewData = {
    user: req.ourUser._id,
    name: req.ourUser.name,
    rating: Number(rating),
    comment,
  };

  try {
    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.ourUser._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.ourUser._id.toString()) {
          rev.rating = rating;
          rev.comment = comment;
        }
      });
    } else {
      product.reviews.push(reviewData);
      product.numOfReviews = product.reviews.length;
    }

    const ratings = product.reviews.map((rev) => rev.rating);
    const avg = ratings.reduce((total, rating) => total + rating, 0) / ratings.length;
    product.productRatings = avg;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  } catch (error) {

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
});

// Get All Reviews in a Single Product
exports.getAllProductsReview = AsyncAwaitError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    res.status(404).json({
      message: "Product Not Found"
    })
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Reviews
exports.deleteReview = AsyncAwaitError(async (req, res, next) => {
  const product = await Product.findById(req.query.ProductId);

  if (!product) {
    res.status(404).json({
      message: "Product Not Found to Deleted"
    })
  }

  const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());

  let avg = 0;
  reviews.forEach((rev) => {
    avg += avg.rating;
  })
  const ratings = avg / reviews.length;

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(req.query.productId, {
    reviews, ratings, numOfReviews
  }, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,
  });
})


// Get All Products (ADMIN)
exports.getAdminProducts = AsyncAwaitError(async (req, res) => {
  const products = await Product.find();

  res.status(201).json({
    success: true,
    products,
  })
});
const express = require('express');
const multer = require("multer"); // For handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { getAllProducts, createProduct, updateProducts, deleteProduct, getProductsDetails, createProductReview, getAllProductsReview, deleteReview, searchProduct, getAdminProducts } = require('../controllers/productController');
const { AuthenticateTheUser, AuthorizedPerson } = require('../middleware/AuthenticateTheUser');
const uploadCloudinary = require('../middleware/multipleimageupload');

const router = express.Router();

// For Getting the Products
router.route("/products").get(getAllProducts);

router.route("/product/:id").get(getProductsDetails);


router.route("/product/new").post(
    upload.fields([
      { name: "images", maxCount: 5 }, // Multiple images
      { name: "poojaVideo", maxCount: 1 }, // Single video
      { name: "freeParasad", maxCount: 1 }, // Single image
      { name: "paidRemedy", maxCount: 1 } // Single image
    ]),
    uploadCloudinary,
    createProduct
  );
  // Get All Products by ADMIN
router.route("/admin/all-products").get(getAdminProducts);

// Update ,Delete and getting the products details by ADMIN
router.route("/admin/product/:id").put(updateProducts).delete(deleteProduct);

// For Creating the Reviews and Updating Existed Reviews by ADMIN
router.route("/review").post(createProductReview);

router.route("/admin/reviews/:id").get(getAllProductsReview).delete(deleteReview);

// Search the products
router.route("/product/search/:keyword").get(searchProduct);

module.exports = router;
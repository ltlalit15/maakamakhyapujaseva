const Review = require("../models/reviewModel");

// ✅ POST - Add new review
exports.createReview = async (req, res) => {
  try {
    const { rating, title, message, reviewer } = req.body;

    if (!rating || !title || !message || !reviewer) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const review = new Review({ rating, title, message, reviewer });
    await review.save();

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

// ✅ GET - Fetch all reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

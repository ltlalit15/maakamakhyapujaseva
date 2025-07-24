const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: "dfporfl8y",
    api_key: "244749221557343",
    api_secret: "jDkVlzvkhHjb81EvaLjYgtNtKsY",
});

const uploadCloudinary = async (req, res, next) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json('No files were uploaded');
        }

        const uploadedImages = [];
        let poojaVideo = "";
        let freeParasad = "";
        let paidRemedy = "";

        // Upload images
        if (req.files.images) {
            for (const file of req.files.images) {
                const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
                const result = await cloudinary.uploader.upload(dataUrl);
                uploadedImages.push(result.secure_url);
            }
        }

        // Upload Pooja Video (Video file ke liye alag config use karein)
        if (req.files.poojaVideo) {
            const file = req.files.poojaVideo[0];
            const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

            const result = await cloudinary.uploader.upload(dataUrl, {
                resource_type: "video", // Video upload ke liye ye zaroori hai
                format: "mp4" // Specific format rakhna ho to define karein
            });

            poojaVideo = result.secure_url;
        }

        // Upload freeParasad
        if (req.files.freeParasad) {
            const file = req.files.freeParasad[0];
            if (file.size > 3145728) {
                return res.status(400).json({ message: "Pooja video size should not exceed 3 MB." });
            }
            const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            const result = await cloudinary.uploader.upload(dataUrl);
            freeParasad = result.secure_url;
        }

        // Upload paidRemedy
        if (req.files.paidRemedy) {
            const file = req.files.paidRemedy[0];
            const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
            const result = await cloudinary.uploader.upload(dataUrl);
            paidRemedy = result.secure_url;
        }

        req.uploadedImages = uploadedImages;
        req.poojaVideo = poojaVideo;
        req.freeParasad = freeParasad;
        req.paidRemedy = paidRemedy;

        next();
    } catch (error) {
        res.status(500).json({ message: "File was not uploaded in backend", error: error.message });
    }
};

module.exports = uploadCloudinary;


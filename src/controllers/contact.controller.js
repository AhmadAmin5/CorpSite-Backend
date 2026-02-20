import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import Contact from "../models/contact.model.js";


const submitContactQuery = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    if ([name, email, subject, message].some((field) => field?.trim() === "" || field === undefined)) {
        throw new ApiError(400, "Name, email, subject, and message are required", [{ code: "MISSING_FIELDS" }]);
    }

    const contact = await Contact.create({
        name,
        email,
        subject,
        message
    });

    if (!contact) {
        throw new ApiError(500, "Something went wrong while submitting your query");
    }

    return res.status(201).json(new ApiResponse(201, null, "Your message has been sent successfully"));
});


const getContactQueries = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status && req.query.status !== "all") {
        filter.status = req.query.status;
    }

    if (req.query.search) {
        const searchRegex = { $regex: req.query.search, $options: "i" };
        filter.$or = [
            { name: searchRegex },
            { email: searchRegex },
            { subject: searchRegex }
        ];
    }

    const queries = await Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalQueries = await Contact.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                queries,
                pagination: {
                    totalQueries,
                    currentPage: page,
                    totalPages: Math.ceil(totalQueries / limit)
                }
            },
            "Contact queries fetched successfully"
        )
    );
});


const getContactQueryById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const query = await Contact.findById(id);

    if (!query) {
        throw new ApiError(404, "Contact query not found", [{ code: "QUERY_NOT_FOUND" }]);
    }

    // Optionally auto-mark as read if it was unread when an admin opens it
    if (query.status === "unread") {
        query.status = "read";
        await query.save();
    }

    return res.status(200).json(new ApiResponse(200, query, "Contact query fetched successfully"));
});


const updateContactQuery = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const query = await Contact.findById(id);

    if (!query) {
        throw new ApiError(404, "Contact query not found", [{ code: "QUERY_NOT_FOUND" }]);
    }

    if (status) query.status = status;
    if (notes !== undefined) query.notes = notes;

    const updatedQuery = await query.save();

    return res.status(200).json(new ApiResponse(200, updatedQuery, "Contact query updated successfully"));
});


const deleteContactQuery = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const query = await Contact.findById(id);

    if (!query) {
        throw new ApiError(404, "Contact query not found", [{ code: "QUERY_NOT_FOUND" }]);
    }

    await query.deleteOne();

    return res.status(200).json(new ApiResponse(200, { id }, "Contact query deleted successfully"));
});

export {
    submitContactQuery,
    getContactQueries,
    getContactQueryById,
    updateContactQuery,
    deleteContactQuery
};
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const getPayload = (body = {}) => ({
    name: typeof body.name === "string" ? body.name.trim() : "",
    note: typeof body.note === "string" ? body.note.trim() : "",
});

const findDuplicate = (name, excludeId) => {
    const query = {
        name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    };
    if (excludeId) query._id = { $ne: excludeId };
    return Category.findOne(query);
};

const validateId = (res, id, entity = "Category") => {
    if (!mongoose.isValidObjectId(id)) {
        res.status(400).json({ success: false, error: `${entity} id is invalid!` });
        return false;
    }
    return true;
};

export const create = async (req, res, next) => {
    try {
        const { name, note } = getPayload(req.body);
        if (!name) {
            return res.status(400).json({ success: false, error: "Name is required!" });
        }
        if (await findDuplicate(name)) {
            return res.status(409).json({ success: false, error: "Category name already exists!" });
        }
        const result = await Category.create({ name, note });
        res.status(201).json({
            success: true,
            result,
        });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const parsedPage = Number.parseInt(req.query.page, 10);
        const parsedLimit = Number.parseInt(req.query.limit, 10);
        const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
        const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 100);
        const skip = (page - 1) * limit;

        const searchQuery = {};
        const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
        if (search) {
            searchQuery.$or = [
                { name: { $regex: search, $options: "i" } },
                { note: { $regex: search, $options: "i" } },
            ];
        }

        const [result, totalRecord] = await Promise.all([
            Category.find(searchQuery).limit(limit).skip(skip).sort({ createdAt: -1 }),
            Category.countDocuments(searchQuery),
        ]);

        res.status(200).json({
            success: true,
            result,
            page,
            limit,
            totalRecord,
            totalPage: Math.ceil(totalRecord / limit),
        });
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        if (!validateId(res, req.params.id)) return;
        const result = await Category.findById(req.params.id);
        if (!result) return res.status(404).json({ success: false, error: "Category not found!" });
        res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        if (!validateId(res, req.params.id)) return;

        const { name, note } = getPayload(req.body);
        if (!name) {
            return res.status(400).json({ success: false, error: "Name is required!" });
        }
        if (await findDuplicate(name, req.params.id)) {
            return res.status(409).json({ success: false, error: "Category name already exists!" });
        }

        const result = await Category.findByIdAndUpdate(
            req.params.id,
            { name, note },
            { new: true, runValidators: true }
        );
        if (!result) return res.status(404).json({ success: false, error: "Category not found!" });
        res.status(200).json({
            success: true,
            result,
        });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        if (!validateId(res, req.params.id)) return;

        const productCount = await Product.countDocuments({ category: req.params.id });
        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete this category because it is used by ${productCount} product${productCount === 1 ? "" : "s"}!`,
            });
        }

        const result = await Category.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ success: false, error: "Category not found!" });
        res.status(200).json({
            success: true,
            result: [],
        });
    } catch (error) {
        next(error);
    }
};

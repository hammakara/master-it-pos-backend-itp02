import path from "path"
import fs from 'fs'
import { fileURLToPath } from 'url'
const __fileName = fileURLToPath(import.meta.url)
const __dirName = path.dirname(__fileName)

export const uploadFile = (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No file Uploaded!"
            })
        }
        res.status(200).json({
            success: true,
            message: "Image uploaded success!",
            fileName: req.file.filename
        })
    } catch (error) {
        console.error(error)
    }
}
export const removeImage = (req, res) => {
    try {
        const { fileName } = req.params
        const filePath = path.join(__dirName, "../..", "uploads", fileName)
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: "Image not found!"
            })
        }
        fs.unlinkSync(filePath)
        res.status(200).json({
            success: true,
            message: "Image Deleted!"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
}


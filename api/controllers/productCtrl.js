const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");
const fs = require("fs");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const existingProduct = await Product.findOne({ slug: req.body.slug });

    if (existingProduct) {
      return res.status(400).json({ message: "Sản phẩm đã tồn tại" });
    }

    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct); // Trả về mã 201 khi tạo thành công
  } catch (error) {
    res.status(500).json({ error: error.message }); // Trả về lỗi nếu có
  }
});

// Tải lên hình ảnh
const uploadImages = asyncHandler(async (req, res) => {
  try {
    const uploader = (path) => cloudinaryUploadImg(path);

    const urls = [];
    const files = req.files;

    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      fs.unlinkSync(path); // Xóa tệp tạm sau khi tải lên
    }

    res.status(200).json(urls); // Trả về danh sách URL hình ảnh
  } catch (error) {
    res.status(500).json({ error: error.message }); // Trả về lỗi nếu có
  }
});

const deleteImages = asyncHandler(async (req, res) => {
  const { id } = req.params; // Lấy ID từ tham số URL
  try {
    // Xóa hình ảnh khỏi Cloudinary
    const deleted = await cloudinaryDeleteImg(id, "images");

    // Kiểm tra nếu hình ảnh đã bị xóa thành công
    if (deleted) {
      // Cập nhật cơ sở dữ liệu để xóa hình ảnh khỏi sản phẩm
      await Product.updateMany(
        { "images.public_id": id }, // Tìm sản phẩm có hình ảnh với public_id tương ứng
        { $pull: { images: { public_id: id } } } // Xóa hình ảnh khỏi danh sách
      );

      return res.json({ message: "Deleted" });
    } else {
      return res.status(404).json({ message: "Image not found" }); // Thông báo nếu không tìm thấy hình ảnh
    }
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    return res.status(500).json({ message: error.message });
  }
});

// Cập nhật sản phẩm
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Sản phẩm không tìm thấy" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message }); // Trả về lỗi nếu có
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Tìm sản phẩm để lấy thông tin hình ảnh
    const productToDelete = await Product.findById(id);
    if (!productToDelete) {
      return res.status(404).json({ error: "Sản phẩm không tìm thấy" });
    }

    // Xóa các hình ảnh của sản phẩm trên Cloudinary
    const imageDeletePromises = productToDelete.images.map(
      (image) => cloudinaryDeleteImg(image.public_id, "images") // Giả sử bạn lưu public_id trong trường images
    );
    await Promise.all(imageDeletePromises);

    // Xóa sản phẩm từ cơ sở dữ liệu
    await Product.findByIdAndDelete(id);

    res.status(204).json(); // Trả về 204 khi xóa thành công
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa sản phẩm" });
  }
});

// Lấy thông tin sản phẩm
const getProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  try {
    const foundProduct = await Product.findOne({ slug })
      .populate("optionIDs", "title")
      .populate("seriesID", "title")
      .populate("categoryID", "title")
      .populate("brandID", "title");

    if (!foundProduct) {
      return res.status(404).json({ error: "Sản phẩm không tìm thấy" });
    }

    res.json(foundProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy tất cả sản phẩm
const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields", "keyword"];
    excludeFields.forEach((el) => delete queryObj[el]);

    // Xử lý search keyword
    if (req.query.keyword) {
      const searchRegex = new RegExp(req.query.keyword, "i");
      queryObj.$or = [{ title: searchRegex }, { productID: searchRegex }];
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Xử lý multiple values (brand, category, etc.)
    Object.keys(queryObj).forEach((key) => {
      if (
        key !== "$or" &&
        queryObj[key] &&
        typeof queryObj[key] === "string" &&
        queryObj[key].includes(",")
      ) {
        queryObj[key] = { $in: queryObj[key].split(",") };
      }
    });

    let query = Product.find(queryObj);

    // Sắp xếp
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Select fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Phân trang
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Thực hiện query
    const products = await query;
    const totalProducts = await Product.countDocuments(queryObj);

    res.json({
      status: "success",
      results: products.length,
      totalProducts,
      currentPage: page,
      products,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = {
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
  getAllProduct,
  uploadImages,
  deleteImages,
};

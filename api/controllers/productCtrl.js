const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");
const fs = require("fs");
const slugify = require("slugify");
const Filter = require("../models/filterModel");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    if (req.body.relatedProducts) {
      if (typeof req.body.relatedProducts === "string") {
        req.body.relatedProducts = req.body.relatedProducts
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      } else if (Array.isArray(req.body.relatedProducts)) {
        req.body.relatedProducts = req.body.relatedProducts
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    // Xử lý matchingProducts
    if (req.body.matchingProducts) {
      if (typeof req.body.matchingProducts === "string") {
        req.body.matchingProducts = req.body.matchingProducts
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      } else if (Array.isArray(req.body.matchingProducts)) {
        req.body.matchingProducts = req.body.matchingProducts
          .map((item) => item.trim())
          .filter(Boolean);
      }
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
    if (req.body.relatedProducts) {
      if (typeof req.body.relatedProducts === "string") {
        req.body.relatedProducts = req.body.relatedProducts
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      } else if (Array.isArray(req.body.relatedProducts)) {
        req.body.relatedProducts = req.body.relatedProducts
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    // Xử lý matchingProducts
    if (req.body.matchingProducts) {
      if (typeof req.body.matchingProducts === "string") {
        req.body.matchingProducts = req.body.matchingProducts
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      } else if (Array.isArray(req.body.matchingProducts)) {
        req.body.matchingProducts = req.body.matchingProducts
          .map((item) => item.trim())
          .filter(Boolean);
      }
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
    const imageDeletePromises = productToDelete.images.map((image) =>
      cloudinaryDeleteImg(image.public_id, "images")
    );
    await Promise.all(imageDeletePromises);

    // Xóa sản phẩm từ cơ sở dữ liệu
    await Product.findByIdAndDelete(id);

    res.status(204).json(); // Trả về 204 khi xóa thành công
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa sản phẩm" });
  }
});

// Lấy một sản phẩm
const getProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  try {
    const foundProduct = await Product.findOne({ slug })
      .populate("optionIDs", "title")
      .populate("seriesID", "title")
      .populate("categoryID", "title slug")
      .populate("brandID", "title slug");

    // Nếu không tìm thấy sản phẩm
    if (!foundProduct) {
      return res.status(404).json({ error: "Sản phẩm không tìm thấy" });
    }

    // Nếu sản phẩm bị disable và không phải admin thì không cho xem
    if (foundProduct.isDisabled) {
      return res.status(404).json({ error: "Sản phẩm không tìm thấy" });
    }

    res.json(foundProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// const getAllProduct = asyncHandler(async (req, res) => {
//   try {
//     const queryObj = { ...req.query };
//     const excludeFields = ["page", "sort", "limit", "fields", "keyword"];
//     excludeFields.forEach((el) => delete queryObj[el]);

//     queryObj.isDisabled = false;

//     // 🔍 Xử lý tìm kiếm theo keyword
//     if (req.query.keyword) {
//       const searchRegex = new RegExp(req.query.keyword, "i");
//       queryObj.$or = [{ title: searchRegex }, { productID: searchRegex }];
//     }

//     // 📌 Lấy danh sách Filter để ánh xạ optionID → filterID
//     const filters = await Filter.find({}, { _id: 1, optionIDs: 1 });

//     // 📌 Tạo ánh xạ optionID → filterID
//     const optionToFilterMap = {};
//     filters.forEach(({ _id, optionIDs }) => {
//       optionIDs.forEach((optionID) => {
//         optionToFilterMap[optionID.toString()] = _id.toString();
//       });
//     });

//     // 🔍 Xử lý lọc theo optionIDs
//     let productIDGroups = []; // Lưu các nhóm ID sản phẩm theo từng filterID
//     if (queryObj.optionIDs) {
//       const selectedOptionIDs = queryObj.optionIDs.split(",");

//       // Nhóm optionIDs theo filterID
//       const filterGroups = {};
//       selectedOptionIDs.forEach((optionID) => {
//         const filterID = optionToFilterMap[optionID];
//         if (filterID) {
//           if (!filterGroups[filterID]) filterGroups[filterID] = [];
//           filterGroups[filterID].push(optionID);
//         }
//       });

//       // 📌 Tìm danh sách sản phẩm phù hợp với từng nhóm điều kiện
//       for (const filterID in filterGroups) {
//         const options = filterGroups[filterID];

//         // Lấy danh sách sản phẩm có ít nhất một giá trị trong nhóm filterID này
//         const productsInGroup = await Product.find({
//           [`filters.${filterID}`]: { $in: options },
//         }).select("_id");

//         const productIDs = productsInGroup.map((p) => p._id.toString());
//         productIDGroups.push(productIDs);
//       }
//     }

//     // 📌 Xác định danh sách sản phẩm thỏa mãn tất cả nhóm filter đã chọn
//     let finalProductIDs = [];
//     if (productIDGroups.length > 0) {
//       finalProductIDs = productIDGroups.reduce((acc, group) => {
//         if (acc.length === 0) return group;
//         return acc.filter((id) => group.includes(id)); // Lọc những sản phẩm có mặt trong tất cả nhóm
//       }, []);
//     }

//     console.log("🔥 Danh sách sản phẩm sau lọc:", finalProductIDs);

//     let query = Product.find(
//       finalProductIDs.length ? { _id: { $in: finalProductIDs } } : {}
//     );

//     // 📌 Xử lý sắp xếp
//     if (req.query.sort) {
//       let sortBy = req.query.sort;
//       switch (sortBy) {
//         case "price_asc":
//           query = query.sort("prices");
//           break;
//         case "price_desc":
//           query = query.sort("-prices");
//           break;
//         case "most_view":
//           query = query.sort("-views");
//           break;
//         case "default":
//           query = query.sort("-createdAt");
//           break;
//         default:
//           sortBy = sortBy.split(",").join(" ");
//           query = query.sort(sortBy);
//       }
//     } else {
//       query = query.sort("-createdAt");
//     }

//     // 📌 Xử lý chọn trường dữ liệu trả về
//     if (req.query.fields) {
//       const fields = req.query.fields.split(",").join(" ");
//       query = query.select(fields);
//     } else {
//       query = query.select("-__v");
//     }

//     // 📌 Xử lý phân trang
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const skip = (page - 1) * limit;
//     query = query.skip(skip).limit(limit);

//     // 📌 Thực hiện query
//     const products = await query;
//     const totalProducts = finalProductIDs.length;

//     res.json({
//       status: "success",
//       results: products.length,
//       totalProducts,
//       currentPage: page,
//       products,
//     });
//   } catch (error) {
//     console.error("🔥 Lỗi API getAllProduct:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// Lấy tất cả sản phẩm
const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields", "keyword"];
    excludeFields.forEach((el) => delete queryObj[el]);

    queryObj.isDisabled = false;

    // Xử lý search keyword
    if (req.query.keyword) {
      const searchRegex = new RegExp(req.query.keyword, "i");
      queryObj.$or = [{ title: searchRegex }, { productID: searchRegex }];
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // Xử lý lọc nhiều tiêu chí
    const filterConditions = [];

    Object.keys(queryObj).forEach((key) => {
      const value = queryObj[key];

      if (typeof value === "string" && value.includes(",")) {
        // Nếu một tiêu chí có nhiều giá trị → Dùng $in (cho phép một trong số đó)
        const values = value.split(",");
        filterConditions.push({ [key]: { $all: values } });
      } else {
        // Nếu tiêu chí có một giá trị duy nhất → Phải thỏa mãn chính xác giá trị đó
        filterConditions.push({ [key]: value });
      }
    });

    // Nếu có nhiều tiêu chí khác nhau, dùng $and để sản phẩm phải thỏa mãn tất cả tiêu chí
    const finalQuery =
      filterConditions.length > 0 ? { $and: filterConditions } : {};

    let query = Product.find(finalQuery);

    // Sắp xếp
    if (req.query.sort) {
      let sortBy = req.query.sort;

      switch (sortBy) {
        case "price_asc":
          query = query.sort("prices");
          break;
        case "price_desc":
          query = query.sort("-prices");
          break;
        case "most_view":
          query = query.sort("-views");
          break;
        case "default":
          query = query.sort("-createdAt");
          break;
        default:
          sortBy = sortBy.split(",").join(" ");
          query = query.sort(sortBy);
      }
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
    const totalProducts = await Product.countDocuments(finalQuery);

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

// Thêm hàm mới để cập nhật lượt xem
const updateProductViews = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  try {
    const product = await Product.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }

    res.json({ views: product.views });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const toggleProductStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { isDisabled: !product.isDisabled },
      { new: true }
    );

    const message = updatedProduct.isDisabled
      ? "Sản phẩm đã được vô hiệu hóa"
      : "Sản phẩm đã được kích hoạt";

    res.status(200).json({ message, updatedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lấy một sản phẩm cho Admin
const getProductAdmin = asyncHandler(async (req, res) => {
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

// Lấy tất cả sản phẩm cho Admin
const getAllProductAdmin = asyncHandler(async (req, res) => {
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
      let sortBy = req.query.sort;

      // Xử lý sort theo giá
      switch (sortBy) {
        case "price_asc":
          query = query.sort("prices");
          break;
        case "price_desc":
          query = query.sort("-prices");
          break;
        case "most_view":
          query = query.sort("-views");
          break;
        case "default":
          query = query.sort("-createdAt");
          break;
        default:
          sortBy = sortBy.split(",").join(" ");
          query = query.sort(sortBy);
      }
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
  getProductAdmin,
  deleteProduct,
  getAllProduct,
  getAllProductAdmin,
  uploadImages,
  deleteImages,
  updateProductViews,
  toggleProductStatus,
};

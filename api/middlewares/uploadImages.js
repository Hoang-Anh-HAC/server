// src/middleware/uploadMiddleware.js
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Cấu hình multer cho việc upload
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
  },
});

// Kiểm tra loại file
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      {
        message: "Unsupported file format",
      },
      false
    );
  }
};

// Khởi tạo multer
const uploadPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fieldSize: 2000000 },
});

// Giữ nguyên hàm productImgResize của bạn
const productImgResize = async (req, res, next) => {
  if (!req.files) return next();

  await Promise.all(
    req.files.map(async (file) => {
      try {
        const tempPath = file.path; // Đường dẫn của tệp gốc
        const outputPath = path.join(
          __dirname,
          "../public/images/products", // Thư mục lưu trữ ảnh đã chỉnh sửa
          "resized-" + file.filename // Đổi tên file để tránh trùng lặp
        );

        // Tạo thư mục "resized" nếu chưa tồn tại
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        // Xử lý hình ảnh bằng Sharp và lưu vào outputPath
        await sharp(tempPath)
          .resize(300, 300, { fit: sharp.fit.cover }) // Resize với chế độ phủ
          .toFormat("png") // Sử dụng định dạng PNG để giữ độ trong suốt
          .png({ quality: 90 }) // Đặt chất lượng cho PNG
          .toFile(outputPath);

        // Cập nhật file.path để trỏ tới tệp đã chỉnh sửa
        file.path = outputPath;

        // Xóa tệp gốc sau khi xử lý xong
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (error) {
        console.error("Lỗi khi xử lý hình ảnh:", error);
      }
    })
  );

  next();
};

const iconResize = async (req, res, next) => {
  if (!req.files) return next();

  await Promise.all(
    req.files.map(async (file) => {
      try {
        const tempPath = file.path; // Đường dẫn của tệp gốc
        const outputPath = path.join(
          __dirname,
          "../public/images/icons", // Thư mục lưu trữ ảnh đã chỉnh sửa
          "resized-" + file.filename // Đổi tên file để tránh trùng lặp
        );

        // Tạo thư mục "resized" nếu chưa tồn tại
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });

        // Xử lý hình ảnh bằng Sharp và lưu vào outputPath
        await sharp(tempPath)
          .resize(25, 25, { fit: sharp.fit.cover }) // Resize với chế độ phủ
          .toFormat("png") // Sử dụng định dạng PNG để giữ độ trong suốt
          .png({ quality: 90 }) // Đặt chất lượng cho PNG
          .toFile(outputPath);

        // Cập nhật file.path để trỏ tới tệp đã chỉnh sửa
        file.path = outputPath;

        // Xóa tệp gốc sau khi xử lý xong
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      } catch (error) {
        console.error("Lỗi khi xử lý hình ảnh:", error);
      }
    })
  );

  next();
};

module.exports = { uploadPhoto, productImgResize, iconResize };

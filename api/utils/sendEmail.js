const axios = require("axios");

/**
 * Gửi email thông báo về việc khách hàng muốn liên hệ để mua sản phẩm.
 *
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} name - Tên người gửi (khách hàng)
 * @param {string} phone - Số điện thoại của khách hàng
 * @param {string} email - Địa chỉ email của khách hàng
 * @param {string} message - Nội dung tin nhắn khách hàng gửi
 * @param {string} prodID - Mã sản phẩm mà khách hàng muốn mua
 */
const sendEmail = async (to, subject, name, phone, email, message, prodID) => {
  try {
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f9;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .email-container {
              max-width: 600px;
              margin: 30px auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
              border-top: 5px solid #3b8dbd;
            }
            .header h1 {
              text-align: center;
              background-color: #3b8dbd;
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
            }
            .content {
              padding: 20px;
            }
            h1 {
              color: #333;
              font-size: 24px;
              margin-bottom: 20px;
            }
            p {
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 10px;
            }
            .content ul {
              margin-left: 20px;
              font-size: 16px;
              line-height: 1.6;
            }
            .content li {
              margin-bottom: 10px;
            }
            .cta-button {
              display: inline-block;
              background-color: #3b8dbd;
              color: white;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin-top: 20px;
              text-align: center;
            }
            .cta-button:hover {
              background-color: #1f6a8b;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 14px;
              color: #888;
            }
            .footer a {
              color: #3b8dbd;
              text-decoration: none;
            }
            .footer a:hover {
              text-decoration: underline;
            }
            .footer p {
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Khách Hàng Quan Tâm Đến Sản Phẩm</h1>
            </div>
            <div class="content">
              <p><strong>Thông báo:</strong> Chúng tôi vừa nhận được yêu cầu từ khách hàng về sản phẩm mà họ quan tâm. Dưới đây là thông tin chi tiết của khách hàng.</p>
              
              <p><strong>Chi tiết khách hàng:</strong></p>
              <ul>
                <li><strong>Mã sản phẩm:</strong> ${prodID}</li>
                <li><strong>Tên khách hàng:</strong> ${name}</li>
                <li><strong>Số điện thoại:</strong> ${phone}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Nội dung tin nhắn:</strong> ${message}</li>
              </ul>

              <p>Vui lòng liên hệ với khách hàng càng sớm càng tốt để hỗ trợ họ. Để bắt đầu liên hệ, hãy nhấn vào nút dưới đây.</p>

              <a href="#" class="cta-button">Liên hệ với khách hàng</a>
            </div>

            <div class="footer">
              <p>Trân trọng,<br>CÔNG TY TNHH PHÁT TRIỂN CNTT HOÀNG ANH - HAC</p>
              <p>
                <a href="mailto:giaule@hac.com.vn?subject=Liên hệ với khách hàng: ${name}&body=Thông tin khách hàng:%0A%0ATên: ${name}%0AMã sản phẩm: ${prodID}%0ASố điện thoại: ${phone}%0AEmail: ${email}%0A%0ANội dung tin nhắn: ${message}" target="_blank">
                  Phụ trách kinh doanh: Ms Lê Thị Ngọc Giàu
                </a>
              </p>
              <p>
                <a href="mailto:lanhha@hac.com.vn?subject=Liên hệ với khách hàng: ${name}&body=Thông tin khách hàng:%0A%0ATên: ${name}%0AMã sản phẩm: ${prodID}%0ASố điện thoại: ${phone}%0AEmail: ${email}%0A%0ANội dung tin nhắn: ${message}" target="_blank">
                  Phụ trách kinh doanh: Mr Hà Xuân Lành
                </a>
              </p>
              <p>
                <a href="mailto:trungtran@hac.com.vn?subject=Liên hệ với khách hàng: ${name}&body=Thông tin khách hàng:%0A%0ATên: ${name}%0AMã sản phẩm: ${prodID}%0ASố điện thoại: ${phone}%0AEmail: ${email}%0A%0ANội dung tin nhắn: ${message}" target="_blank">
                  Phụ trách kinh doanh: Mr Trần Thanh Trung
                </a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await axios.post(
      "https://api.elasticemail.com/v2/email/send",
      null,
      {
        params: {
          apikey: process.env.ELASTIC_EMAIL_API_KEY,
          from: process.env.ELASTIC_EMAIL_FROM,
          to, // Địa chỉ email nhận
          subject, // Tiêu đề email
          bodyHtml: htmlContent, // Nội dung email dạng HTML
          isTransactional: true, // Đặt là true nếu đây là email giao dịch
        },
      }
    );

    console.log("Email đã được gửi thành công:", response.data);
  } catch (error) {
    console.error("Lỗi khi gửi email:", error.response?.data || error.message);
    throw new Error("Không thể gửi email");
  }
};

module.exports = sendEmail;

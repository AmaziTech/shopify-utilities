# shopify-utilities
Các tiện ích nho nhỏ viết bằng NodeJS (Javascript) để làm việc với shopify qua API thay vì thao tác tay.

## product_uploader.js
Làm các việc đơn giản bên dưới - cho sản phẩm là sách:
- lấy tất cả các records chưa được xử lý (status=1) trong cơ sở dữ liệu
- với từng record:
    - lấy ảnh cover của sách (book.cover_url) và convert sang định dạng base64 (để gửi được lên shopify qua https) 
    - tạo thông tin sản phẩm
    - gọi hàm shopify.product.create để đưa sản phẩm lên store.
    - update lại cơ sở dữ liệu (update book.status từ 1 (chưa được xử lý) thành 9 (đã đưa lên store))
    - nếu có lỗi xảy ra thì update lại cơ sở dữ liệu (update book.status từ 1 (chưa xử lý) thành 10 (đã cố thử đưa lên store nhưng lỗi xảy ra))

### Chú ý:
- Logic trên là để giải quyết nghiệp vụ của mình. Các bạn có lẽ chỉ tham khảo được hướng xử lý và cách gọi hàm shopify.product.create để đưa lên store.
- Nếu dữ liệu của các bạn ở dạng csv hay loại khác thì cần đọc từ đó và đóng gói thành parameter mà shopify chấp nhận.
Xử lý nôm na chỉ đơn giản là: với từng sản phẩm, tạo parameter mà shopify chấp nhận, rồi gọi hàm shopify.product.create.

## product_status_updater.js
Update lại status cho tất cả các sản phẩm trên store , từ 'active' thành 'draft'
Các bạn có thể tham khảo để update các thuộc tính mà các bạn cần.

## Các thư viện sử dụng
- prisma : thư viện về ORM - hỗ trợ thao tác với database bằng NodeJS - đỡ phải viết SQL.
  https://www.prisma.io

- dotenv : lib để tự động đọc các parameter trong  file .env và mapping sang process.env
  https://www.npmjs.com/package/dotenv

- image-to-base64: thư viện giúp download file ảnh trên mạng/cdn và chuyển sang định dạng base64

- cli-progress: tạo progressbar cho terminal app
- shopify-api-node: thư viện của shopify để tương tác với store qua API 

## Cách chạy
- Cài nodejs 
  https://nodejs.org/en/download/

- cài các lib cần sử dụng
  npm install

- chạy chương trình
  ex: node product_uploader.js 
      node product_status_updater.js
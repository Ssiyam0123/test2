class ApiResponse {
  constructor(statusCode, data, message = "Success", pagination = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400; // 400 এর নিচে হলে true, নাহলে false
    this.message = message;
    this.data = data;
    
    // যদি পেজিনেশন থাকে, তাহলেই শুধু এটা রেসপন্সে অ্যাড হবে
    if (pagination) {
      this.pagination = pagination;
    }
  }
}

export default ApiResponse;
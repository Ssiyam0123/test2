export const validate = (schema) => (req, res, next) => {
  try {
    // 🚀 রিকোয়েস্ট বডি ভ্যালিডেট করা হচ্ছে
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    // 🚀 টার্মিনালে বিশাল করে এরর প্রিন্ট করবে যাতে চোখে পড়ে!
    console.log("\n========================================");
    console.log("🚨 VALIDATION FAILED 🚨");
    console.log(`Route: ${req.method} ${req.originalUrl}`);
    console.log("📦 Received Data (req.body):", JSON.stringify(req.body, null, 2));

    let errorDetails = error.message;

    // instanceof এর বদলে duck-typing ইউজ করা হলো যাতে ক্র্যাশ না করে
    if (error.name === "ZodError" || error.errors) {
      errorDetails = error.errors.map(err => {
        const field = err.path.length > 0 ? err.path.join(".") : "ROOT_OBJECT";
        return { field, issue: err.message };
      });
      console.log("\n❌ Zod Rejection Reasons:");
      console.table(errorDetails);
    } else {
      console.log("\n❌ Raw Error:", error);
    }
    console.log("========================================\n");

    // 🚀 ফ্রন্টএন্ডে সুন্দর করে 400 Bad Request পাঠাবে
    return res.status(400).json({
      success: false,
      message: "Data Validation Failed!",
      errors: errorDetails,
    });
  }
};
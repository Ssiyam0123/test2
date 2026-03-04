// backend/middlewares/validate.js
export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    console.log("Joi Validation Error Details:", error.details); 
    
    const errorMessage = error.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({ success: false, message: errorMessage });
  }
  next();
};
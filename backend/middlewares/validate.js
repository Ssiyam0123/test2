import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    // Zod parses and strips unknown fields
    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    console.warn(`[Validation Error] Path: ${req.originalUrl}`);
    
    // Safely format Zod errors without crashing
    let errorMessage = "Invalid input data";
    
    if (error instanceof ZodError) {
      errorMessage = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(" | ");
      console.warn("Details:", errorMessage); // For your backend debugging
    } else {
      errorMessage = error.message;
    }
    
    return res.status(400).json({ 
        success: false, 
        message: "Validation Failed",
        errors: errorMessage 
    });
  }
};
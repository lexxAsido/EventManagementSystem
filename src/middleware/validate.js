// Reusable validator: validate(schema) for req.body, validate(schema, "query") for query strings
const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false, // report all errors, not just the first
      stripUnknown: true, // drop fields we didn't ask for
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((d) => d.message),
      });
    }

    if (source === "body") req.body = value; // use the cleaned values
    next();
  };

module.exports = validate;
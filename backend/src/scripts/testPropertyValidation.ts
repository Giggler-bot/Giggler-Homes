import { log } from "console";
import { createPropertySchema } from "../modules/properties/property.validation.js";

const validateProperty = {
    body: {
        title: "Modern Two-bedroom Apartment in Accra",
        description: "A comfortable two-bedroom apartment located in East-legon Accra Ghana",
        bedrooms: 2,
        bathrooms: 2,
    },

};

const result = createPropertySchema.safeParse(
    validateProperty,
);

console.log(result);
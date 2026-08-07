import { prisma } from "../../src/lib/prisma"

export async function seedPropertyCategories() {
    const categories = [
        {
            name: "Residential",
            description: "Properties intended for people to live in.",
        },
        {
            name: "Commercial",
            description: "Properties used for business purposes.",
        },
        {
            name: "Hospitality",
            description: "Hotels, guest house, resorts and hostels.",

        },
        {
            name: "Land",
            description: "Undeveloped land and plots."
        }
    ];

    for(const category of categories){
        await prisma.propertyCategory.upsert({
            where: {
                name: category.name,
            },
            update: {},
            create: category,
        });
    }

    console.log("✅ Property categories seed.")
}
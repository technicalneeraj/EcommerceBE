const Category = require("../models/category");

const addingCategories = async () => {
    try {
        
        const men = new Category({ type: "Men", parent: [] });
        const women = new Category({ type: "Women", parent: [] });
        const kids = new Category({ type: "Kids", parent: [] });

        await Promise.all([men.save(), women.save(), kids.save()]);

        const upperWear = new Category({ type: "Upper Wear", parent: [] });
        const lowerWear = new Category({ type: "Lower Wear", parent: [] });

        await Promise.all([upperWear.save(), lowerWear.save()]);

        const categories = [
            { type: "T-Shirts", parent: [upperWear._id, men._id, women._id, kids._id] },
            { type: "Shirts", parent: [upperWear._id, men._id, women._id] },
            { type: "Jackets", parent: [upperWear._id, men._id, women._id, kids._id] },
            { type: "Tops", parent: [upperWear._id, women._id, kids._id] },
            { type: "Hoodies", parent: [upperWear._id, kids._id] },
            { type: "Jeans", parent: [lowerWear._id, men._id, women._id, kids._id] },
            { type: "Shorts", parent: [lowerWear._id, men._id, women._id, kids._id] },
            { type: "Trousers", parent: [lowerWear._id, men._id, women._id] },
            { type: "Skirts", parent: [lowerWear._id, women._id] },
        ];

        await Promise.all(categories.map(cat => new Category(cat).save()));

        console.log("Categories added successfully!");
    } catch (error) {
        console.error("Error adding categories:", error);
    }
};

module.exports = { addingCategories };

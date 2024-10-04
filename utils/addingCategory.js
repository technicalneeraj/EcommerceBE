const Category = require("../Models/category");

const addingCategories = async () => {
    try {
        const men = new Category({ name: "Men" });
        const women = new Category({ name: "Women" });
        const kids = new Category({ name: "Kids" });

        await men.save();
        await women.save();
        await kids.save();

        const upperWearMen = new Category({ name: "Upper Wear", parentCategory: men._id });
        const lowerWearMen = new Category({ name: "Lower Wear", parentCategory: men._id });

        const upperWearWomen = new Category({ name: "Upper Wear", parentCategory: women._id });
        const lowerWearWomen = new Category({ name: "Lower Wear", parentCategory: women._id });

        const upperWearKids = new Category({ name: "Upper Wear", parentCategory: kids._id });
        const lowerWearKids = new Category({ name: "Lower Wear", parentCategory: kids._id });

        await Promise.all([
            upperWearMen.save(),
            lowerWearMen.save(),
            upperWearWomen.save(),
            lowerWearWomen.save(),
            upperWearKids.save(),
            lowerWearKids.save()
        ]);

       
        const tShirtsMen = new Category({ name: "T-Shirts", parentCategory: upperWearMen._id });
        const shirtsMen = new Category({ name: "Shirts", parentCategory: upperWearMen._id });
        const jacketsMen = new Category({ name: "Jackets", parentCategory: upperWearMen._id });

        const tShirtsWomen = new Category({ name: "T-Shirts", parentCategory: upperWearWomen._id });
        const topsWomen = new Category({ name: "Tops", parentCategory: upperWearWomen._id });
        const jacketsWomen = new Category({ name: "Jackets", parentCategory: upperWearWomen._id });

        const tShirtsKids = new Category({ name: "T-Shirts", parentCategory: upperWearKids._id });
        const hoodiesKids = new Category({ name: "Hoodies", parentCategory: upperWearKids._id });
        const jacketsKids = new Category({ name: "Jackets", parentCategory: upperWearKids._id });

        await Promise.all([
            tShirtsMen.save(),
            shirtsMen.save(),
            jacketsMen.save(),
            tShirtsWomen.save(),
            topsWomen.save(),
            jacketsWomen.save(),
            tShirtsKids.save(),
            hoodiesKids.save(),
            jacketsKids.save()
        ]);

        const jeansMen = new Category({ name: "Jeans", parentCategory: lowerWearMen._id });
        const shortsMen = new Category({ name: "Shorts", parentCategory: lowerWearMen._id });
        const trousersMen = new Category({ name: "Trousers", parentCategory: lowerWearMen._id });

        const skirtsWomen = new Category({ name: "Skirts", parentCategory: lowerWearWomen._id });
        const jeansWomen = new Category({ name: "Jeans", parentCategory: lowerWearWomen._id });
        const trousersWomen = new Category({ name: "Trousers", parentCategory: lowerWearWomen._id });

        const jeansKids = new Category({ name: "Jeans", parentCategory: lowerWearKids._id });
        const shortsKids = new Category({ name: "Shorts", parentCategory: lowerWearKids._id });
        const trousersKids = new Category({ name: "Trousers", parentCategory: lowerWearKids._id });

        await Promise.all([
            jeansMen.save(),
            shortsMen.save(),
            trousersMen.save(),
            skirtsWomen.save(),
            jeansWomen.save(),
            trousersWomen.save(),
            jeansKids.save(),
            shortsKids.save(),
            trousersKids.save()
        ]);

        console.log("Categories added successfully!");

    } catch (error) {
        console.error("Error adding categories:", error);
    }
};

module.exports = { addingCategories };

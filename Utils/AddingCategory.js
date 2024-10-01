const Category=require("../Models/category")

const addCategories = async () => {
    try {

        const men = new Category({ name: "Men", level: 1 });
        const women = new Category({ name: "Women", level: 1 });
        const kids = new Category({ name: "Kids", level: 1 });

        await men.save();
        await women.save();
        await kids.save();

        const upperWearMen = new Category({ name: "Upper Wear", parentCategory: men._id, level: 2 });
        const lowerWearMen = new Category({ name: "Lower Wear", parentCategory: men._id, level: 2 });

        const upperWearWomen = new Category({ name: "Upper Wear", parentCategory: women._id, level: 2 });
        const lowerWearWomen = new Category({ name: "Lower Wear", parentCategory: women._id, level: 2 });

        const upperWearKids = new Category({ name: "Upper Wear", parentCategory: kids._id, level: 2 });
        const lowerWearKids = new Category({ name: "Lower Wear", parentCategory: kids._id, level: 2 });

        await Promise.all([
            upperWearMen.save(),
            lowerWearMen.save(),
            upperWearWomen.save(),
            lowerWearWomen.save(),
            upperWearKids.save(),
            lowerWearKids.save()
        ]);

        
        const tShirtsMen = new Category({ name: "T-Shirts", parentCategory: upperWearMen._id, level: 3 });
        const shirtsMen = new Category({ name: "Shirts", parentCategory: upperWearMen._id, level: 3 });
        const jacketsMen = new Category({ name: "Jackets", parentCategory: upperWearMen._id, level: 3 });

        const tShirtsWomen = new Category({ name: "T-Shirts", parentCategory: upperWearWomen._id, level: 3 });
        const topsWomen = new Category({ name: "Tops", parentCategory: upperWearWomen._id, level: 3 });
        const jacketsWomen = new Category({ name: "Jackets", parentCategory: upperWearWomen._id, level: 3 });

        const tShirtsKids = new Category({ name: "T-Shirts", parentCategory: upperWearKids._id, level: 3 });
        const hoodiesKids = new Category({ name: "Hoodies", parentCategory: upperWearKids._id, level: 3 });
        const jacketsKids = new Category({ name: "Jackets", parentCategory: upperWearKids._id, level: 3 });

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

        const jeansMen = new Category({ name: "Jeans", parentCategory: lowerWearMen._id, level: 3 });
        const shortsMen = new Category({ name: "Shorts", parentCategory: lowerWearMen._id, level: 3 });
        const trousersMen = new Category({ name: "Trousers", parentCategory: lowerWearMen._id, level: 3 });

        const skirtsWomen = new Category({ name: "Skirts", parentCategory: lowerWearWomen._id, level: 3 });
        const jeansWomen = new Category({ name: "Jeans", parentCategory: lowerWearWomen._id, level: 3 });
        const trousersWomen = new Category({ name: "Trousers", parentCategory: lowerWearWomen._id, level: 3 });

        const jeansKids = new Category({ name: "Jeans", parentCategory: lowerWearKids._id, level: 3 });
        const shortsKids = new Category({ name: "Shorts", parentCategory: lowerWearKids._id, level: 3 });
        const trousersKids = new Category({ name: "Trousers", parentCategory: lowerWearKids._id, level: 3 });

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

module.exports={addCategories}

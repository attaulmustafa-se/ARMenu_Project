
import Menu from '../model/menu.model.js';


export const addmenu = async (req, res) => {
    try {
        const name = "Chicken Duck";
        const price = 1000;
        const isAvailable = true;
        const URLmodel = "ARModels/chicken_duck.glb";
        await Menu.create({ name, price, isAvailable, URLmodel });
        
        return res.status(200).json({message: "Menu added successfully"});
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not add menu item",
            error: error.message
        });
    }
};

export const getmenu = async (req,res) => {
    try {
        const fullmenu = await Menu.find();
        return res.status(200).json({
            success: true,
            message: "-------Full Menu-------",
            fullmenu
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Could not load menu",
            error: error.message
        });
    }
};

export const addAllModels = async (req, res) => {
    try {
        const models = [
            { name: 'Chicken Duck', price: 1000, URLmodel: 'ARModels/chicken_duck.glb' },
            { name: 'Large Iced Drink', price: 650, URLmodel: 'ARModels/a_large_iced_drink.glb' }
        ];
        const records = await Promise.all(models.map((model) => Menu.findOneAndUpdate(
            { URLmodel: model.URLmodel },
            { ...model, isAvailable: true },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        )));
        return res.status(200).json({ message: `${records.length} model samples ready`, records });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not add model samples',
            error: error.message
        });
    }
};

export const deleteMenu = async (req, res) => {
    try {
        const deleted = await Menu.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Menu item not found' });
        return res.status(200).json({ success: true, message: 'Menu item removed' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Could not remove menu item', error: error.message });
    }
};

export const deleteDuplicates = async (req, res) => {
    try {
        const items = await Menu.find().sort({ createdAt: 1, _id: 1 });
        const seen = new Set();
        const duplicateIds = [];
        items.forEach((item) => {
            if (seen.has(item.URLmodel)) duplicateIds.push(item._id);
            else seen.add(item.URLmodel);
        });
        if (duplicateIds.length) await Menu.deleteMany({ _id: { $in: duplicateIds } });
        return res.status(200).json({ success: true, message: `${duplicateIds.length} duplicate item(s) removed` });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Could not remove duplicates', error: error.message });
    }
};
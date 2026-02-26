import Inventory from "../models/inventory.js";
import StockTransaction from "../models/stockTransaction.js";
import Expense from "../models/expense.js"; // We integrate with your global ledger!

// ==========================================
// 1. GET CURRENT INVENTORY (The Pantry)
// ==========================================
export const getBranchInventory = async (req, res) => {
  try {
    const { branchId } = req.params;
    
    const inventory = await Inventory.find({ branch: branchId })
      .sort({ item_name: 1 }); // Alphabetical order

    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. GET TRANSACTION LEDGER (The History)
// ==========================================
export const getBranchTransactions = async (req, res) => {
  try {
    const { branchId } = req.params;
    
    const transactions = await StockTransaction.find({ branch: branchId })
      .populate("inventory_item", "item_name unit")
      .populate("performed_by", "full_name")
      .populate("reference_class", "class_number topic")
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. ADD PURCHASE (Stock IN & Financial Sync)
// ==========================================
export const addStockPurchase = async (req, res) => {
  try {
    const { branchId } = req.params;
    const { item_name, category, unit, quantity, total_cost, supplier, notes } = req.body;
    const userId = req.user._id; // Assuming auth middleware attaches req.user

    // 1. Find or Create the item using atomic $inc to prevent race conditions
    const inventoryItem = await Inventory.findOneAndUpdate(
      { 
        branch: branchId, 
        item_name: item_name.toLowerCase().trim() 
      },
      { 
        $inc: { quantity_in_stock: Number(quantity) }, // Atomically add to stock
        $setOnInsert: { category, unit } // Only set these if it's a brand new item
      },
      { new: true, upsert: true } // Upsert = Create if it doesn't exist
    );

    // 2. Log the transaction in the stock ledger
    await StockTransaction.create({
      inventory_item: inventoryItem._id,
      branch: branchId,
      transaction_type: "PURCHASE",
      quantity: Number(quantity),
      total_cost: Number(total_cost) || 0,
      supplier,
      notes,
      performed_by: userId
    });

    // 3. 💸 AUTO-SYNC TO FINANCIAL LEDGER
    // If the purchase cost money, it goes straight to the global Expense tracker
    if (Number(total_cost) > 0) {
      await Expense.create({
        title: `Inventory Restock: ${quantity} ${unit} ${item_name}`,
        amount: Number(total_cost),
        branch: branchId,
        recorded_by: userId
      });
    }

    res.status(201).json({ 
      success: true, 
      message: "Stock added and ledger updated successfully",
      data: inventoryItem 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. DEDUCT CLASS USAGE (Stock OUT)
// ==========================================
export const deductClassRequisition = async (req, res) => {
  try {
    const { branchId, classId } = req.params;
    const { items } = req.body; // Expects array: [{ name: "chicken", qty: 2, unit: "kg" }]
    const userId = req.user._id;

    const processedTransactions = [];

    // Loop through the requested items
    for (const item of items) {
      if (!item.name || !item.qty) continue;

      // Deduct from stock. We use $inc with a negative number to subtract.
      const inventoryItem = await Inventory.findOneAndUpdate(
        { 
          branch: branchId, 
          item_name: item.name.toLowerCase().trim() 
        },
        { 
          $inc: { quantity_in_stock: -Math.abs(Number(item.qty)) },
          $setOnInsert: { unit: item.unit, category: "Other" } 
        },
        { new: true, upsert: true } 
      );

      // Log the usage
      const transaction = await StockTransaction.create({
        inventory_item: inventoryItem._id,
        branch: branchId,
        transaction_type: "CLASS_USAGE",
        quantity: -Math.abs(Number(item.qty)), // Negative because it's leaving the pantry
        performed_by: userId,
        reference_class: classId
      });

      processedTransactions.push(transaction);
    }

    res.status(200).json({ 
      success: true, 
      message: "Requisition deducted from inventory",
      data: processedTransactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
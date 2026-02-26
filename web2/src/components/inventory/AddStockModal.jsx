import React from "react";
import EntityForm from "../common/EntityForm";
import { useAddStockPurchase } from "../../hooks/useInventory";

export default function AddStockModal({ isOpen, onClose, branchId }) {
  const addStockMutation = useAddStockPurchase(branchId);

  if (!isOpen) return null;

  const formConfig = [
    {
      name: "item_name",
      label: "Item Name (e.g., Chicken, Flour, Spatula)",
      type: "text",
      placeholder: "Enter item name",
      required: true,
      fullWidth: true
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: [
        { value: "Meat", label: "Meat & Poultry" },
        { value: "Dairy", label: "Dairy & Eggs" },
        { value: "Produce", label: "Fresh Produce" },
        { value: "Dry Goods", label: "Dry Goods & Spices" },
        { value: "Equipment", label: "Kitchen Equipment" },
        { value: "Packaging", label: "Packaging" },
        { value: "Other", label: "Other" }
      ],
      defaultOption: "Select a category",
      required: true
    },
    {
      name: "unit",
      label: "Measurement Unit",
      type: "select",
      options: [
        { value: "kg", label: "Kilograms (kg)" },
        { value: "g", label: "Grams (g)" },
        { value: "L", label: "Liters (L)" },
        { value: "ml", label: "Milliliters (ml)" },
        { value: "pcs", label: "Pieces (pcs)" },
        { value: "pkt", label: "Packets (pkt)" },
        { value: "box", label: "Boxes (box)" },
        { value: "dozen", label: "Dozen" }
      ],
      defaultOption: "Select unit",
      required: true
    },
    { divider: true, title: "Purchase Details" },
    {
      name: "quantity",
      label: "Quantity Purchased",
      type: "number",
      placeholder: "e.g., 5",
      required: true,
      props: { min: "0", step: "any" }
    },
    {
      name: "total_cost",
      label: "Total Cost (৳) - Updates Global Ledger",
      type: "number",
      placeholder: "0.00",
      required: true,
      props: { min: "0", step: "any" }
    },
    {
      name: "supplier",
      label: "Supplier / Shop Name",
      type: "text",
      placeholder: "Where did you buy this?",
      fullWidth: true
    },
    {
      name: "notes",
      label: "Additional Notes",
      type: "textarea",
      placeholder: "Any special details about this purchase?",
      fullWidth: true
    }
  ];

  const handleSubmit = async (formDataObj, rawFormData) => {
    try {
      // Pass the raw data straight to the mutation
      await addStockMutation.mutateAsync(rawFormData);
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Failed to add stock", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-2xl my-auto animate-in zoom-in-95 duration-200">
        <EntityForm
          title="Log Stock Purchase"
          subtitle="Add new inventory and update the financial ledger."
          config={formConfig}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={addStockMutation.isPending}
          buttonText="Confirm Purchase & Update Ledger"
          buttonColor="bg-teal-600 hover:bg-teal-700 shadow-teal-500/20"
        />
      </div>
    </div>
  );
}
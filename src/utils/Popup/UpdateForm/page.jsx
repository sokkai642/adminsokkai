"use client";

import { useState, useEffect } from "react";
import { FaUpload, FaTimes } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const UpdateProductForm = ({ product, value, onClose }) => {
  console.log("consoling the product : ", product);
  const [formData, setFormData] = useState({
    name: product.name || "",
    originalprice: product.originalprice || "",
    description: product.description || "",
    price: product.price || "",
    category: product.category || "",
    stock: product.stock || "",
    brand: product.brand || "",
    sizes: product.sizes || [],
    images: product.images || [],
    newImages: [],
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    console.log("Selected files:", files);

    if (files.length > 0) {
      setFormData((prev) => {
        const updatedImages = [...(prev.newImages || []), ...files];
        console.log("Updated images:", updatedImages);
        return { ...prev, newImages: updatedImages };
      });
    }
  };
  const handleRemoveImage = (index, type) => {
    if (type === "existing") {
      const updatedImages = formData.images.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, images: updatedImages }));
    } else if (type === "new") {
      const updatedNewImages = formData.newImages.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, newImages: updatedNewImages }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = `/api/products?id=${product._id}`;
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("originalprice", formData.originalprice);
      data.append("category", formData.category);
      data.append("stock", formData.stock);
      data.append("brand", formData.brand);
      data.append("sizes", JSON.stringify(formData.sizes));
      if (formData.images && formData.images.length > 0) {
        const existingImagePublicIds = formData.images.map(
          (img) => img.public_id
        );
        data.append("sentImages", JSON.stringify(existingImagePublicIds));
      } else {
        data.append("sentImages", JSON.stringify([]));
      }
      if (formData.newImages && formData.newImages.length > 0) {
        formData.newImages.forEach((file) => {
          data.append("images", file);
        });
      }

      console.log("FormData being sent:", Array.from(data.entries()));

      const config = {
        headers: { "Content-Type": "multipart/form-data" },
      };

      const response = await axios.put(endpoint, data, config);

      if (response.status === 200) {
        toast.success("Product updated successfully!");
        setTimeout(() => {
          onClose(); // Close the modal or perform post-submit actions
        }, 1200);
      } else {
        throw new Error("Failed to update product.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  // Handles cancel/reset functionality
  const handleCancel = () => {
    setFormData({
      ...product,
      newImages: [],
    });
  };

  // Close modal on value change
  useEffect(() => {
    if (value) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [value]);

  return (
    value && (
      <div className="bg-gray-600 bg-opacity-50 fixed inset-0 flex justify-center items-center z-50">
        <ToastContainer />
        <div className="bg-white shadow-lg rounded-lg w-full max-w-3xl p-8 h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Update Product
            </h2>
            <button onClick={onClose} className="text-black">
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-black font-medium mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-black font-medium mb-2">
                Product actual price
              </label>
              <input
                type="text"
                name="name"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-black font-medium mb-2">
                originalprice
              </label>
              <input
                type="text"
                name="name"
                value={formData.originalprice}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-black font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows="3"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["S", "M", "L", "XL"].map((size) => (
                <div key={size} className="flex items-center">
                  <input
                    type="checkbox"
                    id={size}
                    name="sizes"
                    value={size}
                    checked={formData.sizes[0].includes(size)}
                    onChange={(e) => {
                      const { value } = e.target;
                      const sizes = formData.sizes;
                      if (sizes.includes(value)) {
                        setFormData({
                          ...formData,
                          sizes: sizes.filter((item) => item !== value),
                        });
                      } else {
                        setFormData({
                          ...formData,
                          sizes: [...sizes, value],
                        });
                      }
                    }}
                    className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-400"
                  />
                  <label htmlFor={size} className="ml-2 text-gray-800">
                    {size}
                  </label>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-red-600 font-bold mb-2">
                Color Available
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "White",
                  "Black",
                  "Blue",
                  "Gray",
                  "Red",
                  "Green",
                  "Pink",
                  "Yellow",
                  "Brown",
                  "Purple",
                  "Orange",
                  "Burgundy",
                  "Teal",
                  "nocolor",
                ].map((size) => (
                  <div key={size} className="flex items-center">
                    <input
                      type="checkbox"
                      id={size}
                      name="sizes"
                      value={size}
                      checked={formData.sizes?.includes(size)}
                      onChange={(e) => {
                        const { value } = e.target;
                        const sizes = formData.sizes || [];
                        if (sizes.includes(value)) {
                          setFormData({
                            ...formData,
                            sizes: sizes.filter((item) => item !== value),
                          });
                        } else {
                          setFormData({
                            ...formData,
                            sizes: [...sizes, value],
                          });
                        }
                      }}
                      className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-indigo-400"
                    />
                    <label htmlFor={size} className="ml-2 text-gray-800">
                      {size}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-black font-medium mb-2">
                category
              </label>
              <textarea
                name="description"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                rows="3"
                required
              />
            </div>

            {/* Existing Images */}
            <div>
              <label className="block text-black font-medium mb-2">
                Existing Images
              </label>
              <div className="flex flex-wrap gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt="Product"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, "existing")}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* New Images */}
            <div>
              <label className="block text-black font-medium mb-2">
                Add New Images
              </label>
              <input
                type="file"
                name="images"
                onChange={handleFileChange}
                className="hidden"
                id="upload"
                multiple
                accept="image/*"
              />
              <label
                htmlFor="upload"
                className="flex items-center justify-center px-4 py-2 bg-indigo-500 text-white rounded-lg cursor-pointer hover:bg-indigo-600"
              >
                <FaUpload className="mr-2" />
                Upload Images
              </label>
              <div className="mt-4 space-y-2">
                {formData.newImages.map((file, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center px-4 py-2 bg-gray-100 rounded-lg"
                  >
                    <span>{file?.name || "Unnamed File"}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, "new")}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
              ;
            </div>

            {/* Submit and Cancel */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default UpdateProductForm;

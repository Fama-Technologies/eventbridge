"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export default function PortfolioMedia() {
    const [images, setImages] = useState([
        { id: 1, url: "https://images.unsplash.com/photo-1546241072-48010ad2862c?auto=format&fit=crop&q=80&w=400", caption: "Appetizer Platter" },
        { id: 2, url: "https://images.unsplash.com/photo-1519225468765-a6a2800a6f85?auto=format&fit=crop&q=80&w=400", caption: "" },
        { id: 3, url: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=400", caption: "" }
    ]);

    const handleCaptionChange = (id: number, val: string) => {
        setImages(images.map(img => img.id === id ? { ...img, caption: val } : img));
    };

    return (
        <div className="bg-shades-white p-6 md:p-8 rounded-2xl border border-neutrals-02">
            <h2 className="text-xl font-bold text-shades-black mb-2">Portfolio Media</h2>
            <p className="text-sm text-neutrals-06 mb-8">High-quality images increase booking rates by 40%.</p>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-neutrals-03 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-01 hover:bg-primary-01/05 transition-all mb-10 group">
                <Upload className="w-10 h-10 text-neutrals-04 group-hover:text-primary-01 mb-4 transition-colors" />
                <h3 className="text-shades-black font-medium mb-1">Drag and drop photos or videos here</h3>
                <p className="text-xs text-neutrals-06">Up to 10MB each (JPG, PNG, MP4)</p>
            </div>

            {/* Image Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                {images.map((image) => (
                    <div key={image.id} className="group">
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 border border-neutrals-02">
                            <img src={image.url} alt="Portfolio" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <button className="absolute top-2 right-2 p-1.5 bg-shades-black/50 text-shades-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-errors-main">
                                <X size={14} />
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Add caption..."
                            value={image.caption}
                            onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-neutrals-03 text-sm text-shades-black focus:border-primary-01 focus:outline-none transition-colors"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

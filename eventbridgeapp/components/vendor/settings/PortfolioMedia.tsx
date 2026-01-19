"use client";

import { useState, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Camera, Trash2 } from "lucide-react";

interface PortfolioItem {
    id: number;
    imageUrl: string;
    title: string | null;
    description: string | null;
    category: string | null;
}

interface PortfolioMediaProps {
    vendorId?: number;
}

export default function PortfolioMedia({ vendorId }: PortfolioMediaProps = {}) {
    const [images, setImages] = useState<PortfolioItem[]>([]);

    // DB DATA STRUCTURE DOCUMENTATION
    // ----------------------------------------
    // PUSH (Saving to DB):
    // When uploading/saving a new portfolio item, the following structure is sent to the API:
    // {
    //   imageUrl: string;      // URL returned from upload service (e.g., S3/Cloudinary)
    //   title?: string;        // Optional caption/title
    //   description?: string;  // Optional description
    //   category?: string;     // Optional category (e.g., 'Food', 'Venue')
    //   vendorId: number;      // ID of the vendor owning this item
    // }
    //
    // PULL (Fetching from DB):
    // When fetching (GET /api/vendor/portfolio), the DB should return an array of objects matching:
    // interface PortfolioItem {
    //   id: number;            // Unique Primary Key
    //   imageUrl: string;      // Hosted Image URL
    //   title: string | null;  // Caption
    //   description: string | null;
    //   category: string | null;
    // }
    // ----------------------------------------
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        fetchPortfolioItems();
    }, [vendorId]);

    const fetchPortfolioItems = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/vendor/portfolio${vendorId ? `?vendorId=${vendorId}` : ''}`);
            const data = await response.json();

            if (data.success) {
                setImages(data.portfolio || []);
            }
        } catch (error) {
            console.error('Failed to fetch portfolio:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCaptionChange = (id: number, val: string) => {
        setImages(images.map(img => img.id === id ? { ...img, title: val } : img));

        // Optional: Save caption to API
        saveCaption(id, val);
    };

    const saveCaption = async (itemId: number, caption: string) => {
        try {
            await fetch(`/api/vendor/portfolio/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: caption }),
            });
        } catch (error) {
            console.error('Failed to save caption:', error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'gallery');

        if (vendorId) {
            formData.append('vendorId', vendorId.toString());
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            // Simulate upload progress (in real app, use XMLHttpRequest or fetch with progress)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.ok && data.url) {
                const portfolioResponse = await fetch('/api/vendor/portfolio', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        imageUrl: data.url,
                        pathname: data.pathname,  // From Vercel Blob response
                        size: data.size,          // From Vercel Blob response  
                        type: data.type,          // From Vercel Blob response
                    }),
                });

                const portfolioData = await portfolioResponse.json();

                if (portfolioData.success && portfolioData.portfolioItem) {
                    const newItem: PortfolioItem = portfolioData.portfolioItem;
                    setImages([...images, newItem]);

                    // Show success message
                    setTimeout(() => {
                        setIsUploading(false);
                        setUploadProgress(0);
                    }, 500);
                } else {
                    console.error('Failed to save portfolio item:', portfolioData.error);
                    setIsUploading(false);
                    setUploadProgress(0);
                }
            } else {
                console.error('Upload failed:', data.error || 'Unknown error');
                setIsUploading(false);
                setUploadProgress(0);
            }
        } catch (error) {
            console.error('Failed to upload image:', error);
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDeleteImage = async (itemId: number) => {
        try {
            const response = await fetch(`/api/vendor/portfolio/${itemId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setImages(images.filter(img => img.id !== itemId));
            }
        } catch (error) {
            console.error('Failed to delete image:', error);
        }
    };

    const triggerFileInput = () => {
        document.getElementById('portfolio-upload')?.click();
    };

    if (isLoading) {
        return (
            <div className="bg-shades-white p-6 md:p-8 rounded-2xl border border-neutrals-02">
                <div className="animate-pulse">
                    <div className="h-8 bg-neutrals-03 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-neutrals-03 rounded w-64 mb-8"></div>

                    {/* Upload Zone Skeleton */}
                    <div className="border-2 border-dashed border-neutrals-03 rounded-2xl p-10 mb-10">
                        <div className="h-10 w-10 bg-neutrals-03 rounded-full mx-auto mb-4"></div>
                        <div className="h-4 bg-neutrals-03 rounded w-48 mx-auto mb-1"></div>
                        <div className="h-3 bg-neutrals-03 rounded w-64 mx-auto"></div>
                    </div>

                    {/* Image Grid Skeleton */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i}>
                                <div className="aspect-[4/3] bg-neutrals-03 rounded-xl mb-3"></div>
                                <div className="h-10 bg-neutrals-03 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-shades-white p-6 md:p-8 rounded-2xl border border-neutrals-02">
            <h2 className="text-xl font-bold text-shades-black mb-2">Portfolio Media</h2>
            <p className="text-sm text-neutrals-06 mb-8">
                High-quality images increase booking rates by 40%. {images.length} image{images.length !== 1 ? 's' : ''} uploaded
            </p>

            {/* Upload Zone */}
            <label
                onClick={!isUploading ? triggerFileInput : undefined}
                className={`border-2 border-dashed ${isUploading ? 'border-primary-01/50' : 'border-neutrals-03 hover:border-primary-01'
                    } rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer ${!isUploading && 'hover:bg-primary-01/05'
                    } transition-all mb-10 group relative overflow-hidden`}
            >
                {isUploading ? (
                    <>
                        <div className="relative w-full">
                            <div className="w-full h-1 bg-neutrals-02 rounded-full overflow-hidden mb-4">
                                <div
                                    className="h-full bg-primary-01 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-neutrals-07">
                                Uploading... {uploadProgress}%
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <Upload className="w-10 h-10 text-neutrals-04 group-hover:text-primary-01 mb-4 transition-colors" />
                        <h3 className="text-shades-black font-medium mb-1">Drag and drop photos or videos here</h3>
                        <p className="text-xs text-neutrals-06">Up to 10MB each (JPG, PNG, MP4)</p>
                        <p className="text-xs text-primary-01 mt-2 font-medium">Click to browse files</p>
                    </>
                )}
                <input
                    type="file"
                    id="portfolio-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    multiple
                />
            </label>

            {/* Upload Progress Bar (outside label for better control) */}
            {isUploading && uploadProgress < 100 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-shades-black">Uploading...</span>
                        <span className="text-sm font-medium text-primary-01">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutrals-02 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-01 to-primary-02 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Image Grid */}
            {images.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                    {images.map((image) => (
                        <div key={image.id} className="group">
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 border border-neutrals-02">
                                <img
                                    src={image.imageUrl}
                                    alt={image.title || "Portfolio"}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                />
                                <button
                                    onClick={() => handleDeleteImage(image.id)}
                                    className="absolute top-2 right-2 p-1.5 bg-shades-black/50 text-shades-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-errors-main hover:scale-110"
                                >
                                    <X size={14} />
                                </button>
                                {image.category && (
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-shades-black/70 text-shades-white text-xs rounded-md">
                                        {image.category}
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="Add caption..."
                                value={image.title || ""}
                                onChange={(e) => handleCaptionChange(image.id, e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-neutrals-03 text-sm text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none transition-colors"
                            />
                        </div>
                    ))}

                    {/* Add More Button */}
                    <label className="aspect-[4/3] rounded-xl border-2 border-dashed border-neutrals-03 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-01 hover:bg-primary-01/05 transition-all group">
                        <Camera className="w-8 h-8 text-neutrals-04 group-hover:text-primary-01 mb-3 transition-colors" />
                        <p className="text-sm text-neutrals-06 group-hover:text-primary-01">Add More</p>
                        <p className="text-xs text-neutrals-05 mt-1">Click to upload</p>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </label>
                </div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-neutrals-03 rounded-2xl">
                    <ImageIcon className="w-12 h-12 text-neutrals-04 mx-auto mb-3" />
                    <p className="text-neutrals-06">No portfolio items yet</p>
                    <p className="text-sm text-neutrals-05 mt-1 mb-4">Upload images to showcase your work</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary-01 text-shades-white rounded-lg hover:bg-primary-02 transition-colors cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Upload First Image
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </label>
                </div>
            )}

            {/* Image Tips */}
            <div className="mt-8 pt-6 border-t border-neutrals-02">
                <div className="flex items-center gap-2 mb-3">
                    <Camera className="w-4 h-4 text-primary-01" />
                    <h3 className="text-sm font-semibold text-shades-black">Tips for great portfolio images:</h3>
                </div>
                <ul className="text-sm text-neutrals-06 space-y-1">
                    <li className="flex items-start gap-2">
                        <span className="text-primary-01 font-bold">•</span>
                        <span>Use high-quality, well-lit photos (at least 1200x800 pixels)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary-01 font-bold">•</span>
                        <span>Show a variety of your best work from different angles</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary-01 font-bold">•</span>
                        <span>Add descriptive captions to help clients understand your work</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary-01 font-bold">•</span>
                        <span>Keep file sizes under 10MB for faster loading</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
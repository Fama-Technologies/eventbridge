"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Twitter, Instagram, Trash2, Camera, Minus, Save, Edit, X, Globe, Check } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface VendorProfile {
    id: number;
    businessName: string | null;
    description: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    yearsExperience: number | null;
    isVerified: boolean;
    rating: number;
    reviewCount: number;
    profileImage: string | null;
    verificationStatus: string;
}

interface Service {
    id: number;
    name: string;
    description: string | null;
    price: number | null;
    isActive: boolean;
}

interface ProfileBasicsProps {
    vendorProfile?: VendorProfile;
    services?: Service[];
    onProfileUpdate?: (updatedProfile: VendorProfile) => void;
    onServicesUpdate?: (updatedServices: Service[]) => void;
}

export default function ProfileBasics({
    vendorProfile: initialVendorProfile,
    services: initialServices,
    onProfileUpdate,
    onServicesUpdate
}: ProfileBasicsProps = {}) {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(!initialVendorProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Local state with fallbacks
    const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(initialVendorProfile || null);
    const [services, setServices] = useState<Service[]>(initialServices || []);

    // Form State
    const [formData, setFormData] = useState({
        businessName: "",
        description: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        website: "",
        yearsExperience: 0
    });

    const [newService, setNewService] = useState("");
    const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
    const [socialLinks, setSocialLinks] = useState({
        twitter: "",
        instagram: "",
        facebook: ""
    });

    // Fetch data if not provided via props
    useEffect(() => {
        if (!initialVendorProfile) {
            fetchVendorProfile();
        }
    }, [initialVendorProfile]);

    const fetchVendorProfile = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/vendor/profile');
            //this is what is returned from the api
            {/*
                
            {
  "success": true,
  "profile": {
    "id": 1,
    "businessName": "...",
    "description": "...",
    "phone": "...",
    "website": "...",
    "address": "...",
    "city": "...",
    "state": "...",
    "zipCode": "...",
    "yearsExperience": 5,
    "isVerified": false,
    "rating": 4.6,
    "reviewCount": 32,
    "profileImage": "...",
    "verificationStatus": "pending"
  },
  "services": [
    { "id": 1, "name": "Catering", "description": null, "price": null, "isActive": true }
  ]
}



            
*/}

//this wat is the body to send to the api when creating or updating a profile
    {/*
        {
  "businessName": "...",
  "description": "...",
  "phone": "...",
  "address": "...",
  "city": "...",
  "state": "...",
  "zipCode": "...",
  "website": "...",
  "yearsExperience": 3,
  "socialLinks": {
    "twitter": "...",
    "instagram": "..."
  }
}

        */}
            const data = await response.json();

            if (data.success) {
                if (data.profile) {
                    setVendorProfile(data.profile);
                    setServices(data.services || []);

                    // Initialize form data
                    setFormData({
                        businessName: data.profile.businessName || "",
                        description: data.profile.description || "",
                        phone: data.profile.phone || "",
                        address: data.profile.address || "",
                        city: data.profile.city || "",
                        state: data.profile.state || "",
                        zipCode: data.profile.zipCode || "",
                        website: data.profile.website || "",
                        yearsExperience: data.profile.yearsExperience || 0
                    });
                } else {
                    // No profile exists yet
                    setVendorProfile(null);
                    // Reset form data to empty
                    setFormData({
                        businessName: "",
                        description: "",
                        phone: "",
                        address: "",
                        city: "",
                        state: "",
                        zipCode: "",
                        website: "",
                        yearsExperience: 0
                    });
                }
            } else {
                addToast(data.message || "Failed to load profile data", "error");
            }
        } catch (error) {
            console.error('Failed to fetch vendor profile:', error);
            addToast("Failed to load profile data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            const response = await fetch('/api/vendor/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    businessName: formData.businessName,
                    description: formData.description,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    website: formData.website,
                    yearsExperience: formData.yearsExperience,
                    socialLinks
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Create updated profile object
                const updatedProfile: VendorProfile = data.profile;

                // Update local state
                setVendorProfile(updatedProfile);

                // Notify parent component if callback provided
                if (onProfileUpdate) {
                    onProfileUpdate(updatedProfile);
                }

                setIsEditing(false);
                addToast(data.message || "Profile updated successfully", "success");
            } else {
                addToast(data.message || "Failed to update profile", "error");
            }
        } catch (error) {
            console.error('Failed to save profile:', error);
            addToast("Failed to save changes", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddService = async (serviceName?: string) => {
        const nameToAdd = serviceName || newService;
        if (!nameToAdd.trim()) return;

        try {
            const response = await fetch('/api/vendor/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: nameToAdd,
                    description: "",
                    price: null,
                }),
            });

            const data = await response.json();

            if (data.success) {
                const updatedServices = [...services, data.service];
                setServices(updatedServices);
                setNewService("");

                // Notify parent component if callback provided
                if (onServicesUpdate) {
                    onServicesUpdate(updatedServices);
                }

                addToast("Service added successfully", "success");
            }
        } catch (error) {
            addToast("Failed to add service", "error");
        }
    };

    const handleRemoveService = async (serviceId: number) => {
        try {
            const response = await fetch(`/api/vendor/services/${serviceId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                const updatedServices = services.filter(s => s.id !== serviceId);
                setServices(updatedServices);

                // Notify parent component if callback provided
                if (onServicesUpdate) {
                    onServicesUpdate(updatedServices);
                }

                addToast("Service removed successfully", "success");
            }
        } catch (error) {
            addToast("Failed to remove service", "error");
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;

        const file = e.target.files[0];

        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            addToast("File size must be less than 10MB", "error");
            return;
        }

        // Check file type - match your API's allowed types
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(file.type)) {
            addToast("Please select a valid image file (JPEG, PNG, or WebP)", "error");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('file', file);
        formDataToSend.append('type', 'profile'); // Use 'profile' type for profile images

        try {
            setIsUploading(true);
            addToast("Uploading photo...", "info");

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            if (data.url) {
                // First, update the local state immediately
                const updatedProfile = {
                    ...vendorProfile!,
                    profileImage: data.url
                };

                setVendorProfile(updatedProfile);

                // Then update the profile in the database with the new image URL
                try {
                    const profileResponse = await fetch('/api/vendor/profile', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            profileImage: data.url,
                            // Include all existing data to prevent overwriting
                            businessName: vendorProfile?.businessName || "",
                            description: vendorProfile?.description || "",
                            phone: vendorProfile?.phone || "",
                            address: vendorProfile?.address || "",
                            city: vendorProfile?.city || "",
                            state: vendorProfile?.state || "",
                            zipCode: vendorProfile?.zipCode || "",
                            website: vendorProfile?.website || "",
                            yearsExperience: vendorProfile?.yearsExperience || 0
                        }),
                    });

                    const profileData = await profileResponse.json();

                    if (profileData.success) {
                        addToast("Profile photo updated successfully", "success");

                        // Notify parent component if callback provided
                        if (onProfileUpdate) {
                            onProfileUpdate(updatedProfile);
                        }
                    } else {
                        console.warn('Photo uploaded but profile update failed:', profileData);
                        addToast("Photo uploaded but failed to update profile", "warning");
                    }
                } catch (profileError) {
                    console.error('Failed to update profile with image:', profileError);
                    addToast("Photo uploaded but profile update failed", "warning");
                }
            } else {
                addToast("Failed to upload photo: No URL returned", "error");
            }
        } catch (error) {
            console.error('Failed to upload photo:', error);
            addToast(error instanceof Error ? error.message : "Failed to upload photo", "error");
        } finally {
            setIsUploading(false);
            // Clear the input so the same file can be selected again
            e.target.value = '';
        }
    };

    // Update form data when vendorProfile changes
    useEffect(() => {
        if (vendorProfile) {
            setFormData({
                businessName: vendorProfile.businessName || "",
                description: vendorProfile.description || "",
                phone: vendorProfile.phone || "",
                address: vendorProfile.address || "",
                city: vendorProfile.city || "",
                state: vendorProfile.state || "",
                zipCode: vendorProfile.zipCode || "",
                website: vendorProfile.website || "",
                yearsExperience: vendorProfile.yearsExperience || 0
            });
        }
    }, [vendorProfile]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-48"></div>
                    <div className="flex gap-8">
                        <div className="w-48 h-48 rounded-full bg-gray-200"></div>
                        <div className="flex-1 space-y-4">
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-32 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!vendorProfile) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <p className="text-gray-600">No profile found. Click Edit Profile to create one.</p>
                <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                    <Edit size={18} /> Create Profile
                </button>
            </div>
        );
    }

    const displayLocation = vendorProfile?.city && vendorProfile?.state
        ? `${vendorProfile.city}, ${vendorProfile.state}`
        : vendorProfile?.address || "Location not set";

    return (
        <div className="animate-fade-in relative">
            <div className="mb-8">
                <h2 className="text-xl font-bold text-shades-black">Profile Basics</h2>
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
                {/* Left Column - Profile Image */}
                <div className="lg:col-span-3 flex flex-col items-center">
                    <div className="relative group mb-4">
                        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg bg-neutrals-02">
                            <img
                                src={vendorProfile?.profileImage || "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80"}
                                alt={vendorProfile?.businessName || "Business"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <label className="mt-3 cursor-pointer text-sm text-neutrals-05 underline hover:text-shades-black transition-colors">
                            Change Photo
                            <input
                                type="file"
                                className="hidden"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handlePhotoUpload}
                                disabled={isUploading}
                            />
                        </label>
                    )}
                </div>

                {/* Right Column - Form */}
                <div className="lg:col-span-9 space-y-8">
                    {/* Main Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-shades-black">Business Name</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border border-neutrals-03 text-shades-black placeholder:text-neutrals-05 focus:border-primary-01 focus:ring-1 focus:ring-primary-01 outline-none transition-all"
                                    placeholder="e.g. Catering by EventBridge"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-neutrals-01 rounded-lg border border-transparent text-shades-black font-medium">
                                    {vendorProfile?.businessName || "Not set"}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-shades-black">Location</label>
                            {isEditing ? (
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutrals-06" size={18} />
                                    <input
                                        type="text"
                                        value={formData.city} // Simplified to City for 'Location' field match
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })} // Updating city as primary location
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutrals-03 text-shades-black placeholder:text-neutrals-05 focus:border-primary-01 focus:ring-1 focus:ring-primary-01 outline-none transition-all"
                                        placeholder="New York, NY"
                                    />
                                </div>
                            ) : (
                                <div className="px-4 py-3 bg-neutrals-01 rounded-lg border border-transparent text-shades-black font-medium flex items-center gap-2">
                                    <MapPin size={16} className="text-neutrals-06" />
                                    {displayLocation}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Service Categories */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-shades-black">
                            Service Categories
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {/* Predefined Categories */}
                            {["DJ & Music", "Photographer", "Catering", "Florist", "Event Planner", "Videographer", "Venue", "Decor"]
                                .filter(category => isEditing || services.some(s => s.name === category))
                                .map((category) => {
                                    const isActive = services.some(s => s.name === category);
                                    const serviceId = services.find(s => s.name === category)?.id;

                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            disabled={!isEditing}
                                            onClick={() => {
                                                if (isActive && serviceId) {
                                                    handleRemoveService(serviceId);
                                                } else {
                                                    handleAddService(category);
                                                }
                                            }}
                                            className={`
                                            px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                                            ${isActive
                                                    ? 'bg-primary-01 text-white hover:bg-primary-02 shadow-sm'
                                                    : isEditing
                                                        ? 'bg-neutrals-02 text-shades-black hover:bg-neutrals-03 border border-transparent'
                                                        : 'bg-neutrals-01 text-neutrals-06 cursor-default'
                                                }
                                        `}
                                        >
                                            {isActive && <Check size={14} strokeWidth={3} />}
                                            {category}
                                        </button>
                                    );
                                })}

                            {/* Custom Services (Not in predefined list) */}
                            {services
                                .filter(s => !["DJ & Music", "Photographer", "Catering", "Florist", "Event Planner", "Videographer", "Venue", "Decor"].includes(s.name))
                                .map((service) => (
                                    <div key={service.id} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-01 text-white text-sm font-medium shadow-sm">
                                        <Check size={14} strokeWidth={3} />
                                        {service.name}
                                        {isEditing && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveService(service.id);
                                                }}
                                                className="hover:text-white/80 ml-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))
                            }

                            {/* Add Custom Button */}
                            {isEditing && (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                                        className="px-4 py-2 rounded-full border border-dashed border-neutrals-04 text-neutrals-06 hover:text-shades-black hover:border-neutrals-06 hover:bg-neutrals-01 transition-all text-sm font-medium flex items-center gap-2 bg-white"
                                    >
                                        <Plus size={16} /> Add Custom
                                    </button>

                                    {/* Inline Input Popover */}
                                    {isServiceDropdownOpen && (
                                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-neutrals-02 z-50 p-3 animation-fade-in">
                                            <label className="text-xs font-bold text-neutrals-06 mb-1 block">Custom Service Name</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={newService}
                                                    onChange={(e) => setNewService(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleAddService(newService);
                                                            setNewService(""); // Clear input
                                                            setIsServiceDropdownOpen(false); // Close popover
                                                        }
                                                    }}
                                                    placeholder="e.g. Master of Ceremonies"
                                                    className="flex-1 px-3 py-2 text-sm rounded-md border border-neutrals-03 focus:border-primary-01 outline-none"
                                                />
                                                <button
                                                    onClick={() => {
                                                        handleAddService(newService);
                                                        setNewService("");
                                                        setIsServiceDropdownOpen(false);
                                                    }}
                                                    className="p-2 bg-primary-01 text-white rounded-md hover:bg-primary-02"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlay */}
                                    {isServiceDropdownOpen && (
                                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsServiceDropdownOpen(false)} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Years in Business */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-shades-black">Years in Business</label>
                        {isEditing ? (
                            <div className="flex items-center border border-neutrals-03 rounded-lg overflow-hidden w-fit">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, yearsExperience: Math.max(0, formData.yearsExperience - 1) })}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-neutrals-01 transition-colors text-neutrals-06 border-r border-neutrals-03"
                                >
                                    <Minus size={16} />
                                </button>
                                <div className="w-12 h-10 flex items-center justify-center font-bold text-shades-black bg-white">
                                    {formData.yearsExperience}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, yearsExperience: formData.yearsExperience + 1 })}
                                    className="w-10 h-10 flex items-center justify-center hover:bg-neutrals-01 transition-colors text-neutrals-06 border-l border-neutrals-03"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="font-medium text-shades-black">
                                {vendorProfile?.yearsExperience || 0} years
                            </div>
                        )}
                    </div>

                    {/* Bio / Description */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-shades-black">Bio / Description</label>
                            {isEditing && (
                                <span className="text-xs text-neutrals-06 font-medium">
                                    {formData.description.length}/500
                                </span>
                            )}
                        </div>
                        {isEditing ? (
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-3 rounded-lg border border-neutrals-03 text-shades-black placeholder:text-neutrals-05 focus:border-primary-01 focus:ring-1 focus:ring-primary-01 outline-none resize-none"
                                placeholder="We are a premier service..."
                                maxLength={500}
                            />
                        ) : (
                            <div className="p-4 bg-neutrals-01 rounded-lg border border-transparent text-neutrals-07 text-sm leading-relaxed">
                                {vendorProfile?.description || "No description provided."}
                            </div>
                        )}
                    </div>

                    {/* Social Media Links */}
                    <div className="space-y-4 pt-4 border-t border-dashed border-neutrals-03">
                        <h3 className="text-sm font-bold text-shades-black">Social Media Links</h3>

                        {/* Twitter/X */}
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <div className="relative flex-1">
                                    <Twitter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-shades-black" size={18} />
                                    <input
                                        type="url"
                                        value={socialLinks.twitter}
                                        onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                                        className="w-full pl-10 pr-10 py-3 rounded-lg border border-neutrals-03 text-shades-black placeholder:text-neutrals-05 focus:border-primary-01 focus:ring-1 focus:ring-primary-01 outline-none transition-all"
                                        placeholder="twitter.com/eventbridgecaters"
                                    />
                                    {socialLinks.twitter && (
                                        <button
                                            onClick={() => setSocialLinks({ ...socialLinks, twitter: '' })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutrals-05 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ) : socialLinks.twitter && (
                                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-shades-black hover:text-primary-01 font-medium transition-colors">
                                    <Twitter size={18} />
                                    <span>Twitter</span>
                                </a>
                            )}
                        </div>

                        {/* Instagram */}
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <div className="relative flex-1">
                                    <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 text-shades-black" size={18} />
                                    <input
                                        type="url"
                                        value={socialLinks.instagram}
                                        onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                                        className="w-full pl-10 pr-10 py-3 rounded-lg border border-neutrals-03 text-shades-black placeholder:text-neutrals-05 focus:border-primary-01 focus:ring-1 focus:ring-primary-01 outline-none transition-all"
                                        placeholder="Add Instagram Link"
                                    />
                                    {socialLinks.instagram && (
                                        <button
                                            onClick={() => setSocialLinks({ ...socialLinks, instagram: '' })}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutrals-05 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ) : socialLinks.instagram && (
                                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-shades-black hover:text-primary-01 font-medium transition-colors">
                                    <Instagram size={18} />
                                    <span>Instagram</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar (Only when editing) */}
            {isEditing ? (
                <div className="mt-8 pt-6 border-t border-neutrals-03 flex justify-end gap-3">
                    <button
                        onClick={() => {
                            setIsEditing(false);
                            // Reset changes
                            if (vendorProfile) {
                                setFormData({
                                    businessName: vendorProfile.businessName || "",
                                    description: vendorProfile.description || "",
                                    phone: vendorProfile.phone || "",
                                    address: vendorProfile.address || "",
                                    city: vendorProfile.city || "",
                                    state: vendorProfile.state || "",
                                    zipCode: vendorProfile.zipCode || "",
                                    website: vendorProfile.website || "",
                                    yearsExperience: vendorProfile.yearsExperience || 0
                                });
                            }
                        }}
                        className="px-6 py-2.5 rounded-lg border border-neutrals-04 text-shades-black font-bold hover:bg-neutrals-01 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-lg bg-primary-01 text-white font-bold hover:bg-primary-02 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            ) : (
                <div className="absolute top-0 right-0">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-primary-01 font-bold text-sm hover:underline"
                    >
                        Edit details
                    </button>
                </div>
            )}
        </div>
    );
}
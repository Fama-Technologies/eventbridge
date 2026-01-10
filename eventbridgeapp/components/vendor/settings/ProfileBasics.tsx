"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Twitter, Instagram, Trash2, Camera, Minus, Save, Edit, X, Globe } from "lucide-react";
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

    const handleAddService = async () => {
        if (!newService.trim()) return;
        
        try {
            const response = await fetch('/api/vendor/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newService,
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
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Business Profile</h2>
                    <p className="text-gray-600 mt-2">Manage your business information and services</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                                <X size={18} /> Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Save size={18} />
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors flex items-center gap-2"
                        >
                            <Edit size={18} /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column - Profile Image & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Image */}
                    <div className="relative group">
                        <div className="w-full aspect-square max-w-64 mx-auto rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                            <img
                                src={vendorProfile?.profileImage || "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80"}
                                alt={vendorProfile?.businessName || "Business"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {isEditing && (
                            <label className="absolute bottom-4 right-4 cursor-pointer">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handlePhotoUpload}
                                    disabled={isUploading}
                                />
                                <div className={`p-3 rounded-full shadow-lg transition-colors flex items-center justify-center ${
                                    isUploading 
                                        ? "bg-gray-400 cursor-not-allowed" 
                                        : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                }`}>
                                    {isUploading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <Camera size={20} className="text-white" />
                                    )}
                                </div>
                            </label>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Business Stats</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Rating</p>
                                <div className="flex items-center gap-2">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {vendorProfile?.rating?.toFixed(1) || "0.0"}
                                    </div>
                                    <div className="text-yellow-500">★★★★★</div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    {vendorProfile?.reviewCount || 0} reviews
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Verification Status</p>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                                    vendorProfile?.isVerified 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-yellow-100 text-yellow-800"
                                }`}>
                                    {vendorProfile?.verificationStatus === 'verified' ? "✓ Verified" : 
                                     vendorProfile?.verificationStatus === 'pending' ? "Pending Review" : 
                                     "Not Submitted"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Business Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Business Information</h3>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Name *
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        required
                                    />
                                ) : (
                                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                        {vendorProfile?.businessName || "Not set"}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} />
                                        Location
                                    </div>
                                </label>
                                {isEditing ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                                            className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                        />
                                        <input
                                            type="text"
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={(e) => setFormData({...formData, state: e.target.value})}
                                            className="px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                        />
                                    </div>
                                ) : (
                                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                        {displayLocation}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                    />
                                ) : (
                                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                        {vendorProfile?.phone || "Not provided"}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Website
                                </label>
                                {isEditing ? (
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="url"
                                            value={formData.website}
                                            onChange={(e) => setFormData({...formData, website: e.target.value})}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                ) : (
                                    <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                        {vendorProfile?.website || "Not provided"}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business Description *
                            </label>
                            {isEditing ? (
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                                    placeholder="Tell customers about your business, services, and experience..."
                                    required
                                />
                            ) : (
                                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-line">
                                    {vendorProfile?.description || "No description provided"}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Years in Business
                            </label>
                            {isEditing ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, yearsExperience: Math.max(0, formData.yearsExperience - 1)})}
                                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="w-12 text-center font-semibold text-gray-900">
                                        {formData.yearsExperience}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, yearsExperience: formData.yearsExperience + 1})}
                                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            ) : (
                                <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                    {vendorProfile?.yearsExperience || 0} {vendorProfile?.yearsExperience === 1 ? 'year' : 'years'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Services Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Services Offered</h3>
                            {isEditing && (
                                <div className="text-sm text-gray-600">
                                    {services.length} service{services.length !== 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-4">
                            {services.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-3">
                                    {services.map((service) => (
                                        <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div>
                                                <p className="font-medium text-gray-900">{service.name}</p>
                                                {service.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                                )}
                                                {service.price && (
                                                    <p className="text-sm font-medium text-blue-600 mt-1">
                                                        UGX {service.price.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                            {isEditing && (
                                                <button
                                                    onClick={() => handleRemoveService(service.id)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                    type="button"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                    <p className="text-gray-600">No services added yet</p>
                                    <p className="text-sm text-gray-500 mt-1">Add your services to attract customers</p>
                                </div>
                            )}

                            {isEditing && (
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newService}
                                        onChange={(e) => setNewService(e.target.value)}
                                        placeholder="Add a new service (e.g., Wedding Photography)"
                                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddService()}
                                    />
                                    <button
                                        onClick={handleAddService}
                                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        type="button"
                                    >
                                        <Plus size={18} /> Add
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-3">Social Media Links</h3>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <Twitter className="text-blue-600" size={20} />
                                </div>
                                {isEditing ? (
                                    <input
                                        type="url"
                                        value={socialLinks.twitter}
                                        onChange={(e) => setSocialLinks({...socialLinks, twitter: e.target.value})}
                                        placeholder="https://twitter.com/yourbusiness"
                                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                    />
                                ) : (
                                    <p className="flex-1 px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                        {socialLinks.twitter || "Not set"}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                                    <Instagram className="text-pink-600" size={20} />
                                </div>
                                {isEditing ? (
                                    <input
                                        type="url"
                                        value={socialLinks.instagram}
                                        onChange={(e) => setSocialLinks({...socialLinks, instagram: e.target.value})}
                                        placeholder="https://instagram.com/yourbusiness"
                                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                    />
                                ) : (
                                    <p className="flex-1 px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                        {socialLinks.instagram || "Not set"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
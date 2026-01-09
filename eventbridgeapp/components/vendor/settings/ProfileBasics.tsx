"use client";

import { useState } from "react";
import { MapPin, Plus, Twitter, Instagram, Trash2, Camera, Minus } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ProfileBasics() {
    const { addToast } = useToast();
    const [businessName, setBusinessName] = useState("Catering by EventBridge");
    const [location, setLocation] = useState("New York, NY");
    const [services, setServices] = useState(["Catering", "Bartending"]);
    const [years, setYears] = useState(5);
    const [bio, setBio] = useState("We are a premier catering service based in NYC, specializing in farm-to-table cuisine for weddings, corporate events, and private parties. Our mission is to provide unforgettable culinary experiences using the freshest local ingredients.");
    const [socials, setSocials] = useState({
        twitter: "twitter.com/eventbridgecaters",
        instagram: ""
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        addToast("Profile updated successfully", "success");
        setIsSaving(false);
    };

    const handlePhotoClick = () => {
        document.getElementById('photo-upload')?.click();
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            // In a real app, upload here. For now just toast.
            addToast("Photo uploaded (simulated)", "info");
        }
    };

    const removeService = (service: string) => {
        setServices(services.filter(s => s !== service));
    };

    return (
        <div className="bg-shades-white p-6 md:p-8 rounded-2xl border border-neutrals-02 relative">
            <h2 className="text-xl font-bold text-shades-black mb-8">Profile Basics</h2>

            <div className="flex flex-col md:flex-row gap-8 lg:gap-12 mb-8">
                {/* Photo Upload Section */}
                <div className="flex-shrink-0 flex flex-col items-center">
                    <div
                        onClick={handlePhotoClick}
                        className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden mb-4 group cursor-pointer border-4 border-neutrals-01 shadow-sm"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=400"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-shades-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="text-shades-white w-8 h-8" />
                        </div>
                    </div>
                    <button
                        onClick={handlePhotoClick}
                        className="text-sm text-neutrals-06 hover:text-primary-01 font-medium underline transition-colors"
                    >
                        Change Photo
                    </button>
                    <input
                        type="file"
                        id="photo-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handlePhotoChange}
                    />
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-8">
                    {/* Row 1 */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-shades-black">Business Name</label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none transition-all placeholder:text-neutrals-05"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-shades-black">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutrals-05" />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none transition-all placeholder:text-neutrals-05"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Services & Years */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-shades-black">Type of Services (Select all that apply)</label>
                            <div className="flex flex-wrap gap-2 items-center">
                                {services.map(service => (
                                    <span key={service} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-01/10 text-primary-01 text-sm font-medium">
                                        {service}
                                        <button onClick={() => removeService(service)} className="hover:text-primary-02">
                                            <Trash2 size={12} />
                                        </button>
                                    </span>
                                ))}
                                <button className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-neutrals-02 hover:bg-neutrals-03 text-neutrals-07 text-sm font-medium transition-colors">
                                    <Plus size={14} /> Add Service
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-shades-black">Years in Business</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setYears(Math.max(0, years - 1))}
                                    className="w-10 h-10 rounded-lg border border-neutrals-03 flex items-center justify-center hover:bg-neutrals-01 transition-colors text-neutrals-07"
                                >
                                    <Minus size={18} />
                                </button>
                                <span className="w-12 text-center font-semibold text-shades-black">{years}</span>
                                <button
                                    onClick={() => setYears(years + 1)}
                                    className="w-10 h-10 rounded-lg border border-neutrals-03 flex items-center justify-center hover:bg-neutrals-01 transition-colors text-neutrals-07"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Bio */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-shades-black">Bio / Description</label>
                            <span className="text-xs text-neutrals-05">{bio.length}/500</span>
                        </div>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            maxLength={500}
                            className="w-full px-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none transition-all placeholder:text-neutrals-05 resize-none"
                        />
                    </div>

                    {/* Row 4: Socials */}
                    <div className="space-y-4 pt-2">
                        <label className="text-sm font-semibold text-shades-black">Social Media Links</label>

                        <div className="flex items-center gap-3">
                            <Twitter className="w-5 h-5 text-shades-black" />
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={socials.twitter}
                                    onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none transition-all placeholder:text-neutrals-05"
                                />
                                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutrals-04 hover:text-shades-black transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Instagram className="w-5 h-5 text-shades-black" />
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={socials.instagram}
                                    onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                                    placeholder="Add Instagram Link"
                                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none transition-all placeholder:text-neutrals-05"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Action Bar */}
            <div className="flex justify-end pt-6 border-t border-neutrals-02">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-3 bg-primary-01 hover:bg-primary-02 text-shades-white font-semibold rounded-xl shadow-lg shadow-primary-01/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

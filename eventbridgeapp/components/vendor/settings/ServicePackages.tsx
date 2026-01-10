"use client";

import { useState, useEffect } from "react";
import { Check, Plus, Rocket, X, Trash2, Edit, Package, DollarSign, Clock } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface ServicePackage {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number | null;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
}

interface ServicePackagesProps {
  packages?: ServicePackage[];
  onPackagesUpdate?: (updatedPackages: ServicePackage[]) => void;
}

export default function ServicePackages({ 
  packages: initialPackages, 
  onPackagesUpdate 
}: ServicePackagesProps = {}) {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(!initialPackages);
    const [packages, setPackages] = useState<ServicePackage[]>(initialPackages || []);
    const [isCreating, setIsCreating] = useState(false);
    const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
    
    // New package form state
    const [newPackage, setNewPackage] = useState({
        name: "",
        description: "",
        price: 0,
        duration: 0,
        features: [""],
        isPopular: false,
        isActive: true
    });

    // Fetch packages if not provided via props
    useEffect(() => {
        if (!initialPackages) {
            fetchPackages();
        }
    }, [initialPackages]);

    const fetchPackages = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/vendor/packages');
            const data = await response.json();
            
            if (data.success) {
                setPackages(data.packages || []);
            }
        } catch (error) {
            console.error('Failed to fetch packages:', error);
            addToast("Failed to load packages", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePackage = async () => {
        try {
            const response = await fetch('/api/vendor/packages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPackage),
            });

            const data = await response.json();
            
            if (data.success) {
                const updatedPackages = [...packages, data.package];
                setPackages(updatedPackages);
                
                // Notify parent component if callback provided
                if (onPackagesUpdate) {
                    onPackagesUpdate(updatedPackages);
                }
                
                // Reset form
                setNewPackage({
                    name: "",
                    description: "",
                    price: 0,
                    duration: 0,
                    features: [""],
                    isPopular: false,
                    isActive: true
                });
                setIsCreating(false);
                
                addToast("Package created successfully", "success");
            }
        } catch (error) {
            addToast("Failed to create package", "error");
        }
    };

    const handleDeletePackage = async (packageId: number) => {
        try {
            const response = await fetch(`/api/vendor/packages/${packageId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            
            if (data.success) {
                const updatedPackages = packages.filter(pkg => pkg.id !== packageId);
                setPackages(updatedPackages);
                
                // Notify parent component if callback provided
                if (onPackagesUpdate) {
                    onPackagesUpdate(updatedPackages);
                }
                
                addToast("Package deleted successfully", "success");
            }
        } catch (error) {
            addToast("Failed to delete package", "error");
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-UG", {
            style: "currency",
            currency: "UGX",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDuration = (minutes: number | null) => {
        if (!minutes) return "Flexible";
        if (minutes < 60) return `${minutes} min`;
        const hours = minutes / 60;
        return hours % 1 === 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : `${hours.toFixed(1)} hours`;
    };

    // Check if user is on free tier (max 2 packages)
    const isFreeTier = packages.length >= 2;
    const remainingFreePackages = Math.max(0, 2 - packages.length);

    return (
        <div className="bg-shades-white p-6 md:p-8 rounded-2xl border border-neutrals-02">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-shades-black">Service Packages</h2>
                    <p className="text-sm text-neutrals-06 mt-1">
                        {packages.length} package{packages.length !== 1 ? 's' : ''} created
                        {isFreeTier && " • Free tier limit reached"}
                    </p>
                </div>
                <button 
                    onClick={() => setIsCreating(true)}
                    disabled={isFreeTier}
                    className={`flex items-center gap-2 font-semibold transition-colors ${
                        isFreeTier 
                            ? "text-neutrals-05 cursor-not-allowed" 
                            : "text-primary-01 hover:text-primary-02"
                    }`}
                >
                    <Plus className="w-5 h-5" />
                    Add Package
                </button>
            </div>

            {/* Create Package Form */}
            {isCreating && (
                <div className="bg-neutrals-01 rounded-xl p-6 mb-8 border border-neutrals-03">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-shades-black">Create New Package</h3>
                        <button 
                            onClick={() => setIsCreating(false)}
                            className="text-neutrals-06 hover:text-shades-black"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-neutrals-07 mb-2">Package Name</label>
                            <input
                                type="text"
                                value={newPackage.name}
                                onChange={(e) => setNewPackage({...newPackage, name: e.target.value})}
                                className="w-full px-4 py-3 rounded-lg border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none"
                                placeholder="e.g., Premium Wedding Package"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutrals-07 mb-2">Price</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutrals-05 w-5 h-5" />
                                    <input
                                        type="number"
                                        value={newPackage.price}
                                        onChange={(e) => setNewPackage({...newPackage, price: Number(e.target.value)})}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-neutrals-07 mb-2">Duration</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutrals-05 w-5 h-5" />
                                    <input
                                        type="number"
                                        value={newPackage.duration}
                                        onChange={(e) => setNewPackage({...newPackage, duration: Number(e.target.value)})}
                                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none"
                                        placeholder="Minutes"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-neutrals-07 mb-2">Description</label>
                        <textarea
                            value={newPackage.description}
                            onChange={(e) => setNewPackage({...newPackage, description: e.target.value})}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-neutrals-03 text-shades-black focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10 outline-none resize-none"
                            placeholder="Describe what's included in this package..."
                        />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={() => setIsCreating(false)}
                            className="px-6 py-3 border border-neutrals-03 text-neutrals-07 rounded-lg hover:bg-neutrals-02 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleCreatePackage}
                            disabled={!newPackage.name.trim()}
                            className="px-6 py-3 bg-primary-01 hover:bg-primary-02 text-shades-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create Package
                        </button>
                    </div>
                </div>
            )}

            {/* Your Packages */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-shades-black mb-4">Your Packages</h3>
                
                {packages.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {packages.map((pkg) => (
                            <div key={pkg.id} className="bg-neutrals-01 rounded-xl p-6 border border-neutrals-03 relative hover:shadow-sm transition-shadow">
                                {pkg.isPopular && (
                                    <div className="absolute -top-2 right-4 px-3 py-1 bg-primary-01 rounded text-xs font-bold text-shades-white">
                                        Popular
                                    </div>
                                )}
                                
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h4 className="text-lg font-bold text-shades-black">{pkg.name}</h4>
                                        <p className="text-sm text-neutrals-06 mt-1">
                                            {formatDuration(pkg.duration)} • {formatCurrency(pkg.price)}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeletePackage(pkg.id)}
                                        className="text-neutrals-05 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                {pkg.description && (
                                    <p className="text-sm text-neutrals-07 mb-4">{pkg.description}</p>
                                )}
                                
                                {pkg.features && pkg.features.length > 0 && pkg.features[0] && (
                                    <ul className="space-y-2">
                                        {pkg.features.slice(0, 3).map((feature, index) => (
                                            feature && (
                                                <li key={index} className="flex items-start gap-2 text-sm text-shades-black">
                                                    <Check className="w-4 h-4 text-accents-discount mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            )
                                        ))}
                                        {pkg.features.length > 3 && (
                                            <li className="text-sm text-neutrals-06">
                                                +{pkg.features.length - 3} more features
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-neutrals-03 rounded-xl">
                        <Package className="w-12 h-12 text-neutrals-04 mx-auto mb-3" />
                        <p className="text-neutrals-06">No packages created yet</p>
                        <p className="text-sm text-neutrals-05 mt-1">Create your first service package</p>
                    </div>
                )}
            </div>

            {/* Pro Tier Banner/Section - Shows when at limit */}
            {isFreeTier && (
                <div className="bg-gradient-to-r from-accents-peach/40 via-accents-peach/20 to-transparent rounded-2xl p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-2 text-primary-01 font-bold text-xs tracking-wider uppercase">
                        <Rocket className="w-4 h-4" />
                        Boost Your Visibility
                    </div>
                    <h3 className="text-2xl font-bold text-shades-black mb-8">Upgrade to Pro Tier</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Free Tier Card */}
                        <div className="bg-shades-white/60 rounded-xl p-6 border border-neutrals-03 relative">
                            <div className="absolute top-4 right-4 px-3 py-1 bg-neutrals-04 rounded text-xs font-semibold text-shades-white">
                                Current
                            </div>
                            <h4 className="text-lg font-bold text-shades-black mb-6">Free Tier</h4>

                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center gap-3 text-sm text-shades-black">
                                    <Check className="w-4 h-4 text-accents-discount" />
                                    2 Service Packages
                                </li>
                                <li className="flex items-center gap-3 text-sm text-shades-black">
                                    <Check className="w-4 h-4 text-accents-discount" />
                                    Standard Search Listing
                                </li>
                                <li className="flex items-center gap-3 text-sm text-neutrals-06">
                                    <X className="w-4 h-4" />
                                    No Priority Leads
                                </li>
                            </ul>
                        </div>

                        {/* Pro Tier Card */}
                        <div className="bg-gradient-to-b from-primary-01/10 to-transparent rounded-xl p-6 border border-primary-01/30 relative">
                            <div className="absolute -top-3 right-4 px-3 py-1 bg-primary-01 rounded text-xs font-bold text-shades-white uppercase shadow-sm">
                                Recommended
                            </div>
                            <div className="flex justify-between items-start mb-6">
                                <h4 className="text-lg font-bold text-shades-black">Pro Tier</h4>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-primary-01">$29</span>
                                    <span className="text-sm text-shades-black">/mo</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                <li className="flex items-center gap-3 text-sm text-shades-black">
                                    <Check className="w-4 h-4 text-primary-01" />
                                    Unlimited Packages
                                </li>
                                <li className="flex items-center gap-3 text-sm text-shades-black">
                                    <Check className="w-4 h-4 text-primary-01" />
                                    Featured in Search Results
                                </li>
                                <li className="flex items-center gap-3 text-sm text-shades-black">
                                    <Check className="w-4 h-4 text-primary-01" />
                                    Priority Leads Access
                                </li>
                            </ul>

                            <button className="w-full py-3 bg-primary-01 hover:bg-primary-02 text-shades-white font-bold rounded-xl shadow-lg shadow-primary-01/20 transition-all active:scale-[0.98]">
                                Upgrade Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Free Tier Info - Shows when below limit */}
            {!isFreeTier && packages.length > 0 && (
                <div className="bg-neutrals-01 rounded-xl p-6 border border-neutrals-03">
                    <div className="flex items-center gap-3 mb-2">
                        <Package className="w-5 h-5 text-primary-01" />
                        <p className="text-sm font-medium text-shades-black">Free Tier Limits</p>
                    </div>
                    <p className="text-sm text-neutrals-06">
                        You can create {remainingFreePackages} more package{remainingFreePackages !== 1 ? 's' : ''} on the free tier. 
                        Upgrade to Pro for unlimited packages and premium features.
                    </p>
                </div>
            )}
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Rocket, X, Trash2, Package, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";

export interface ServicePackage {
  id: number;
  name: string;
  description: string | null;
  price: number;
  priceMax: number | null;
  duration: number | null;
  capacityMin: number | null;
  capacityMax: number | null;
  pricingModel: string | null;
  pricingStructure?: string[];
  customPricing?: boolean;
  features: string[];
  tags?: string[];
  isPopular: boolean;
  isActive: boolean;
}

interface ServicePackagesProps {
  packages?: ServicePackage[];
  onPackagesUpdate?: (updatedPackages: ServicePackage[]) => void;
}

const DEFAULT_PACKAGE_FORM = {
  name: "",
  description: "",
  price: 0,
  priceMax: 0,
  duration: 0,
  capacityMin: 0,
  capacityMax: 0,
  pricingModel: "per_event",
  pricingStructure: ["Per event"] as string[],
  customPricing: false,
  features: [""],
  tags: [] as string[],
  isPopular: false,
  isActive: true
};

const PRICING_OPTIONS = ["Per event", "Per day", "Per hour", "Per person", "Per plate"];
const BADGE_OPTIONS = ["Popular", "Best Value", "Most Booked", "Recommended"];
const PRICING_MODEL_LABELS: Record<string, string> = {
  per_event: "Per event",
  per_day: "Per day",
  per_hour: "Per hour",
  per_person: "Per person",
  per_plate: "Per plate"
};

const toPricingModel = (label: string) => label.toLowerCase().replace(/\s+/g, "_");

export default function ServicePackages({
  packages: initialPackages,
  onPackagesUpdate
}: ServicePackagesProps = {}) {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(!initialPackages);
  const [packages, setPackages] = useState<ServicePackage[]>(initialPackages || []);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [packageForm, setPackageForm] = useState({ ...DEFAULT_PACKAGE_FORM });
  const [customPricingInput, setCustomPricingInput] = useState("");
  const [showCustomPricingInput, setShowCustomPricingInput] = useState(false);

  useEffect(() => {
    if (!initialPackages) {
      fetchPackages();
    }
  }, [initialPackages]);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/vendor/packages");
      const data = await response.json();
      console.log('Fetched packages:', data); // Debug log

      if (data.success) {
        setPackages(data.packages || []);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      addToast("Failed to load packages", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePackage = async () => {
    if (isSaving) return;
    
    // Validate required fields
    if (!packageForm.name.trim()) {
      addToast("Package title is required", "error");
      return;
    }

    // Prepare the payload
    const cleanedFeatures = packageForm.features
      .map((item) => item.trim())
      .filter(Boolean);
    
    const cleanedTags = packageForm.tags
      .map((tag) => tag.trim())
      .filter(Boolean);
    
    // Determine pricing structure
    let pricingStructure = packageForm.pricingStructure;
    if (!pricingStructure || pricingStructure.length === 0) {
      pricingStructure = packageForm.pricingModel 
        ? [PRICING_MODEL_LABELS[packageForm.pricingModel] || packageForm.pricingModel]
        : ["Per event"];
    }

    // Determine if popular based on tags
    const isPopular = cleanedTags.includes("Recommended") || cleanedTags.includes("Popular");

    const payload = {
      name: packageForm.name.trim(),
      description: packageForm.description.trim() || null,
      price: Number(packageForm.price) || 0,
      priceMax: packageForm.priceMax && packageForm.priceMax > 0 ? Number(packageForm.priceMax) : null,
      duration: packageForm.duration && packageForm.duration > 0 ? Number(packageForm.duration) : null,
      capacityMin: packageForm.capacityMin && packageForm.capacityMin > 0 ? Number(packageForm.capacityMin) : null,
      capacityMax: packageForm.capacityMax && packageForm.capacityMax > 0 ? Number(packageForm.capacityMax) : null,
      pricingModel: toPricingModel(pricingStructure[0]),
      pricingStructure,
      customPricing: Boolean(packageForm.customPricing),
      features: cleanedFeatures.length > 0 ? cleanedFeatures : [],
      tags: cleanedTags,
      isPopular,
      isActive: true
    };

    console.log('Saving package payload:', payload); // Debug log

    try {
      setIsSaving(true);
      const isEditing = Boolean(editingPackage);
      const endpoint = isEditing
        ? `/api/vendor/packages/${editingPackage?.id}`
        : "/api/vendor/packages";

      console.log('Making request to:', endpoint, 'with method:', isEditing ? 'PATCH' : 'POST'); // Debug log

      const response = await fetch(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Response from server:', data); // Debug log

      if (data.success) {
        const newPackage: ServicePackage = data.package;
        const updatedPackages = isEditing
          ? packages.map((pkg) => (pkg.id === newPackage.id ? newPackage : pkg))
          : [...packages, newPackage];
        
        setPackages(updatedPackages);

        if (onPackagesUpdate) {
          onPackagesUpdate(updatedPackages);
        }

        // Reset form and close modal
        setPackageForm({ ...DEFAULT_PACKAGE_FORM });
        setEditingPackage(null);
        setIsModalOpen(false);
        setCustomPricingInput("");
        setShowCustomPricingInput(false);

        addToast(
          isEditing ? "Package updated successfully" : "Package created successfully", 
          "success"
        );
      } else {
        // Handle API error response
        const errorMessage = data.error || data.message || "Failed to save package";
        addToast(errorMessage, "error");
      }
    } catch (error: any) {
      console.error('Error saving package:', error);
      addToast(error?.message || "Failed to save package", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePackage = async (packageId: number) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      const response = await fetch(`/api/vendor/packages/${packageId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        const updatedPackages = packages.filter((pkg) => pkg.id !== packageId);
        setPackages(updatedPackages);

        if (onPackagesUpdate) {
          onPackagesUpdate(updatedPackages);
        }

        addToast("Package deleted successfully", "success");
      } else {
        addToast(data.error || "Failed to delete package", "error");
      }
    } catch (error) {
      console.error("Failed to delete package:", error);
      addToast("Failed to delete package", "error");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "Flexible";
    if (minutes < 60) return `${minutes} min`;
    const hours = minutes / 60;
    return hours % 1 === 0 ? `${hours} hour${hours !== 1 ? "s" : ""}` : `${hours.toFixed(1)} hours`;
  };

  const openCreateModal = () => {
    setEditingPackage(null);
    setPackageForm({ ...DEFAULT_PACKAGE_FORM });
    setCustomPricingInput("");
    setShowCustomPricingInput(false);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: ServicePackage) => {
    // Determine pricing structure
    let pricingStructure: string[];
    if (pkg.pricingStructure && pkg.pricingStructure.length > 0) {
      pricingStructure = pkg.pricingStructure;
    } else if (pkg.pricingModel) {
      pricingStructure = [PRICING_MODEL_LABELS[pkg.pricingModel] || pkg.pricingModel];
    } else {
      pricingStructure = ["Per event"];
    }

    // Determine tags
    const tags = pkg.tags && pkg.tags.length > 0 
      ? pkg.tags 
      : pkg.isPopular 
        ? ["Recommended"] 
        : [];

    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name || "",
      description: pkg.description || "",
      price: pkg.price || 0,
      priceMax: pkg.priceMax || 0,
      duration: pkg.duration || 0,
      capacityMin: pkg.capacityMin || 0,
      capacityMax: pkg.capacityMax || 0,
      pricingModel: pkg.pricingModel || "per_event",
      pricingStructure,
      customPricing: pkg.customPricing ?? false,
      features: pkg.features && pkg.features.length > 0 ? pkg.features : [""],
      tags,
      isPopular: pkg.isPopular || false,
      isActive: pkg.isActive !== false
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingPackage(null);
    setPackageForm({ ...DEFAULT_PACKAGE_FORM });
    setIsModalOpen(false);
    setCustomPricingInput("");
    setShowCustomPricingInput(false);
    setIsSaving(false);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...packageForm.features];
    newFeatures[index] = value;
    setPackageForm({ ...packageForm, features: newFeatures });
  };

  const addFeature = () => {
    setPackageForm({ ...packageForm, features: [...packageForm.features, ""] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = packageForm.features.filter((_, i) => i !== index);
    setPackageForm({ ...packageForm, features: newFeatures.length > 0 ? newFeatures : [""] });
  };

  const togglePricingStructure = (value: string) => {
    const current = packageForm.pricingStructure;
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setPackageForm({ ...packageForm, pricingStructure: next });
  };

  const addCustomPricing = () => {
    const value = customPricingInput.trim();
    if (!value) return;
    if (packageForm.pricingStructure.includes(value)) return;
    setPackageForm({
      ...packageForm,
      pricingStructure: [...packageForm.pricingStructure, value]
    });
    setCustomPricingInput("");
    setShowCustomPricingInput(false);
  };

  const toggleTag = (tag: string) => {
    const current = packageForm.tags;
    const next = current.includes(tag)
      ? current.filter((item) => item !== tag)
      : [...current, tag];
    setPackageForm({ ...packageForm, tags: next });
  };

  const isFreeTier = packages.length >= 2;
  const remainingFreePackages = Math.max(0, 2 - packages.length);

  // Loading state
  if (isLoading && !initialPackages) {
    return (
      <div className="bg-shades-white p-6 md:p-8 rounded-2xl border border-neutrals-02">
        <div className="animate-pulse">
          <div className="h-8 bg-neutrals-03 rounded w-48 mb-2"></div>
          <div className="h-4 bg-neutrals-03 rounded w-64 mb-8"></div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-neutrals-01 rounded-xl p-6 border border-neutrals-03">
                <div className="h-6 bg-neutrals-03 rounded w-32 mb-4"></div>
                <div className="h-4 bg-neutrals-03 rounded w-48 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-neutrals-03 rounded w-full"></div>
                  <div className="h-3 bg-neutrals-03 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-shades-white p-6 md:p-8 rounded-2xl border border-neutrals-02">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-shades-black">Service Packages</h2>
          <p className="text-sm text-neutrals-06 mt-1">
            {packages.length} package{packages.length !== 1 ? "s" : ""} created
            {isFreeTier && " • Free tier limit reached"}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={isFreeTier}
          className={`flex items-center gap-2 font-semibold transition-colors ${isFreeTier 
            ? "text-neutrals-05 cursor-not-allowed" 
            : "text-primary-01 hover:text-primary-02"
          }`}
        >
          <Plus className="w-5 h-5" />
          Add Package
        </button>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-shades-black mb-4">Your Packages</h3>

        {packages.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-neutrals-01 rounded-xl p-6 border border-neutrals-03 relative hover:shadow-sm transition-shadow"
              >
                {pkg.isPopular && (
                  <div className="absolute -top-2 right-4 px-3 py-1 bg-primary-01 rounded text-xs font-bold text-shades-white">
                    Recommended
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-shades-black">{pkg.name}</h4>
                    <p className="text-sm text-neutrals-06 mt-1">
                      {formatDuration(pkg.duration)} • {formatCurrency(pkg.price)}
                      {pkg.priceMax ? ` - ${formatCurrency(pkg.priceMax)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="text-sm font-semibold text-primary-01 hover:text-primary-02 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="text-neutrals-05 hover:text-red-600 transition-colors"
                      title="Delete package"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
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

      {isFreeTier && (
        <div className="bg-gradient-to-r from-accents-peach/40 via-accents-peach/20 to-transparent rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2 text-primary-01 font-bold text-xs tracking-wider uppercase">
            <Rocket className="w-4 h-4" />
            Boost Your Visibility
          </div>
          <h3 className="text-2xl font-bold text-shades-black mb-8">Upgrade to Pro Tier</h3>

          <div className="grid md:grid-cols-2 gap-6">
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

      {!isFreeTier && packages.length > 0 && (
        <div className="bg-neutrals-01 rounded-xl p-6 border border-neutrals-03">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-primary-01" />
            <p className="text-sm font-medium text-shades-black">Free Tier Limits</p>
          </div>
          <p className="text-sm text-neutrals-06">
            You can create {remainingFreePackages} more package{remainingFreePackages !== 1 ? "s" : ""} on the free tier.
            Upgrade to Pro for unlimited packages and premium features.
          </p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-in fade-in">
          <div
            className="w-full max-w-2xl bg-shades-white rounded-3xl border border-neutrals-02 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-8 py-6 border-b border-neutrals-02">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutrals-02 rounded-lg">
                  <Package className="w-5 h-5 text-shades-black" />
                </div>
                <h3 className="text-lg font-bold text-shades-black">
                  {editingPackage ? "Edit Package" : "Create New Package"}
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={closeModal}
                  className="text-neutrals-06 hover:text-shades-black transition-colors text-sm font-medium"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePackage}
                  disabled={isSaving || !packageForm.name.trim()}
                  className="bg-primary-01 hover:bg-primary-02 text-shades-white px-6 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Saving..." : editingPackage ? "Update" : "Create"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutrals-06 mb-2">
                    Package Title *
                  </label>
                  <input
                    type="text"
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-neutrals-02 border border-neutrals-04 rounded-xl text-shades-black placeholder:text-neutrals-06 focus:outline-none focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10"
                    placeholder="e.g. Gold Royal"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutrals-06 mb-2">
                    Short Tagline
                  </label>
                  <input
                    type="text"
                    value={packageForm.description}
                    onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                    className="w-full px-4 py-3 bg-neutrals-02 border border-neutrals-04 rounded-xl text-shades-black placeholder:text-neutrals-06 focus:outline-none focus:border-primary-01 focus:ring-2 focus:ring-primary-01/10"
                    placeholder="Full styling for standard weddings up to 150 guests."
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-5 bg-neutrals-02 rounded-2xl border border-neutrals-04 space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutrals-06">
                    Price (UGX)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutrals-06 text-xs font-bold">UGX</span>
                      <input
                        type="number"
                        value={packageForm.price || ""}
                        onChange={(e) => setPackageForm({ ...packageForm, price: Number(e.target.value) })}
                        className="w-full pl-10 pr-3 py-2.5 bg-shades-white border border-neutrals-04 rounded-lg text-shades-black text-sm focus:outline-none focus:border-primary-01"
                        placeholder="Min"
                        min="0"
                        disabled={isSaving}
                      />
                    </div>
                    <span className="text-neutrals-05">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutrals-06 text-xs font-bold">UGX</span>
                      <input
                        type="number"
                        value={packageForm.priceMax || ""}
                        onChange={(e) => setPackageForm({ ...packageForm, priceMax: Number(e.target.value) })}
                        className="w-full pl-10 pr-3 py-2.5 bg-shades-white border border-neutrals-04 rounded-lg text-shades-black text-sm focus:outline-none focus:border-primary-01"
                        placeholder="Max (optional)"
                        min="0"
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutrals-06 font-medium">Custom Pricing</span>
                    <Switch
                      checked={packageForm.customPricing}
                      onCheckedChange={(checked) => setPackageForm({ ...packageForm, customPricing: checked })}
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="p-5 bg-neutrals-02 rounded-2xl border border-neutrals-04 space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutrals-06">
                    Guest Capacity
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={packageForm.capacityMin || ""}
                      onChange={(e) => setPackageForm({ ...packageForm, capacityMin: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-shades-white border border-neutrals-04 rounded-lg text-shades-black text-sm focus:outline-none focus:border-primary-01"
                      placeholder="Min"
                      min="0"
                      disabled={isSaving}
                    />
                    <span className="text-neutrals-05">-</span>
                    <input
                      type="number"
                      value={packageForm.capacityMax || ""}
                      onChange={(e) => setPackageForm({ ...packageForm, capacityMax: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-shades-white border border-neutrals-04 rounded-lg text-shades-black text-sm focus:outline-none focus:border-primary-01"
                      placeholder="Max"
                      min="0"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-neutrals-02 border border-neutrals-04 rounded-2xl">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutrals-06 mb-4">
                  Pricing Structure
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRICING_OPTIONS.map((option) => {
                    const isActive = packageForm.pricingStructure.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => togglePricingStructure(option)}
                        disabled={isSaving}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive
                            ? "bg-primary-01 text-shades-white"
                            : "bg-shades-white text-neutrals-06 border border-neutrals-04 hover:text-primary-01 hover:border-primary-01"
                          } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {option}
                      </button>
                    );
                  })}

                  {showCustomPricingInput ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customPricingInput}
                        onChange={(e) => setCustomPricingInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addCustomPricing()}
                        className="px-3 py-2 rounded-full text-sm bg-shades-white border border-neutrals-04 text-shades-black focus:border-primary-01 focus:outline-none"
                        placeholder="Custom"
                        autoFocus
                        disabled={isSaving}
                      />
                      <button
                        onClick={addCustomPricing}
                        disabled={isSaving}
                        className="px-3 py-2 rounded-full bg-primary-01 text-shades-white text-sm font-semibold disabled:opacity-60"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomPricingInput(false);
                          setCustomPricingInput("");
                        }}
                        disabled={isSaving}
                        className="px-3 py-2 rounded-full bg-neutrals-03 text-neutrals-07 text-sm font-semibold disabled:opacity-60"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCustomPricingInput(true)}
                      disabled={isSaving}
                      className="px-4 py-2 rounded-full text-sm font-medium border border-dashed border-neutrals-04 text-neutrals-06 hover:text-primary-01 hover:border-primary-01 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" /> Add Custom
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutrals-06 mb-4">
                  What's Included
                </label>
                <div className="space-y-4 p-6 bg-neutrals-02 rounded-2xl border border-neutrals-04">
                  <div className="space-y-3">
                    {packageForm.features.map((feature, index) => (
                      <div key={index} className="group flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary-01/10 border border-primary-01/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-primary-01" />
                        </div>
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 bg-transparent border-b border-neutrals-04 py-1 text-shades-black text-sm focus:outline-none focus:border-primary-01 placeholder:text-neutrals-06"
                          placeholder="e.g. Venue scouting and selection"
                          disabled={isSaving}
                        />
                        {packageForm.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            disabled={isSaving}
                            className="opacity-0 group-hover:opacity-100 p-1 text-neutrals-06 hover:text-red-400 transition-all disabled:opacity-60"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addFeature}
                    disabled={isSaving}
                    className="flex items-center gap-2 text-primary-01 text-sm font-bold hover:text-primary-02 transition-colors mt-2 disabled:opacity-60"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-neutrals-02 border border-neutrals-04 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${packageForm.tags.includes("Recommended")
                    ? "bg-primary-01/15 text-primary-01"
                    : "bg-shades-white text-neutrals-05"
                    }`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-shades-black">
                      Mark as <span className="text-primary-01">Recommended</span>
                    </div>
                    <div className="text-xs text-neutrals-06">Highlight this package on your profile.</div>
                  </div>
                </div>
                <Switch
                  checked={packageForm.tags.includes("Recommended")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      toggleTag("Recommended");
                    } else {
                      toggleTag("Recommended");
                    }
                  }}
                  disabled={isSaving}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {BADGE_OPTIONS.map((badge) => {
                  const isActive = packageForm.tags.includes(badge);
                  return (
                    <button
                      key={badge}
                      type="button"
                      onClick={() => toggleTag(badge)}
                      disabled={isSaving}
                      className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors ${isActive
                          ? "bg-primary-01 text-shades-white"
                          : "bg-neutrals-02 text-neutrals-06 border border-neutrals-04 hover:text-primary-01 hover:border-primary-01"
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                      {badge}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
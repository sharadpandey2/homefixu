"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

// Types matching the NestJS backend response mapping
interface Property {
  id: string;
  userId: string;
  name: string;
  address: string; // Mapped from addressLine1 in backend
  city: string;
  state: string;
  pincode: string;
  propertyType:
    | "apartment"
    | "independent_house"
    | "villa"
    | "row_house"
    | "penthouse";
  areaMeasurement: "bhk" | "sqft" | "gaz";
  areaValue: number;
  rooms?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment", icon: "🏢" },
  { value: "independent_house", label: "Independent House", icon: "🏠" },
  { value: "villa", label: "Villa", icon: "🏰" },
  { value: "row_house", label: "Row House", icon: "🏘️" },
  { value: "penthouse", label: "Penthouse", icon: "🌆" },
] as const;

const AREA_UNITS = [
  { value: "bhk", label: "BHK", description: "Bedroom Hall Kitchen" },
  { value: "sqft", label: "Square Feet", description: "sq ft" },
  { value: "gaz", label: "Gaz", description: "Indian measurement" },
] as const;

const BHK_OPTIONS = ["1", "2", "3", "4", "5", "5+"];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
  "Puducherry",
];

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [activeProperty, setActiveProperty] =
    useState<Partial<Property> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // ─── DATA FETCHING ────────────────────────────────────────────────────────
  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/properties`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        // TS FIX: Cast res.json() to 'any'
        const data = (await res.json()) as Property[];
        setProperties(data);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // ─── HELPERS ────────────────────────────────────────────────────────────
  const formatArea = (prop: Property | Partial<Property>) => {
    if (!prop.areaValue || !prop.areaMeasurement) return "Not specified";
    if (prop.areaMeasurement === "bhk") return `${prop.areaValue} BHK`;
    if (prop.areaMeasurement === "sqft")
      return `${prop.areaValue.toLocaleString()} sq ft`;
    return `${prop.areaValue} Gaz`;
  };

  const getPropertyIcon = (type: string | undefined) => {
    return PROPERTY_TYPES.find((t) => t.value === type)?.icon || "🏠";
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!activeProperty?.name?.trim())
      newErrors.name = "Property name is required";
    if (!activeProperty?.address?.trim())
      newErrors.address = "Address is required";
    if (!activeProperty?.city?.trim()) newErrors.city = "City is required";
    if (!activeProperty?.state) newErrors.state = "State is required";
    if (
      !activeProperty?.pincode?.trim() ||
      !/^\d{6}$/.test(activeProperty.pincode)
    ) {
      newErrors.pincode = "Valid 6-digit pincode required";
    }
    if (!activeProperty?.propertyType)
      newErrors.propertyType = "Type is required";
    if (!activeProperty?.areaMeasurement)
      newErrors.areaMeasurement = "Area unit required";
    if (!activeProperty?.areaValue || activeProperty.areaValue <= 0) {
      newErrors.areaValue = "Area value is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (updates: Partial<Property>) => {
    setActiveProperty((prev) => ({ ...prev, ...updates }));
  };

  // ─── API ACTIONS ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setIsProcessing(true);

    try {
      const isUpdating = isEditing && activeProperty?.id;
      const url = isUpdating
        ? `${API_BASE_URL}/api/customer/properties/${activeProperty.id}`
        : `${API_BASE_URL}/api/customer/properties`;

      const method = isUpdating ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(activeProperty),
      });

      if (res.ok) {
        await fetchProperties(); // Refresh list
        setIsEditing(false);
        setIsAdding(false);
        setActiveProperty(null);
      } else {
        const errorData = (await res.json()) as any;
        alert(errorData.message || "Failed to save property");
      }
    } catch (_error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/customer/properties/${id}/set-default`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );
      if (res.ok) await fetchProperties();
    } catch (error) {
      console.error("Failed to set default property", error);
    }
  };

  const deleteProperty = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/properties/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) await fetchProperties();
    } catch (error) {
      console.error("Failed to delete property", error);
    }
  };

  const startEditing = (prop: Property) => {
    setActiveProperty(prop);
    setIsEditing(true);
    setIsAdding(false);
    setErrors({});
  };

  const startAdding = () => {
    setActiveProperty({
      propertyType: "apartment",
      areaMeasurement: "bhk",
      areaValue: 1,
      isDefault: properties.length === 0, // Make default if it's the first one
    });
    setIsAdding(true);
    setIsEditing(false);
    setErrors({});
  };

  const cancelEditAdd = () => {
    setIsEditing(false);
    setIsAdding(false);
    setActiveProperty(null);
    setErrors({});
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="py-12 text-center text-white/40">
        Loading properties...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 font-bold text-3xl text-white tracking-tight">
              My Properties
            </h1>
            <p className="text-white/40">Manage your addresses and homes</p>
          </div>
          {!isEditing && !isAdding && (
            <button
              onClick={startAdding}
              className="rounded-xl bg-linear-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white shadow-amber-500/20 shadow-lg transition-all hover:from-amber-600 hover:to-amber-700"
            >
              + Add Property
            </button>
          )}
        </div>
      </motion.div>

      {/* Property List Mode */}
      {!isEditing && !isAdding && (
        <div className="space-y-4">
          {properties.length === 0 ? (
            <div className="rounded-2xl border border-white/6 bg-white/2 py-16 text-center">
              <div className="mb-4 text-6xl">🏠</div>
              <h3 className="mb-2 font-semibold text-white text-xl">
                No properties yet
              </h3>
              <p className="mb-6 text-white/40">
                Add a property so our technicians know where to go.
              </p>
              <button
                onClick={startAdding}
                className="rounded-xl bg-amber-500/10 px-6 py-3 font-semibold text-amber-400 transition-all hover:bg-amber-500/20"
              >
                Add First Property
              </button>
            </div>
          ) : (
            properties.map((prop) => (
              <motion.div
                key={prop.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`rounded-2xl border bg-linear-to-br from-white/4 to-white/2 p-6 ${prop.isDefault ? "border-amber-500/30 shadow-amber-500/5 shadow-lg" : "border-white/6"} transition-all`}
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl ${prop.isDefault ? "bg-linear-to-br from-amber-500/20 to-amber-600/10" : "bg-white/4"}`}
                    >
                      {getPropertyIcon(prop.propertyType)}
                    </div>
                    <div>
                      <div className="mb-1 flex items-center gap-3">
                        <h3 className="font-semibold text-white text-xl">
                          {prop.name}
                        </h3>
                        {prop.isDefault && (
                          <span className="rounded bg-amber-500/20 px-2 py-0.5 font-bold text-[10px] text-amber-400 uppercase tracking-wider">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mb-3 text-sm text-white/60">
                        {prop.address}, {prop.city}, {prop.state} {prop.pincode}
                      </p>
                      <div className="flex flex-wrap gap-2 font-medium text-white/40 text-xs">
                        <span className="flex items-center gap-1.5 rounded-md bg-white/4 px-2.5 py-1">
                          📐 {formatArea(prop)}
                        </span>
                        <span className="flex items-center gap-1.5 rounded-md bg-white/4 px-2.5 py-1 capitalize">
                          🏢 {prop.propertyType.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full gap-2 sm:w-auto sm:flex-col">
                    <button
                      onClick={() => startEditing(prop)}
                      className="flex-1 rounded-lg bg-white/4 px-4 py-2 font-medium text-sm text-white/80 transition-colors hover:bg-white/10 sm:flex-none"
                    >
                      Edit
                    </button>
                    {!prop.isDefault && (
                      <>
                        <button
                          onClick={() => setAsDefault(prop.id)}
                          className="flex-1 rounded-lg px-4 py-2 font-medium text-amber-400 text-sm transition-colors hover:bg-amber-500/10 sm:flex-none"
                        >
                          Set Default
                        </button>
                        <button
                          onClick={() => deleteProperty(prop.id)}
                          className="flex-1 rounded-lg px-4 py-2 font-medium text-red-400 text-sm transition-colors hover:bg-red-500/10 sm:flex-none"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Add / Edit Form Mode */}
      {(isEditing || isAdding) && activeProperty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-500/30 bg-linear-to-br from-white/4 to-white/2 p-6 transition-all sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-4 border-white/6 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-bold text-white text-xl">
              {isEditing ? "Edit Property" : "Add New Property"}
            </h2>
            <div className="flex gap-3">
              <button
                onClick={cancelEditAdd}
                className="flex-1 rounded-lg px-4 py-2 font-medium text-sm text-white/70 transition-colors hover:bg-white/4 sm:flex-none"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="flex-1 rounded-lg bg-amber-500 px-6 py-2 font-bold text-sm text-white transition-colors hover:bg-amber-600 disabled:opacity-50 sm:flex-none"
              >
                {isProcessing ? "Saving..." : "Save Property"}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Name & Type */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-medium text-sm text-white/40">
                  Property Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={activeProperty.name || ""}
                  onChange={(e) => handleChange({ name: e.target.value })}
                  placeholder="e.g. My Apartment, Parent's House"
                  className={`w-full rounded-xl border bg-white/2 px-4 py-3 ${errors.name ? "border-red-500/50" : "border-white/6"} text-white placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none`}
                />
                {errors.name && (
                  <p className="mt-1 text-red-400 text-xs">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block font-medium text-sm text-white/40">
                  Property Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleChange({ propertyType: type.value })}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 transition-all ${activeProperty.propertyType === type.value ? "border-amber-500/50 bg-amber-500/20 text-amber-400" : "border-white/6 bg-white/2 text-white/60 hover:bg-white/4"}`}
                    >
                      <div className="text-xl">{type.icon}</div>
                      <div className="hidden font-medium text-[9px] sm:block">
                        {type.label.split(" ")[0]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block font-medium text-sm text-white/40">
                Full Address <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={activeProperty.address || ""}
                onChange={(e) => handleChange({ address: e.target.value })}
                placeholder="House/Flat No., Street, Area"
                className={`w-full rounded-xl border bg-white/2 px-4 py-3 ${errors.address ? "border-red-500/50" : "border-white/6"} text-white placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none`}
              />
              {errors.address && (
                <p className="mt-1 text-red-400 text-xs">{errors.address}</p>
              )}
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="mb-2 block font-medium text-sm text-white/40">
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={activeProperty.city || ""}
                  onChange={(e) => handleChange({ city: e.target.value })}
                  placeholder="e.g. Gurgaon"
                  className={`w-full rounded-xl border bg-white/2 px-4 py-3 ${errors.city ? "border-red-500/50" : "border-white/6"} text-white placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none`}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-sm text-white/40">
                  State <span className="text-red-400">*</span>
                </label>
                <select
                  value={activeProperty.state || ""}
                  onChange={(e) => handleChange({ state: e.target.value })}
                  className={`w-full rounded-xl border bg-white/2 px-4 py-3 ${errors.state ? "border-red-500/50" : "border-white/6"} text-white focus:border-amber-500/30 focus:outline-none [&>option]:bg-zinc-900`}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-sm text-white/40">
                  Pincode <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={activeProperty.pincode || ""}
                  onChange={(e) => handleChange({ pincode: e.target.value })}
                  placeholder="6-digit code"
                  className={`w-full rounded-xl border bg-white/2 px-4 py-3 ${errors.pincode ? "border-red-500/50" : "border-white/6"} text-white placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none`}
                />
                {errors.pincode && (
                  <p className="mt-1 text-red-400 text-xs">{errors.pincode}</p>
                )}
              </div>
            </div>

            <div className="border-white/6 border-t" />

            {/* Area */}
            <div>
              <label className="mb-2 block font-medium text-sm text-white/40">
                Property Area <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Unit Selector */}
                <div className="grid grid-cols-3 gap-2">
                  {AREA_UNITS.map((unit) => (
                    <button
                      key={unit.value}
                      onClick={() =>
                        handleChange({
                          areaMeasurement: unit.value,
                          areaValue: 0,
                        })
                      }
                      className={`rounded-xl border p-3 transition-all ${activeProperty.areaMeasurement === unit.value ? "border-amber-500/50 bg-amber-500/20 text-amber-400" : "border-white/6 bg-white/2 text-white/60 hover:bg-white/4"}`}
                    >
                      <div className="mb-0.5 font-semibold">{unit.label}</div>
                      <div className="hidden text-[10px] text-white/40 sm:block">
                        {unit.description}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Value Selector/Input */}
                <div>
                  {activeProperty.areaMeasurement === "bhk" ? (
                    <div className="grid h-full min-h-12.5 grid-cols-6 gap-2">
                      {BHK_OPTIONS.map((bhk) => {
                        const val = bhk === "5+" ? 6 : Number.parseInt(bhk, 10);
                        return (
                          <button
                            key={bhk}
                            onClick={() => handleChange({ areaValue: val })}
                            className={`flex flex-col items-center justify-center rounded-xl border py-2 transition-all ${activeProperty.areaValue === val ? "border-amber-500/50 bg-amber-500/20 text-amber-400" : "border-white/6 bg-white/2 text-white/60 hover:bg-white/4"}`}
                          >
                            <span className="font-bold">{bhk}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={activeProperty.areaValue || ""}
                      onChange={(e) =>
                        handleChange({
                          areaValue: Number.parseInt(e.target.value, 10) || 0,
                        })
                      }
                      placeholder={
                        activeProperty.areaMeasurement === "sqft"
                          ? "e.g. 1500"
                          : "e.g. 150"
                      }
                      className="h-full min-h-12.5 w-full rounded-xl border border-white/6 bg-white/2 px-4 py-3 text-white placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none"
                    />
                  )}
                  {errors.areaValue && (
                    <p className="mt-1 text-red-400 text-xs">
                      {errors.areaValue}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Default Checkbox */}
            {isAdding && properties.length > 0 && (
              <div className="border-white/6 border-t pt-4">
                <label className="group flex w-fit cursor-pointer items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${activeProperty.isDefault ? "border-amber-500 bg-amber-500" : "border-white/20 bg-white/2 group-hover:border-white/40"}`}
                  >
                    {activeProperty.isDefault && (
                      <svg
                        className="h-3.5 w-3.5 text-black"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={activeProperty.isDefault}
                    onChange={(e) =>
                      handleChange({ isDefault: e.target.checked })
                    }
                  />
                  <span className="select-none font-medium text-sm text-white/80">
                    Set as my default property
                  </span>
                </label>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

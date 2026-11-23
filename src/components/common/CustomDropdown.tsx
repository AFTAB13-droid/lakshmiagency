"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

export interface CustomDropdownProps {
  options: (string | DropdownOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  menuClassName?: string;
  searchable?: boolean;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right";
  disabled?: boolean;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  icon,
  className = "",
  menuClassName = "",
  searchable = false,
  size = "md",
  align = "left",
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to DropdownOption format
  const normalizedOptions: DropdownOption[] = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === "string") {
        return { value: opt, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === value);
  }, [normalizedOptions, value]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen, searchable]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        opt.value.toLowerCase().includes(q) ||
        (opt.badge && opt.badge.toLowerCase().includes(q))
    );
  }, [normalizedOptions, searchQuery, searchable]);

  // Size styling tokens
  const sizeStyles = {
    sm: "py-1 px-2.5 text-xs rounded-xl min-h-[32px]",
    md: "py-2 px-3 text-xs rounded-2xl min-h-[40px]",
    lg: "py-2.5 px-4 text-sm rounded-2xl min-h-[46px]",
  };

  const optionSizeStyles = {
    sm: "py-1.5 px-2.5 text-xs",
    md: "py-2.5 px-3 text-xs",
    lg: "py-3 px-3.5 text-sm",
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 bg-white text-plum-950 font-bold border transition-all shadow-2xs select-none ${
          sizeStyles[size]
        } ${
          isOpen
            ? "border-plum-400 ring-2 ring-plum-100 shadow-sm"
            : "border-plum-200/90 hover:border-plum-400 hover:bg-plum-50/20"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-[0.99]"}`}
      >
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          {icon && <span className="text-plum-600 shrink-0">{icon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-plum-100 text-plum-800 shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-plum-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-plum-700" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-50 mt-1.5 min-w-[200px] w-full max-w-xs bg-white rounded-2xl border border-plum-100 shadow-xl overflow-hidden backdrop-blur-md p-1.5 ${
              align === "right" ? "right-0" : "left-0"
            } ${menuClassName}`}
          >
            {/* Search Input if enabled */}
            {searchable && (
              <div className="p-1 mb-1 border-b border-plum-100/70">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-plum-100 text-xs text-plum-950 font-medium focus:outline-none focus:border-plum-400 bg-plum-50/30"
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="py-3 px-3 text-center text-xs text-gray-400 font-medium">
                  No matching options
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      disabled={opt.disabled}
                      onClick={() => {
                        if (!opt.disabled) {
                          onChange(opt.value);
                          setIsOpen(false);
                        }
                      }}
                      className={`w-full flex items-center justify-between gap-2 rounded-xl text-left font-bold transition-all ${
                        optionSizeStyles[size]
                      } ${
                        isSelected
                          ? "bg-gradient-to-r from-plum-50 to-lotus-50 text-plum-900 font-black shadow-2xs border border-plum-200/60"
                          : "text-gray-700 hover:bg-plum-50/60 hover:text-plum-950"
                      } ${opt.disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {opt.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                              isSelected
                                ? "bg-plum-200 text-plum-900"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && <Check className="w-3.5 h-3.5 text-lotus-600 shrink-0" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

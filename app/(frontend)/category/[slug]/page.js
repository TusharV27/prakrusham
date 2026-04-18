"use client";

import { useState, useEffect, use } from "react";
import { useLanguage } from "@/context/LanguageContext";
import ProductCard from "@/components/ProductCard";
import SidebarFilter from "@/components/categories/SidebarFilter";
import TopbarFilter from "@/components/categories/TopbarFilter";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CategoryPage({ params }) {
  const { slug } = use(params);
  const { language, t } = useLanguage();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('0');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('Price: Low to High');
  const [gridLayout, setGridLayout] = useState('four');
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Step 1: Find category by slug
        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();

        if (catData.success) {
          setAllCategories(catData.data);
          const foundCategory = catData.data.find(c => c.slug === slug);
          if (foundCategory) {
            setCategory(foundCategory);

            // Step 2: Fetch products for this category
            const prodRes = await fetch(`/api/products?categoryId=${foundCategory.id}&limit=50`);
            const prodData = await prodRes.json();
            if (prodData.success) {
              setProducts(prodData.data);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Handle filtering and sorting
  useEffect(() => {
    let filtered = [...products];

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(p => p.tags && p.tags.split(',').map(tag => tag.trim()).includes(selectedTag));
    }

    // Apply price filter
    const min = parseFloat(minPrice) || 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    filtered = filtered.filter(p => {
      const price = p.price || p.basePrice || 0;
      return price >= min && price <= max;
    });

    // Apply sorting
    switch (sortOption) {
      case 'Price: Low to High':
        filtered.sort((a, b) => (a.price || a.basePrice || 0) - (b.price || b.basePrice || 0));
        break;
      case 'Price: High to Low':
        filtered.sort((a, b) => (b.price || b.basePrice || 0) - (a.price || a.basePrice || 0));
        break;
      case 'Alphabetical: A-Z':
        filtered.sort((a, b) => getTranslated(a.name).localeCompare(getTranslated(b.name)));
        break;
      case 'Alphabetical: Z-A':
        filtered.sort((a, b) => getTranslated(b.name).localeCompare(getTranslated(a.name)));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, minPrice, maxPrice, sortOption, selectedTag]);

  const getTranslated = (field, lang = language) => {
    if (!field) return "";
    let parsed = field;
    if (typeof field === "string") {
      try {
        parsed = JSON.parse(field);
      } catch (e) {
        return field;
      }
    }
    if (typeof parsed === "object" && parsed !== null) {
      const v = parsed[lang] || parsed.en || parsed.hi || parsed.gu || Object.values(parsed)[0];
      return v !== undefined && v !== null ? v : "";
    }
    return typeof parsed === 'string' || typeof parsed === 'number' ? parsed : "";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#14532d]" />
        <p className="mt-4 text-[#14532d] font-medium animate-pulse uppercase tracking-widest text-xs">
          Loading Fresh Collection...
        </p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-[#14532d] mb-4 uppercase tracking-tighter">Category Not Found</h2>
        <p className="text-gray-500 mb-8 tracking-tight">The collection you are looking for doesn't exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#14532d] text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#114224] transition-all"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Category Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-14">
        <div className="relative w-full overflow-hidden border border-[#14532d]/10 ">
          <img
            src={category.image || "/placeholder-wide.png"}
            alt={getTranslated(category.name)}
            className="w-full h-[120px] sm:h-auto object-cover block"
          />
        </div>
      </div>

      {/* Product Grid with Sidebar*/}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filter */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div
              className="sticky top-20"
            >
              <SidebarFilter
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinChange={setMinPrice}
                onMaxChange={setMaxPrice}
                selectedTag={selectedTag}
                onTagChange={setSelectedTag}
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Top Bar Filter */}
            <TopbarFilter
              totalProducts={filteredProducts.length}
              onGridChange={setGridLayout}
              onSortChange={setSortOption}
            />

            {/* Product Grid */}
            <div className={`mt-6 sm:mt-8 grid gap-3 sm:gap-6 ${gridLayout === 'three'
              ? 'grid-cols-2 md:grid-cols-3'
              : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              }`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* No Products Message */}
            {filteredProducts.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-[#14532d]/10 rounded-[32px] bg-green-50/30">
                <h3 className="text-xl font-bold text-[#14532d] mb-2 uppercase tracking-tight">
                  No products found
                </h3>
                <p className="text-gray-500 text-sm tracking-tight">
                  Try adjusting your filters or check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Search, ScanLine, Tag, Package, Plus, Check, AlertCircle } from 'lucide-react';
import { Product } from '../../types/pos';
import { STORE_CATEGORIES } from '../../data/mockData';
import { formatINR } from '../../utils/taxCalculator';

interface ProductCatalogProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onOpenScanner: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onOpenScanner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      return (
        item.name.toLowerCase().includes(q) ||
        item.barcode.includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.hsnCode.includes(q)
      );
    });
  }, [products, selectedCategory, searchQuery]);

  const handleAdd = (product: Product) => {
    if (product.stockQty <= 0) return;
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => {
      setAddedProductId((current) => (current === product.id ? null : current));
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 border-r border-slate-800">
      {/* Top Search Bar & Scanner trigger */}
      <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product by Name, Barcode, SKU, HSN..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition whitespace-nowrap active:scale-95"
            title="Scan barcode with Camera or Laser scanner"
          >
            <ScanLine className="w-4 h-4" />
            <span className="hidden sm:inline">Scan to Cart</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {STORE_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <Package className="w-10 h-10 text-slate-600" />
            <p className="text-sm font-medium">No matching items in store catalog</p>
            <p className="text-xs text-slate-500">
              Try searching for &quot;Amul&quot;, &quot;Tea&quot;, &quot;Silk&quot; or barcode &quot;8901262010053&quot;
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stockQty <= 0;
              const isJustAdded = addedProductId === product.id;

              return (
                <div
                  key={product.id}
                  onClick={() => handleAdd(product)}
                  className={`group relative flex flex-col justify-between bg-slate-900 border rounded-xl p-2.5 transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'border-slate-800 opacity-60 cursor-not-allowed'
                      : isJustAdded
                      ? 'border-emerald-400 ring-2 ring-emerald-500/30 scale-[1.01]'
                      : 'border-slate-800 hover:border-emerald-500/60 hover:bg-slate-850 hover:shadow-lg hover:shadow-emerald-950/20'
                  }`}
                >
                  {/* Top badges: Stock & GST */}
                  <div className="flex items-center justify-between text-[10px] mb-1.5">
                    <span className="font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      HSN {product.hsnCode}
                    </span>
                    <span
                      className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                        isOutOfStock
                          ? 'bg-rose-950 text-rose-400 border border-rose-900'
                          : product.stockQty < 10
                          ? 'bg-amber-950 text-amber-400 border border-amber-900'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-900/60'
                      }`}
                    >
                      {isOutOfStock ? 'Out of Stock' : `${product.stockQty} in stock`}
                    </span>
                  </div>

                  {/* Product Image Thumbnail */}
                  <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 relative mb-2">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Tag className="w-6 h-6" />
                      </div>
                    )}
                    {/* GST Tag Overlay */}
                    <div className="absolute bottom-1 right-1 bg-slate-950/85 backdrop-blur-xs text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-800">
                      GST {product.gstRate}%
                    </div>
                  </div>

                  {/* Name & SKU */}
                  <div className="flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                      {product.sku}
                    </p>
                  </div>

                  {/* Price & Add to Cart button */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white tracking-tight">
                        {formatINR(product.unitPrice)}
                      </div>
                      <div className="text-[9px] text-slate-400">MRP (Incl. Tax)</div>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAdd(product);
                      }}
                      className={`p-1.5 rounded-lg transition-all ${
                        isJustAdded
                          ? 'bg-emerald-500 text-slate-950'
                          : isOutOfStock
                          ? 'bg-slate-800 text-slate-600'
                          : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950'
                      }`}
                      title="Add to active bill"
                    >
                      {isJustAdded ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

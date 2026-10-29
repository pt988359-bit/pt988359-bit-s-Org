import React from 'react';
import { useShowroom } from '../context/ShowroomContext';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Card, CardBody } from './ui/Card';
import { Input, Select } from './ui/Input';
import { EmptyState } from './ui/EmptyState';
import { Search, Eye, Filter } from 'lucide-react';
import { DEFAULT_PRODUCT_PLACEHOLDER } from '../constants/placeholders';

export const CatalogPage: React.FC = () => {
  const {
    filteredProducts,
    isLoadingProducts,
    categories,
    selectedCategoryId,
    navigateTo,
    searchQuery,
    setSearchQuery,
    conditionFilter,
    setConditionFilter,
    statusFilter,
    setStatusFilter,
    settings,
  } = useShowroom();

  return (
    <div className="flex flex-col gap-8 pb-12 dir-rtl">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">معرض الأجهزة المتاحة</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            جميع الأجهزة مفحوصة ومتاحة في معرض المعادي شارع 68 للمعاينة الفورية
          </p>
        </div>
        <div className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl font-medium w-fit">
          عدد الأجهزة المعروضة: <span className="font-bold text-blue-600 dark:text-blue-400">{filteredProducts.length}</span> جهاز
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col md:flex-row items-center gap-4">
        {/* Search Input */}
        <div className="w-full md:flex-1">
          <Input
            placeholder="ابحث بالماركة، الموديل، أو الفئة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Condition Filter */}
        <div className="w-full md:w-56">
          <Select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value as any)}
            options={[
              { value: 'all', label: 'جميع الحالات' },
              { value: 'new', label: 'جديد' },
              { value: 'used_warranty', label: 'مستعمل بضمان الشركة' },
              { value: 'used_no_warranty', label: 'مستعمل بدون ضمان' },
            ]}
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => navigateTo('products', { categoryId: 'all' })}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            !selectedCategoryId || selectedCategoryId === 'all'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          جميع الأقسام
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => navigateTo('products', { categoryId: cat.id })}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategoryId === cat.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Catalog Grid */}
      {isLoadingProducts && filteredProducts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800/80 animate-pulse border border-slate-200/50 dark:border-slate-800 flex flex-col justify-between p-6"
            >
              <div className="w-full h-44 rounded-2xl bg-slate-200 dark:bg-slate-700/50" />
              <div className="space-y-3 mt-4">
                <div className="w-1/3 h-4 rounded bg-slate-200 dark:bg-slate-700/50" />
                <div className="w-3/4 h-6 rounded bg-slate-200 dark:bg-slate-700/50" />
                <div className="w-full h-10 rounded bg-slate-200 dark:bg-slate-700/50" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="لم نجد أجهزة تطابق الفلتر المختار"
          description="جرب البحث بكلمات مختلفة أو إزالة بعض التصفية لتصفح خيارات المعرض الكلية."
          icon={<Filter className="w-8 h-8" />}
          actionLabel="إعادة تصفية الفلاتر"
          onAction={() => {
            setSearchQuery('');
            setConditionFilter('all');
            setStatusFilter('all');
            navigateTo('products', { categoryId: 'all' });
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col group">
              <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={product.images?.[0] || DEFAULT_PRODUCT_PLACEHOLDER}
                  alt={product.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_PLACEHOLDER;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <Badge condition={product.condition} />
                  {product.condition !== 'new' && product.conditionRating && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-amber-300 backdrop-blur-md">
                      تقييم الحالة {product.conditionRating}/10
                    </span>
                  )}
                </div>
                <div className="absolute top-3 left-3">
                  <Badge status={product.status} />
                </div>
              </div>

              <CardBody className="flex-1 flex flex-col justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {product.brand} {product.model && `• ${product.model}`}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1 line-clamp-2 leading-snug">
                    {product.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">السعر المطلوب:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-black text-lg text-slate-900 dark:text-white">
                        {product.price.toLocaleString()} {settings.currencySymbol}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="electric"
                      onClick={() => navigateTo('product-detail', { productId: product.id })}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      التفاصيل والطلب
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

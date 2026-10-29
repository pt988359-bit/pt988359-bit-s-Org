import React, { useState, useRef } from 'react';
import { useShowroom } from '../../context/ShowroomContext';
import { useToast } from '../../context/ToastContext';
import { Category } from '../../types';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Table } from '../ui/Table';
import { Modal } from '../ui/Modal';
import { Layers, Plus, Trash2, Image as ImageIcon, Upload, X, Loader2, Pencil } from 'lucide-react';
import { uploadProductImage } from '../../supabase/storageAdapter';
import { getCategoryCover } from '../../utils/categoryVisuals';

export const AdminCategoriesView: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useShowroom();
  const { showToast } = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setEditingCategory(null);
    setCatName('');
    setCatSlug('');
    setImageFile(null);
    setImagePreview(null);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategory(category);
    setCatName(category.name || category.arabicName || '');
    setCatSlug(category.slug || '');
    setImageFile(null);
    setImagePreview(category.coverImage || null);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    if (isUploading) return;
    setShowAddModal(false);
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('خطأ في الملف', 'يرجى اختيار ملف صورة صالح (JPG, PNG, WebP)', 'error');
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    let coverImageUrl = '';

    if (imageFile) {
      setIsUploading(true);
      try {
        const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `categories/${Date.now()}-${cleanFileName}`;
        const uploadResult = await uploadProductImage(imageFile, storagePath);

        if (uploadResult.error || !uploadResult.publicUrl) {
          showToast(
            'تحذير رفع الصورة',
            'تعذر رفع الصورة إلى خادم التخزين، سيتم حفظ القسم بدون صورة مخصصة',
            'warning'
          );
        } else {
          coverImageUrl = uploadResult.publicUrl;
        }
      } catch (err: any) {
        showToast(
          'خطأ أثناء رفع الصورة',
          err?.message || 'حدث خطأ غير متوقع أثناء رفع الصورة',
          'error'
        );
      } finally {
        setIsUploading(false);
      }
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: catName.trim(),
        arabicName: catName.trim(),
        englishName: catSlug.trim() || catName.trim(),
        slug: catSlug.trim() || catName.trim().toLowerCase().replace(/\s+/g, '-'),
        seoSlug: catSlug.trim() || catName.trim().toLowerCase().replace(/\s+/g, '-'),
        description: `قسم ${catName.trim()} المتاح بالمعرض`,
        coverImage: coverImageUrl || editingCategory.coverImage || '',
      });

      setShowAddModal(false);
      showToast('تم التعديل', `تم تحديث قسم (${catName.trim()}) بنجاح`, 'success');
      resetForm();
      return;
    }

    addCategory({
      name: catName.trim(),
      arabicName: catName.trim(),
      englishName: catSlug.trim() || catName.trim(),
      slug: catSlug.trim() || catName.trim().toLowerCase().replace(/\s+/g, '-'),
      seoSlug: catSlug.trim() || catName.trim().toLowerCase().replace(/\s+/g, '-'),
      iconName: 'Refrigerator',
      description: `قسم ${catName.trim()} المتاح بالمعرض`,
      coverImage: coverImageUrl || '',
      isActive: true,
      sortOrder: categories.length + 1,
    });

    setShowAddModal(false);
    showToast('تمت الإضافة', `تم إنشاء قسم (${catName.trim()}) بنجاح`, 'success');
    resetForm();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 p-4 sm:p-6 pb-3 sm:pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400 shrink-0" />
              <span>إدارة أقسام المعرض ({categories.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">تعديل وإنشاء أقسام المنتجات المعروضة بالمعرض مع تعيين صور الأقسام</p>
          </div>
          <Button
            variant="electric"
            size="sm"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            إنشاء قسم جديد
          </Button>
        </CardHeader>

        <CardBody className="p-3 sm:p-6">
          <Table<Category>
            data={categories}
            keyExtractor={(c) => c.id}
            columns={[
              {
                header: 'صورة القسم',
                cell: (c) => (
                  <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700/60 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={getCategoryCover(c)}
                      alt={c.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ),
              },
              { header: 'اسم القسم', accessorKey: 'name' },
              { header: 'الرابط Slug', accessorKey: 'slug' },
              { header: 'الوصف', accessorKey: 'description' },
              {
                header: 'تعديل',
                cell: (c) => (
                  <button
                    onClick={() => handleStartEdit(c)}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
                    title="تعديل القسم"
                    aria-label="تعديل القسم"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                ),
              },
              {
                header: 'حذف',
                cell: (c) => (
                  <button
                    onClick={() => {
                      deleteCategory(c.id);
                      showToast('تم الحذف', 'تم حذف القسم', 'info');
                    }}
                    className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors min-w-[38px] min-h-[38px] flex items-center justify-center"
                    title="حذف القسم"
                    aria-label="حذف القسم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ),
              },
            ]}
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        title={editingCategory ? 'تعديل القسم' : 'إنشاء قسم جديد بالمعرض'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
          <Input
            label="اسم القسم *"
            placeholder="مثال: ديب فريزر رأسي"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            required
            disabled={isUploading}
          />
          <Input
            label="الرابط اللطيف (Slug)"
            placeholder="deep-freezers"
            value={catSlug}
            onChange={(e) => setCatSlug(e.target.value)}
            disabled={isUploading}
          />

          {/* Category Cover Image Upload Field */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">صورة غلاف القسم (اختياري)</label>
            
            {imagePreview ? (
              <div className="relative w-full h-36 rounded-xl border border-slate-700 bg-slate-950 overflow-hidden group">
                <img
                  src={imagePreview}
                  alt="معاينة صورة القسم"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isUploading}
                    className="p-2 bg-rose-600/90 text-white rounded-lg hover:bg-rose-500 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>إزالة الصورة</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-slate-950/50 hover:bg-slate-950 cursor-pointer transition-all text-slate-400 hover:text-slate-200"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold">اضغط لاختيار صورة للقسم من جهازك</span>
                <span className="text-[11px] text-slate-500">JPG, PNG, WebP (يتم الرفع إلى Supabase Storage)</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
            <Button
              variant="outline"
              type="button"
              onClick={handleCloseModal}
              disabled={isUploading}
            >
              إلغاء
            </Button>
            <Button
              variant="electric"
              type="submit"
              disabled={isUploading || !catName.trim()}
              leftIcon={isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
            >
              {isUploading
                ? 'جاري رفع الصورة والحفظ...'
                : editingCategory
                ? 'تعديل القسم'
                : 'حفظ القسم'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

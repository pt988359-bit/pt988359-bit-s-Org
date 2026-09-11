import React, { useState, useRef } from 'react';
import { EnrichedProduct, ProductMediaAlbum } from '../../../../../types/productStudio';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  CheckCircle2,
  Star,
  Film,
  FolderPlus,
  Maximize2,
  X,
  Loader2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { uploadProductImageToStorage, deleteFileFromStorage, convertFileToDataUrl } from '../../../../../firebase/storage';

interface MediaStudioTabProps {
  product: EnrichedProduct;
  onUpdateProduct: (updated: Partial<EnrichedProduct>) => void;
}

interface UploadTask {
  id: string;
  filename: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  previewUrl: string;
}

export const MediaStudioTab: React.FC<MediaStudioTabProps> = ({ product, onUpdateProduct }) => {
  const [activeAlbumType, setActiveAlbumType] = useState<
    'main' | 'before_cleaning' | 'after_cleaning' | 'before_repair' | 'after_repair'
  >('main');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = async (files: File[]) => {
    console.log("STEP 1 - Files selected", files);
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    // Create initial upload task items for UI progress feedback
    const newTasks: UploadTask[] = imageFiles.map((file, idx) => {
      const tempUrl = URL.createObjectURL(file);
      return {
        id: `task-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        filename: file.name,
        progress: 0,
        status: 'uploading',
        previewUrl: tempUrl,
      };
    });

    setUploadTasks((prev) => [...prev, ...newTasks]);

    // Process each image: Save to website first (Data URL), then attempt Firebase Storage upload
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const task = newTasks[i];

      try {
        // STEP A: Convert image to Data URL and save to website IMMEDIATELY
        const localDataUrl = await convertFileToDataUrl(file);

        if (activeAlbumType === 'main') {
          const currentImages = product.images || [];
          if (!currentImages.includes(localDataUrl)) {
            onUpdateProduct({
              images: [...currentImages, localDataUrl],
              updatedAt: new Date().toISOString(),
            });
          }
        } else {
          const albums = product.mediaAlbums || [];
          const existingAlbumIndex = albums.findIndex((a) => a.type === activeAlbumType);
          const newAlbumImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            url: localDataUrl,
            uploadedAt: new Date().toLocaleDateString('ar-EG'),
          };

          if (existingAlbumIndex >= 0) {
            const updatedAlbums = [...albums];
            updatedAlbums[existingAlbumIndex] = {
              ...updatedAlbums[existingAlbumIndex],
              images: [...updatedAlbums[existingAlbumIndex].images, newAlbumImage],
            };
            onUpdateProduct({ mediaAlbums: updatedAlbums, updatedAt: new Date().toISOString() });
          } else {
            const newAlbum: ProductMediaAlbum = {
              id: `alb-${Date.now()}`,
              type: activeAlbumType,
              title:
                activeAlbumType === 'before_cleaning'
                  ? 'ألبوم ما قبل التنظيف'
                  : activeAlbumType === 'after_cleaning'
                  ? 'ألبوم ما بعد التعقيم والنظافة'
                  : activeAlbumType === 'before_repair'
                  ? 'ألبوم ما قبل الصيانة'
                  : 'ألبوم ما بعد الاصلاح وتغيير القطع',
              images: [newAlbumImage],
            };
            onUpdateProduct({
              mediaAlbums: [...albums, newAlbum],
              updatedAt: new Date().toISOString(),
            });
          }
        }

        // Update task status as saved locally
        setUploadTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, progress: 50, status: 'completed' } : t))
        );

        // STEP B: Asynchronously upload to Firebase Storage in background
        try {
          const downloadUrl = await uploadProductImageToStorage(file, product.id, (pct) => {
            setUploadTasks((prev) =>
              prev.map((t) => (t.id === task.id ? { ...t, progress: 50 + Math.round(pct * 0.5) } : t))
            );
          });

          if (downloadUrl) {
            // Replace local Data URL with Firebase Storage URL
            if (activeAlbumType === 'main') {
              const currentImages = product.images || [];
              const updatedImages = currentImages.map((img) => (img === localDataUrl ? downloadUrl : img));
              onUpdateProduct({
                images: updatedImages,
                updatedAt: new Date().toISOString(),
              });
            } else {
              const albums = product.mediaAlbums || [];
              const updatedAlbums = albums.map((alb) => {
                if (alb.type === activeAlbumType) {
                  return {
                    ...alb,
                    images: alb.images.map((img) => (img.url === localDataUrl ? { ...img, url: downloadUrl } : img)),
                  };
                }
                return alb;
              });
              onUpdateProduct({ mediaAlbums: updatedAlbums, updatedAt: new Date().toISOString() });
            }
          }
        } catch (storageErr) {
          console.warn('Firebase Storage upload failed, image remains saved locally on the site:', storageErr);
        }

        URL.revokeObjectURL(task.previewUrl);
        setUploadTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, progress: 100, status: 'completed' } : t))
        );
      } catch (err: any) {
        console.error('Error saving image locally:', err);
        setUploadTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: 'error', error: err.message || 'فشل حفظ الصورة' }
              : t
          )
        );
      }
    }

    // Clean up finished tasks after 3 seconds
    setTimeout(() => {
      setUploadTasks((prev) => prev.filter((t) => t.status === 'uploading'));
    }, 3000);
  };

  const handleSetMainThumbnail = (url: string) => {
    const currentImages = (product.images || []).filter((img) => img !== url);
    onUpdateProduct({
      images: [url, ...currentImages],
      updatedAt: new Date().toISOString(),
    });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    if (activeAlbumType !== 'main') return;
    const currentImages = [...(product.images || [])];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentImages.length) return;

    const temp = currentImages[index];
    currentImages[index] = currentImages[targetIndex];
    currentImages[targetIndex] = temp;

    onUpdateProduct({
      images: currentImages,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteImage = async (indexToRemove: number) => {
    if (activeAlbumType === 'main') {
      const currentImages = product.images || [];
      const urlToDelete = currentImages[indexToRemove];
      const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
      onUpdateProduct({
        images: updated,
        updatedAt: new Date().toISOString(),
      });

      if (urlToDelete && urlToDelete.includes('firebasestorage.googleapis.com')) {
        await deleteFileFromStorage(urlToDelete);
      }
    } else {
      const albums = product.mediaAlbums || [];
      const existingAlbumIndex = albums.findIndex((a) => a.type === activeAlbumType);
      if (existingAlbumIndex >= 0) {
        const urlToDelete = albums[existingAlbumIndex].images[indexToRemove]?.url;
        const updatedAlbums = [...albums];
        const updatedImages = updatedAlbums[existingAlbumIndex].images.filter(
          (_, idx) => idx !== indexToRemove
        );
        updatedAlbums[existingAlbumIndex] = {
          ...updatedAlbums[existingAlbumIndex],
          images: updatedImages,
        };
        onUpdateProduct({ mediaAlbums: updatedAlbums, updatedAt: new Date().toISOString() });

        if (urlToDelete && urlToDelete.includes('firebasestorage.googleapis.com')) {
          await deleteFileFromStorage(urlToDelete);
        }
      }
    }
  };

  const getActiveAlbumImages = () => {
    if (activeAlbumType === 'main') {
      return product.images || [];
    }
    const album = (product.mediaAlbums || []).find((a) => a.type === activeAlbumType);
    return album ? album.images.map((i) => i.url) : [];
  };

  const activeImages = getActiveAlbumImages();

  return (
    <div className="space-y-6 dir-rtl text-xs">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesAdded(Array.from(e.target.files));
            e.target.value = '';
          }
        }}
      />

      {/* Top Album Switcher Tabs */}
      <div className="p-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveAlbumType('main')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeAlbumType === 'main'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>المعرض الرئيسي بالموقع ({product.images.length})</span>
        </button>

        <button
          onClick={() => setActiveAlbumType('before_cleaning')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeAlbumType === 'before_cleaning'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderPlus className="w-4 h-4 text-amber-400" />
          <span>ألبوم ما قبل التنظيف</span>
        </button>

        <button
          onClick={() => setActiveAlbumType('after_cleaning')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeAlbumType === 'after_cleaning'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderPlus className="w-4 h-4 text-emerald-400" />
          <span>ألبوم ما بعد النظافة والتعقيم</span>
        </button>

        <button
          onClick={() => setActiveAlbumType('before_repair')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeAlbumType === 'before_repair'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderPlus className="w-4 h-4 text-rose-400" />
          <span>ألبوم ما قبل الصيانة</span>
        </button>

        <button
          onClick={() => setActiveAlbumType('after_repair')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeAlbumType === 'after_repair'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderPlus className="w-4 h-4 text-purple-400" />
          <span>ألبوم ما بعد الاصلاح</span>
        </button>

        <div className="mr-auto px-3 py-1.5 rounded-xl bg-slate-950 text-indigo-300 font-bold border border-slate-800 flex items-center gap-1.5 text-[11px]">
          <Film className="w-3.5 h-3.5" />
          <span>تخزين سحابي مباشر على Firebase Storage</span>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesAdded(Array.from(e.dataTransfer.files));
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 border-2 border-dashed rounded-2xl text-center flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
        }`}
      >
        <div className="p-4 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/10">
          <Upload className="w-8 h-8" />
        </div>
        <div>
          <h4 className="font-extrabold text-sm text-white">
            اسحب الصور هنا أو اضغط للرفع المباشر لـ Firebase Storage
          </h4>
          <p className="text-slate-400 text-[11px] mt-1">
            سيتم الضغط التلقائي للصور ورفعها مباشرة إلى المجلد المحمي products/{product.id}/
          </p>
        </div>
      </div>

      {/* Active Uploading Tasks Progress List */}
      {uploadTasks.length > 0 && (
        <div className="p-4 bg-slate-900 border border-blue-500/30 rounded-2xl space-y-3">
          <h4 className="font-bold text-xs text-blue-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>جاري رفع الصور إلى Firebase Storage...</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {uploadTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-3"
              >
                <img
                  src={task.previewUrl}
                  alt={task.filename}
                  className="w-10 h-10 object-cover rounded-lg border border-slate-800"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-slate-200 font-bold truncate text-[11px]">
                      {task.filename}
                    </span>
                    <span
                      className={`font-mono text-[10px] font-black ${
                        task.status === 'completed'
                          ? 'text-emerald-400'
                          : task.status === 'error'
                          ? 'text-rose-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {task.status === 'completed'
                        ? '100%'
                        : task.status === 'error'
                        ? 'خطأ'
                        : `${task.progress}%`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        task.status === 'completed'
                          ? 'bg-emerald-500'
                          : task.status === 'error'
                          ? 'bg-rose-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                {task.status === 'completed' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
                {task.status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Images Grid */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-400" />
            الصور الحالية ({activeImages.length})
          </h3>
          <span className="text-slate-400 text-[11px]">
            * الصورة الأولى تعتبر الغلاف الرئيسي (Thumbnail). يمكنك الترتيب بالأسهم أو اختيار الغلاف
          </span>
        </div>

        {activeImages.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-bold">
            لا توجد صور مضافة في هذا الألبوم بعد.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeImages.map((imgUrl, idx) => {
              const isThumbnail = idx === 0 && activeAlbumType === 'main';
              const isFirebaseStorage = imgUrl.includes('firebasestorage.googleapis.com');

              return (
                <div
                  key={idx}
                  className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-square flex flex-col shadow-lg"
                >
                  <img
                    src={imgUrl}
                    alt={`Image ${idx}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />

                  {/* Thumbnail Star Badge */}
                  {isThumbnail && (
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-lg z-10">
                      <Star className="w-3 h-3 fill-slate-950" />
                      <span>الغلاف الرئيسي</span>
                    </div>
                  )}

                  {/* Firebase Storage Badge */}
                  {isFirebaseStorage && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-emerald-400 text-[9px] font-mono border border-emerald-500/30 z-10">
                      Storage
                    </div>
                  )}

                  {/* Overlay Action Buttons */}
                  <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 z-20">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setLightboxImage(imgUrl)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                        title="تكبير الصورة"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>

                      {activeAlbumType === 'main' && !isThumbnail && (
                        <button
                          onClick={() => handleSetMainThumbnail(imgUrl)}
                          className="p-2 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold cursor-pointer"
                          title="تعيين كغلاف رئيسي"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteImage(idx)}
                        className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-500 cursor-pointer"
                        title="حذف الصورة من Firebase Storage"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Reordering Controls */}
                    {activeAlbumType === 'main' && activeImages.length > 1 && (
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, 'left')}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="تحريك لأعلى/لليمين"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                        <button
                          disabled={idx === activeImages.length - 1}
                          onClick={() => handleMoveImage(idx, 'right')}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="تحريك لأسفل/لليسار"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[70] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-4 -right-4 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


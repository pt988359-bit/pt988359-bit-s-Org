import React, { useState } from 'react';
import { Product } from '../../types';
import { Video, Image as ImageIcon } from 'lucide-react';

interface MediaExperienceProps {
  product: Product;
}

export const MediaExperience: React.FC<MediaExperienceProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<'images' | 'video'>('images');

  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
  ];

  const videos = product.videos && product.videos.length > 0
    ? product.videos
    : product.media?.videos?.map((v) => v.url) || [];

  return (
    <section className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 dir-rtl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">صور وفيديو المعاينة الحقيقية</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              صور وفيديوهات المعاينة للجهاز من أرض المعرض
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'images'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>معرض الصور ({images.length})</span>
          </button>

          {videos.length > 0 && (
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>فيديو المعاينة ({videos.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Body */}
      {activeTab === 'images' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="group relative h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all shadow-lg"
            >
              <img
                src={img}
                alt={`${product.title} ${idx + 1}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-xs font-bold text-white">صورة توضيحية (#{idx + 1})</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'video' && videos.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          {videos.map((vidUrl, idx) => (
            <div key={idx} className="relative aspect-video w-full max-h-[420px] rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 mx-auto flex items-center justify-center">
              <video
                src={vidUrl}
                controls
                poster={images[0]}
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

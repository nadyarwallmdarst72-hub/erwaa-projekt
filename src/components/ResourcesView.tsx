import React, { useState, useMemo } from 'react';
import { ResourceFile, Course, UserAccount, Role } from '../types';
import { formatLongDate, formatDateKey } from '../storage';
import {
  FolderDown,
  FileText,
  Download,
  ExternalLink,
  Search,
  Filter,
  Plus,
  Trash2,
  BookOpen,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  FileCheck,
  FolderOpen,
  Clock,
  User,
  X,
  Upload,
} from 'lucide-react';
import { compressImage } from '../utils/imageOptimizer';

interface ResourcesViewProps {
  resources: ResourceFile[];
  courses: Course[];
  currentUser: UserAccount | null;
  onSaveResource: (res: Omit<ResourceFile, 'id' | 'uploadedAt'>) => void;
  onDeleteResource: (id: string) => void;
  onDownloadResource: (id: string, fileUrl: string) => void;
  onOpenAuthModal: () => void;
}

const CATEGORIES = [
  'الكل',
  'كتب وملازم',
  'ملخصات',
  'نماذج امتحانات',
  'مشاريع وأكواد',
  'عام',
];

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  courses,
  currentUser,
  onSaveResource,
  onDeleteResource,
  onDownloadResource,
  onOpenAuthModal,
}) => {
  const isStaff = currentUser?.role === 'owner' || currentUser?.role === 'teacher';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Resource Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('كتب وملازم');
  const [courseId, setCourseId] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'doc' | 'image' | 'zip' | 'link'>('pdf');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchSearch =
        !searchQuery.trim() ||
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (res.courseTitle && res.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory =
        selectedCategory === 'الكل' || res.category === selectedCategory;

      const matchCourse =
        selectedCourseFilter === 'all' || res.courseId === selectedCourseFilter;

      return matchSearch && matchCategory && matchCourse;
    });
  }, [resources, searchQuery, selectedCategory, selectedCourseFilter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMb} MB`);

      if (file.type.startsWith('image/')) {
        setFileType('image');
        const compressed = await compressImage(file, 1200, 900, 0.78);
        setFileUrl(compressed);
      } else if (file.type.includes('pdf')) {
        setFileType('pdf');
        // If file is reasonably small, convert to data url, otherwise suggest URL
        if (file.size < 600000) {
          const reader = new FileReader();
          reader.onload = () => {
            setFileUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          // Provide placeholder or ask for URL
          setFileUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
        }
      } else if (file.name.endsWith('.zip') || file.name.endsWith('.rar')) {
        setFileType('zip');
      } else {
        setFileType('doc');
      }
    } catch (err) {
      console.error('Error handling file upload:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) return;

    const courseObj = courses.find((c) => c.id === courseId);
    onSaveResource({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      courseId: courseId || undefined,
      courseTitle: courseObj?.title || undefined,
      fileUrl: fileUrl.trim(),
      fileType,
      fileSize: fileSize.trim() || (fileType === 'link' ? 'رابط خارجي' : '1.5 MB'),
      downloadCount: 0,
      uploadedBy: currentUser?.name || 'الإدارة',
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setFileUrl('');
    setFileSize('');
    setIsAddModalOpen(false);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'doc':
        return <FileCheck className="w-5 h-5 text-blue-500" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case 'zip':
        return <FileArchive className="w-5 h-5 text-amber-500" />;
      case 'link':
      default:
        return <ExternalLink className="w-5 h-5 text-purple-500" />;
    }
  };

  const getFileTypeBadge = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'doc':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'image':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'zip':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'link':
      default:
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
  };

  return (
    <div className="grid gap-6 animate-fade-in pb-10">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold mb-2">
              <FolderDown className="w-4 h-4" />
              <span>بنك الملفات والملازم المعتمدة</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-[var(--fg)] m-0">
              المكتبة التعليمية وتحميل الملازم
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] m-0 mt-1 max-w-2xl leading-relaxed">
              تحميل الملازم الدراسية، أوراق العمل، الملخصات الشاملة ونماذج الاختبارات المعتمدة من المعلمين بضغطة زر.
            </p>
          </div>

          {isStaff && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Plus className="w-4 h-4" />
              <span>إضافة ملف / ملزمة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-[var(--muted)] absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ابحث عن اسم الملزمة أو الموضوع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pr-10 pl-3.5 py-2.5 rounded-2xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Course Filter */}
        <div className="md:col-span-4">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-2xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          >
            <option value="all">كافة المقررات والدورات</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Count summary */}
        <div className="md:col-span-3 text-left text-xs text-[var(--muted)] font-semibold flex items-center justify-end gap-1.5">
          <FolderOpen className="w-4 h-4 text-[var(--accent)]" />
          <span>{filteredResources.length} ملف متوفر</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[var(--accent)] text-white shadow-xs font-bold'
                : 'bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--accent-soft)]/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-8">
          <FolderOpen className="w-12 h-12 text-[var(--muted)] mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-[var(--fg)] font-display m-0">لا توجد ملفات تطابق بحثك</h3>
          <p className="text-xs text-[var(--muted)] m-0 mt-1">جرّب اختيار تصنيف آخر أو مسح عبارة البحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-xs flex flex-col justify-between hover:border-[var(--accent)] transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--bg)] border border-[var(--line)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    {getFileIcon(res.fileType)}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getFileTypeBadge(
                        res.fileType
                      )}`}
                    >
                      {res.fileType.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[var(--bg)] text-[var(--muted)] border border-[var(--line)]">
                      {res.category}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-[var(--fg)] font-display mb-1.5 leading-snug">
                  {res.title}
                </h3>

                {res.description && (
                  <p className="text-xs text-[var(--muted)] leading-relaxed m-0 line-clamp-2 mb-3">
                    {res.description}
                  </p>
                )}

                {res.courseTitle && (
                  <div className="text-[11px] text-[var(--accent)] font-semibold flex items-center gap-1.5 mb-2">
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{res.courseTitle}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[var(--line)] mt-2">
                <div className="flex items-center justify-between text-[11px] text-[var(--muted)] mb-3">
                  <span>{res.fileSize || '1.5 MB'}</span>
                  <span>{res.downloadCount || 0} عملية تحميل</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onDownloadResource(res.id, res.fileUrl)}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-transform hover:scale-102"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل أو عرض</span>
                  </button>

                  {isStaff && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف الملف "${res.title}" نهائياً من السحابة؟`)) {
                          onDeleteResource(res.id);
                        }
                      }}
                      className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="حذف الملف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Modal for Staff */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-2xl p-6 grid gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <FolderDown className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-bold text-base font-display text-[var(--fg)] m-0">
                  إضافة ملف أو ملزمة جديدة للمنصة
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--fg)] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="grid gap-3 text-xs">
              <div>
                <label className="block font-bold text-[var(--fg)] mb-1">
                  عنوان الملف / الملزمة *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ملخص شامل لقواعد البرمجة الكائنية..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--fg)] mb-1">
                  الوصف أو نبذة عن المحتوى
                </label>
                <textarea
                  rows={2}
                  placeholder="اكتب نبذة توضيحية للطلاب حول ما يحتويه هذا الملف..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--fg)] mb-1">التصنيف</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] font-semibold"
                  >
                    {CATEGORIES.filter((c) => c !== 'الكل').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--fg)] mb-1">المقرر المرتبط</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] font-semibold"
                  >
                    <option value="">عام لكافة الطلاب</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[var(--fg)] mb-1">نوع الملف</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)] font-semibold"
                  >
                    <option value="pdf">مستند PDF</option>
                    <option value="doc">مستند Word / نص</option>
                    <option value="image">صورة / رسم توضيحي</option>
                    <option value="zip">أرشيف مضغوط ZIP</option>
                    <option value="link">رابط خارجي / Drive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[var(--fg)] mb-1">حجم الملف</label>
                  <input
                    type="text"
                    placeholder="مثال: 2.5 MB"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[var(--fg)] mb-1">
                  رابط الملف المباشر (Google Drive / Direct URL) أو ارفع من جهازك *
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    required
                    placeholder="https://..."
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--fg)]"
                  />
                  <label className="px-3 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] cursor-pointer hover:bg-[var(--accent-soft)] transition-colors flex items-center gap-1">
                    <Upload className="w-4 h-4 text-[var(--accent)]" />
                    <span>رفع</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {isUploading && (
                  <span className="text-[11px] text-[var(--accent)] animate-pulse block mt-1">
                    جارٍ معالجة وضغط الملف...
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--line)] font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !fileUrl.trim()}
                  className="px-5 py-2 rounded-xl font-bold text-white shadow-xs disabled:opacity-40"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  حفظ ونشر في السحابة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

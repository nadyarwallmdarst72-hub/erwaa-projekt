import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Course, Lesson, Quiz, UserAccount } from '../types';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Sparkles,
  Users,
  BookOpen,
  CalendarDays,
  HelpCircle,
} from 'lucide-react';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onImportStudents: (newStudents: Partial<UserAccount>[]) => void;
  onImportCourses: (newCourses: Partial<Course>[]) => void;
  onImportLessons: (newLessons: Partial<Lesson>[]) => void;
  onImportQuizzes: (newQuizzes: Partial<Quiz>[]) => void;
}

type ImportType = 'students' | 'courses' | 'lessons' | 'quizzes';

export const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  isOpen,
  onClose,
  courses,
  onImportStudents,
  onImportCourses,
  onImportLessons,
  onImportQuizzes,
}) => {
  const [importType, setImportType] = useState<ImportType>('students');
  const [fileData, setFileData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const resetState = () => {
    setFileData([]);
    setFileName('');
    setPastedText('');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setSuccessMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (data.length === 0) {
          setErrorMsg('الملف المرفوع فارغ أو لا يحتوي على صفوف بيانات.');
          return;
        }
        setFileData(data);
      } catch (err: any) {
        setErrorMsg('تعذر قراءة ملف الإكسل: ' + (err?.message || 'تأكد من صيغة الملف'));
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleParsePastedText = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!pastedText.trim()) {
      setErrorMsg('الرجاء لصق البيانات أولاً من جداول Google Sheets أو Excel.');
      return;
    }

    try {
      // Split lines and tabs
      const lines = pastedText.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setErrorMsg('يجب أن تحتوي البيانات على صف عناوين أعمدة وصف واحد على الأقل من البيانات.');
        return;
      }

      // Check delimiter (tab or comma)
      const delimiter = lines[0].includes('\t') ? '\t' : ',';
      const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));

      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length === 0 || (parts.length === 1 && !parts[0])) continue;

        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = parts[idx] !== undefined ? parts[idx] : '';
        });
        rows.push(rowObj);
      }

      if (rows.length === 0) {
        setErrorMsg('لم يتم العثور على أي صفوف صالحة.');
        return;
      }

      setFileData(rows);
      setFileName('بيانات ملصوقة من جداول البيانات');
    } catch (err: any) {
      setErrorMsg('خطأ في معالجة النص الملصوق: ' + err.message);
    }
  };

  const handleDownloadSample = () => {
    let headers: string[] = [];
    let sampleRows: any[] = [];
    let filename = '';

    if (importType === 'students') {
      headers = ['الاسم', 'البريد الإلكتروني', 'رقم الهاتف', 'الدور'];
      sampleRows = [
        ['عبد الله أحمد السالم', 'abdullah@example.com', '0501234567', 'student'],
        ['سارة خالد العمري', 'sara.k@example.com', '0559876543', 'student'],
      ];
      filename = 'نموذج_استيراد_الطلاب.xlsx';
    } else if (importType === 'courses') {
      headers = ['عنوان المقرر', 'الوصف', 'اسم المعلم', 'نوع المقرر'];
      sampleRows = [
        ['تطوير تطبيقات الويب مع React', 'دورة شاملة لبناء الواجهات', 'م. أحمد الشمري', 'دورة تدريبية'],
        ['هياكل البيانات والخوارزميات', 'مادة أكاديمية في تحليل النظم', 'أ. سارة القحطاني', 'مادة دراسية'],
      ];
      filename = 'نموذج_استيراد_المقررات.xlsx';
    } else if (importType === 'lessons') {
      headers = ['عنوان المحاضرة', 'الدورة', 'التاريخ', 'رابط الفيديو', 'التمارين'];
      sampleRows = [
        ['محاضرة 1: مقدمة في بنية المكونات', 'تطوير تطبيقات الويب مع React', '2026-10-25', 'https://www.youtube.com/watch?v=SqcY0GlETPk', 'تمرين 1: إنشاء بطاقة مستخدم|تمرين 2: تفكيك واجهة'],
        ['محاضرة 2: إدارة الحالة مع useState', 'تطوير تطبيقات الويب مع React', '2026-10-27', 'https://www.youtube.com/watch?v=4ORZ1GmjaMc', 'تمرين عملي: بناء عداد تفاعلي'],
      ];
      filename = 'نموذج_استيراد_المحاضرات.xlsx';
    } else if (importType === 'quizzes') {
      headers = ['عنوان الاختبار', 'المقرر', 'السؤال', 'الخيار 1', 'الخيار 2', 'الخيار 3', 'الخيار 4', 'رقم الإجابة الصحيحة'];
      sampleRows = [
        ['اختبار الأساسيات', 'تطوير تطبيقات الويب مع React', 'ما هو الخطاف المخصص للحالة المحلية؟', 'useState', 'useEffect', 'useMemo', 'useRef', '0'],
      ];
      filename = 'نموذج_استيراد_الاختبارات.xlsx';
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample');
    XLSX.writeFile(wb, filename);
  };

  const handleExecuteImport = () => {
    if (fileData.length === 0) return;

    try {
      if (importType === 'students') {
        const mapped = fileData.map((row: any) => {
          const name = row['الاسم'] || row['اسم الطالب'] || row['name'] || row['Name'] || '';
          const email = row['البريد الإلكتروني'] || row['الايميل'] || row['email'] || row['Email'] || '';
          const phone = row['رقم الهاتف'] || row['الهاتف'] || row['phone'] || row['Phone'] || '';
          const role = (row['الدور'] || row['role'] || 'student').toLowerCase().includes('teach') ? 'teacher' : 'student';

          return {
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            phone: String(phone).trim(),
            role: role as any,
          };
        }).filter((s) => s.email && s.name);

        if (mapped.length === 0) {
          setErrorMsg('لم يتم العثور على أعمدة صالحة (الاسم والبريد الإلكتروني إلزاميان).');
          return;
        }

        onImportStudents(mapped);
        setSuccessMsg(`تم استيراد ${mapped.length} طالب/مستخدم ومزامنتهم سحابياً بنجاح!`);
      } else if (importType === 'courses') {
        const mapped = fileData.map((row: any) => {
          const title = row['عنوان المقرر'] || row['اسم المقرر'] || row['المقرر'] || row['title'] || '';
          const desc = row['الوصف'] || row['desc'] || row['description'] || '';
          const teacher = row['اسم المعلم'] || row['المعلم'] || row['teacher'] || '';
          const typeStr = (row['نوع المقرر'] || row['النوع'] || row['type'] || '').toString();
          const type = typeStr.includes('مادة') || typeStr.includes('subject') ? 'subject' : 'course';

          return {
            title: String(title).trim(),
            desc: String(desc).trim(),
            teacher: String(teacher).trim(),
            type: type as any,
          };
        }).filter((c) => c.title);

        if (mapped.length === 0) {
          setErrorMsg('لم يتم العثور على عمود عنوان المقرر.');
          return;
        }

        onImportCourses(mapped);
        setSuccessMsg(`تم استيراد ${mapped.length} مقرر تعليمي وحفظها سحابياً بنجاح!`);
      } else if (importType === 'lessons') {
        const mapped = fileData.map((row: any) => {
          const title = row['عنوان المحاضرة'] || row['عنوان الدرس'] || row['الدرس'] || row['title'] || '';
          const courseNameOrId = row['الدورة'] || row['المقرر'] || row['courseId'] || row['course'] || '';
          const date = row['التاريخ'] || row['تاريخ الدرس'] || row['date'] || new Date().toISOString().split('T')[0];
          const url = row['رابط الفيديو'] || row['الرابط'] || row['url'] || '';
          const rawExercises = row['التمارين'] || row['تمارين'] || row['exercises'] || '';

          // Match courseId by title if needed
          let resolvedCourseId = courses[0]?.id || 'course_web';
          if (courseNameOrId) {
            const foundCourse = courses.find(
              (c) => c.title.toLowerCase().includes(courseNameOrId.toLowerCase()) || c.id === courseNameOrId
            );
            if (foundCourse) resolvedCourseId = foundCourse.id;
          }

          // Parse exercises separated by |
          const exercisesList = rawExercises
            ? rawExercises.split('|').map((exStr: string, idx: number) => ({
                id: `ex_${Date.now()}_${idx}`,
                title: exStr.trim(),
                description: 'تمرين تطبيقي مستورد للمحاضرة.',
                solutionHint: 'راجع تفاصيل المحاضرة وشرح المدرس للحل.',
              }))
            : [];

          return {
            title: String(title).trim(),
            courseId: resolvedCourseId,
            date: String(date).trim(),
            url: String(url).trim(),
            exercises: exercisesList,
          };
        }).filter((l) => l.title);

        if (mapped.length === 0) {
          setErrorMsg('لم يتم العثور على عمود عنوان المحاضرة.');
          return;
        }

        onImportLessons(mapped);
        setSuccessMsg(`تم استيراد ${mapped.length} محاضرة مع تمارينها ومزامنتها سحابياً بنجاح!`);
      } else if (importType === 'quizzes') {
        const mapped = fileData.map((row: any) => {
          const title = row['عنوان الاختبار'] || row['الاختبار'] || row['quiz'] || 'اختبار تقييمي';
          const courseNameOrId = row['المقرر'] || row['الدورة'] || row['course'] || '';
          const qText = row['السؤال'] || row['نص السؤال'] || row['question'] || '';
          const opt0 = row['الخيار 1'] || row['opt0'] || 'أ';
          const opt1 = row['الخيار 2'] || row['opt1'] || 'ب';
          const opt2 = row['الخيار 3'] || row['opt2'] || 'ج';
          const opt3 = row['الخيار 4'] || row['opt3'] || 'د';
          const ans = Number(row['رقم الإجابة الصحيحة'] || row['ans'] || 0);

          let resolvedCourseId = courses[0]?.id || 'course_web';
          if (courseNameOrId) {
            const foundCourse = courses.find(
              (c) => c.title.toLowerCase().includes(courseNameOrId.toLowerCase()) || c.id === courseNameOrId
            );
            if (foundCourse) resolvedCourseId = foundCourse.id;
          }

          return {
            title: String(title).trim(),
            courseId: resolvedCourseId,
            questions: [
              {
                q: String(qText).trim(),
                options: [opt0, opt1, opt2, opt3],
                answer: isNaN(ans) ? 0 : ans,
              },
            ],
          };
        }).filter((q) => q.questions[0].q);

        if (mapped.length === 0) {
          setErrorMsg('لم يتم العثور على أسئلة صالحة للاستيراد.');
          return;
        }

        onImportQuizzes(mapped);
        setSuccessMsg(`تم استيراد الاختبارات والأسئلة بنجاح!`);
      }

      setTimeout(() => {
        handleClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg('حدث خطأ أثناء معالجة البيانات: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={handleClose} />

      {/* Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-3xl bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-5 sm:p-6 shadow-2xl animate-slide-up grid gap-4 max-h-[90dvh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-display text-[var(--fg)] m-0">
                استيراد البيانات من Excel و Google Sheets
              </h3>
              <p className="text-xs text-[var(--muted)] m-0 mt-0.5">
                استورد قوائم الطلاب، المقررات، المحاضرات، والتمارين مباشرةً مع حفظ فوري في السحابة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category selector */}
        <div>
          <label className="block text-xs font-bold text-[var(--muted)] mb-1.5">
            اختر نوع البيانات التي ترغب في استيرادها:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'students' as ImportType, label: 'الطلاب والمستخدمون', icon: <Users className="w-4 h-4" /> },
              { key: 'courses' as ImportType, label: 'المقررات والمواد', icon: <BookOpen className="w-4 h-4" /> },
              { key: 'lessons' as ImportType, label: 'المحاضرات والتمارين', icon: <CalendarDays className="w-4 h-4" /> },
              { key: 'quizzes' as ImportType, label: 'الاختبارات والأسئلة', icon: <HelpCircle className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setImportType(tab.key);
                  setFileData([]);
                  setSuccessMsg('');
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  importType === tab.key
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs'
                    : 'bg-[var(--bg)] border-[var(--line)] text-[var(--muted)] hover:text-[var(--fg)]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Method Switch */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 bg-[var(--bg)] p-1 rounded-xl border border-[var(--line)]">
            <button
              type="button"
              onClick={() => setInputMode('file')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                inputMode === 'file'
                  ? 'bg-[var(--surface)] text-[var(--fg)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--fg)]'
              }`}
            >
              رفع ملف (.xlsx, .csv)
            </button>
            <button
              type="button"
              onClick={() => setInputMode('paste')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                inputMode === 'paste'
                  ? 'bg-[var(--surface)] text-[var(--fg)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--fg)]'
              }`}
            >
              نسخ ولصق من Google Sheets
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تحميل نموذج إكسل تجريبي</span>
          </button>
        </div>

        {/* File upload area */}
        {inputMode === 'file' ? (
          <div className="border-2 border-dashed border-[var(--line)] hover:border-[var(--accent)] rounded-2xl p-6 text-center bg-[var(--bg)]/40 transition-colors">
            <input
              type="file"
              id="excel-file-input"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="excel-file-input"
              className="flex flex-col items-center justify-center gap-2 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm text-[var(--fg)]">
                {fileName ? fileName : 'اضغط لاختيار ملف إكسل أو اسحبه هنا'}
              </span>
              <span className="text-xs text-[var(--muted)]">
                يدعم صيغ .xlsx و .xls و .csv من Microsoft Excel أو جداول Google
              </span>
            </label>
          </div>
        ) : (
          <div className="grid gap-2">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="انسخ الخلايا من جدول Google Sheets أو Excel والصقها هنا مباشرةً..."
              rows={4}
              className="w-full p-3 rounded-2xl border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--fg)] font-mono"
            />
            <button
              type="button"
              onClick={handleParsePastedText}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs self-start"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              تحليل البيانات الملصوقة
            </button>
          </div>
        )}

        {/* Error / Success alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Preview Table */}
        {fileData.length > 0 && (
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden grid gap-2 p-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[var(--fg)] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                معاينة الصفوف المكتشفة ({fileData.length} صفوف)
              </span>
              <span className="text-[11px] text-[var(--muted)]">
                سيتم استيرادها وحفظها في قاعدة البيانات السحابية
              </span>
            </div>

            <div className="overflow-x-auto max-h-[160px] border border-[var(--line)] rounded-xl">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-[var(--accent-soft)]/20 border-b border-[var(--line)] text-[var(--muted)] font-bold">
                    {Object.keys(fileData[0]).map((headerKey) => (
                      <th key={headerKey} className="p-2 whitespace-nowrap">
                        {headerKey}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {fileData.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-[var(--accent-soft)]/10">
                      {Object.values(row).map((val: any, vIdx) => (
                        <td key={vIdx} className="p-2 whitespace-nowrap text-[11px]">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {fileData.length > 5 && (
              <span className="text-[10px] text-[var(--muted)] text-center block">
                يظهر أول 5 صفوف من أصل {fileData.length} صفاً
              </span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--fg)]"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={fileData.length === 0}
            onClick={handleExecuteImport}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <Sparkles className="w-4 h-4" />
            <span>تأكيد الاستيراد ومزامنة السحابة ({fileData.length} عنصر)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

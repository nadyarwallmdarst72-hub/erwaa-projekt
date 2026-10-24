import { SiteSettings, CertLayout, Course, Certificate } from '../types';
import { AR_LOCALE, formatShortDate } from '../storage';

export const CERT_ELEMENTS: [keyof CertLayout, string][] = [
  ['brand', 'اسم الموقع / المؤسسة'],
  ['title', 'عنوان الشهادة'],
  ['pre', 'سطر التقديم والتمهيد'],
  ['name', 'اسم الطالب المكرم'],
  ['body', 'نص وعبارة التقدير'],
  ['date', 'تاريخ الإصدار'],
  ['serial', 'الرقم التسلسلي للشهادة'],
  ['signer', 'اسم وصفة الموقّع'],
];

const HEAD_ELEMENTS: Record<string, boolean> = {
  brand: true,
  title: true,
  name: true,
  signer: true,
};

export interface CertBoundingBox {
  k: keyof CertLayout;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  cx: number;
  cy: number;
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const imageCache: Record<string, HTMLImageElement> = {};

export function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  if (imageCache[src]) return Promise.resolve(imageCache[src]);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function getCertTexts(
  site: SiteSettings,
  course?: Course | null,
  cert?: Certificate | null,
  studentName?: string,
  isSample = false
) {
  const cTitle = course?.title || (isSample ? 'تطوير تطبيقات الويب الحديثة' : '');
  const nm = studentName || (isSample ? 'نادية الرويلي' : 'طالب المنصة');
  const issueDate = cert?.issuedAt
    ? formatShortDate(cert.issuedAt)
    : formatShortDate(Date.now());
  const serialNo = cert?.serial || (isSample ? 'E-84920' : 'E-00000');

  const replacePlaceholders = (text: string) => {
    return (text || '')
      .replace(/\{course\}/g, cTitle)
      .replace(/\{name\}/g, nm)
      .replace(/\{date\}/g, issueDate)
      .replace(/\{site\}/g, site.name);
  };

  return {
    brand: site.name,
    title: site.cert.title,
    pre: replacePlaceholders(site.cert.pre),
    name: nm,
    body: replacePlaceholders(site.cert.body),
    date: `التاريخ: ${issueDate}`,
    serial: `رقم الشهادة: ${serialNo}`,
    signer: site.cert.signer,
    role: site.cert.role,
  };
}

export async function drawCertificate(
  canvas: HTMLCanvasElement,
  site: SiteSettings,
  bgImageSrc: string,
  texts: ReturnType<typeof getCertTexts>,
  highlightElementKey: keyof CertLayout | null = null
): Promise<CertBoundingBox[]> {
  const layout = site.cert.layout;

  try {
    if (document.fonts) {
      await Promise.all([
        document.fonts.load(`700 40px "${site.fontHead}"`),
        document.fonts.load(`400 30px "${site.fontBody}"`),
      ]);
    }
  } catch (e) {
    // Fonts fallback
  }

  const bgImg = await loadImage(bgImageSrc);
  const W = 1600;
  const H = bgImg
    ? Math.max(500, Math.round((W * bgImg.naturalHeight) / bgImg.naturalWidth))
    : 1130;

  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const fontHead = `"${site.fontHead}", system-ui, sans-serif`;
  const fontBody = `"${site.fontBody}", system-ui, sans-serif`;
  const boxes: CertBoundingBox[] = [];

  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, W, H);
  } else {
    // Premium ornate certificate border
    const accent = site.accent || '#1B8576';
    ctx.fillStyle = '#FAFCFB';
    ctx.fillRect(30, 30, W - 60, H - 60);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 14;
    ctx.strokeRect(36, 36, W - 72, H - 72);

    ctx.strokeStyle = '#D6E4E1';
    ctx.lineWidth = 2;
    ctx.strokeRect(58, 58, W - 116, H - 116);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(66, 66, W - 132, H - 132);

    // Decorative corner markers
    const corners = [
      [76, 76],
      [W - 76, 76],
      [76, H - 76],
      [W - 76, H - 76],
    ];
    corners.forEach(([cx, cy]) => {
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Draw Elements
  CERT_ELEMENTS.forEach(([key]) => {
    const elemConfig = layout[key];
    if (!elemConfig || !elemConfig.on) return;

    const rawText = texts[key as keyof typeof texts];
    if (!rawText) return;

    const isHead = !!HEAD_ELEMENTS[key];
    const size = Math.max(12, elemConfig.size || 40);
    const color =
      elemConfig.color ||
      (key === 'brand' || key === 'name' ? site.accent : '#16302C');

    ctx.font = `${isHead ? '700 ' : '400 '}${size}px ${isHead ? fontHead : fontBody}`;
    ctx.fillStyle = color;

    const cx = (W * (elemConfig.x ?? 50)) / 100;
    const cy = (H * (elemConfig.y ?? 50)) / 100;

    let lines = [rawText];
    if (key === 'body' || key === 'pre') {
      lines = wrapText(ctx, rawText, W * 0.72);
    }

    const lineHeight = size * 1.45;
    const n = lines.length;
    let maxLineWidth = 0;

    lines.forEach((line, i) => {
      const lineY = cy + (i - (n - 1) / 2) * lineHeight;
      ctx.fillText(line, cx, lineY);
      maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line).width);
    });

    let totalBoxHeight = n * lineHeight;

    // Elegant underline for student name when no background image
    if (key === 'name' && !bgImg) {
      ctx.fillStyle = site.accent;
      ctx.fillRect(cx - 360, cy + size * 0.75, 720, 3);
    }

    // Signer title/role below name
    if (key === 'signer' && texts.role) {
      const roleSize = Math.round(size * 0.72);
      ctx.font = `400 ${roleSize}px ${fontBody}`;
      ctx.fillStyle = '#68807B';
      const roleY = cy + size * 1.1;
      ctx.fillText(texts.role, cx, roleY);
      maxLineWidth = Math.max(maxLineWidth, ctx.measureText(texts.role).width);
      totalBoxHeight += roleSize * 1.2;
    }

    boxes.push({
      k: key,
      x0: cx - maxLineWidth / 2 - 16,
      y0: cy - lineHeight / 2 - 8,
      x1: cx + maxLineWidth / 2 + 16,
      y1: cy - lineHeight / 2 + totalBoxHeight + 8,
      cx,
      cy,
    });
  });

  // Highlight selected element for editing
  if (highlightElementKey) {
    const box = boxes.find((b) => b.k === highlightElementKey);
    if (box) {
      ctx.save();
      ctx.setLineDash([10, 8]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = site.accent || '#1B8576';
      ctx.strokeRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0);
      ctx.restore();
    }
  }

  return boxes;
}

export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }, 'image/png');
}

import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  Boxes,
  ClipboardList,
  Coins,
  Copy,
  Layers,
  Printer,
  RotateCcw,
  Shield,
  Smartphone,
  Spline,
  Table2,
  Timer,
  Warehouse,
  X,
} from "lucide-react";
import { useFlex, type SectionId } from "@/lib/flex/store";
import {
  CoverPanel,
  CostPanel,
  InsulatedPanel,
  JointPanel,
  PrintReport,
  TablesPanel,
  summaryText,
  usePack,
} from "@/components/flex/panels";
import { TimePanel } from "@/components/flex/time-panel";
import { BomPanel } from "@/components/flex/bom-panel";
import { StockPanel } from "@/components/flex/stock-panel";

const SECTIONS: { id: SectionId; label: string; hint: string; icon: typeof Spline }[] = [
  { id: "joint", label: "الوصلة", hint: "سلك وخامة وغراء", icon: Spline },
  { id: "cover", label: "الغطاء", hint: "لف بدون سلك", icon: Shield },
  { id: "insulated", label: "العزل", hint: "صوف وغطاء", icon: Layers },
  { id: "time", label: "زمن التصنيع", hint: "ماتور وانفرتر", icon: Timer },
  { id: "bom", label: "قائمة المواد", hint: "قطعة وطلب وكرتونة", icon: ClipboardList },
  { id: "cost", label: "التكاليف", hint: "وصلة أو غطاء أو عزل", icon: Coins },
  { id: "stock", label: "رصيد الخامات", hint: "مخزن ومرتجع وتغطية", icon: Warehouse },
  { id: "tables", label: "الجداول", hint: "Sch 40 وأسعار الكراتين", icon: Table2 },
];

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

export function Workspace() {
  const section = useFlex((state) => state.section);
  const setSection = useFlex((state) => state.setSection);
  const installDismissed = useFlex((state) => state.installDismissed);
  const dismissInstall = useFlex((state) => state.dismissInstall);
  const precision = useFlex((state) => state.precision);
  const setPrecision = useFlex((state) => state.setPrecision);
  const resetRecipe = useFlex((state) => state.resetRecipe);
  const pack = usePack();
  const [menu, setMenu] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [quotesOpen, setQuotesOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareText, setShareText] = useState<string | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    void useFlex.persist.rehydrate();
    setStandalone(isStandalone());
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setStandalone(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const current = SECTIONS.find((item) => item.id === section);

  return (
    <div className="min-h-screen">
      <header className="no-print bg-steel text-steel-ink">
        <div className="mx-auto flex w-full min-w-0 items-center gap-3 px-3 py-3">
          <img src="/favicon.svg" alt="" className="size-11 rounded-lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-steel-ink/70">خط الفليكسيبل</p>
            <h1 className="truncate text-lg font-semibold leading-tight">{current?.label ?? "قوائم الخط"}</h1>
          </div>
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-copper px-3 text-sm font-semibold text-copper-ink"
            onClick={() => setInstallOpen(true)}
          >
            <Smartphone className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">تثبيت</span>
          </button>
          <div className="relative">
            <button
              type="button"
              className="inline-flex h-11 items-center rounded-lg bg-steel-ink/10 px-3 text-sm font-medium text-steel-ink"
              aria-expanded={menu}
              onClick={() => setMenu((open) => !open)}
            >
              المزيد
            </button>
            {menu ? <button type="button" className="fixed inset-0 z-30 cursor-default" aria-label="إغلاق القائمة" onClick={() => setMenu(false)} /> : null}
            {menu ? (
              <div className="absolute end-0 z-40 mt-2 w-56 rounded-xl bg-card p-1 text-ink shadow-card">
                <MenuButton
                  icon={Printer}
                  label="طباعة البيان"
                  onClick={() => {
                    setMenu(false);
                    window.print();
                  }}
                />
                <MenuButton
                  icon={Copy}
                  label={copied ? "تم النسخ" : "نسخ الملخص"}
                  onClick={() => {
                    setMenu(false);
                    const text = summaryText(pack, pack.state.currency || "جنيه");
                    void navigator.clipboard.writeText(text).then(
                      () => {
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 1600);
                      },
                      () => setShareText(text),
                    );
                  }}
                />
                <MenuButton
                  icon={Bookmark}
                  label="الحسبات المحفوظة"
                  onClick={() => {
                    setMenu(false);
                    setQuotesOpen(true);
                  }}
                />
                <MenuButton
                  icon={RotateCcw}
                  label="استعادة مثال الإكسيل"
                  onClick={() => {
                    setMenu(false);
                    resetRecipe();
                  }}
                />
                <button type="button" className="flex h-11 w-full items-center rounded-lg px-3 text-start text-sm" onClick={() => setPrecision(!precision)}>
                  {precision ? "إخفاء الأرقام المفصّلة" : "أرقام مفصّلة مثل الإكسيل"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div className="no-print sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex w-full min-w-0 items-center gap-2 px-3 py-2">
          {section ? (
            <button type="button" className="inline-flex h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-medium text-ink" onClick={() => setSection(null)}>
              <ArrowRight className="size-4" aria-hidden="true" />
              القوائم
            </button>
          ) : (
            <Link to="/" className="inline-flex h-11 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-medium text-ink">
              <ArrowRight className="size-4" aria-hidden="true" />
              الخطوط
            </Link>
          )}
          <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto" aria-label="أقسام الخط">
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium ${
                  section === item.id ? "bg-card text-copper shadow-card" : "text-muted"
                }`}
                onClick={() => setSection(item.id)}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="mx-auto grid w-full min-w-0 gap-3 px-3 py-3 pb-8">
        {!installDismissed && !standalone ? (
          <div className="no-print flex items-center gap-3 rounded-2xl bg-steel px-3 py-3 text-steel-ink shadow-card">
            <Smartphone className="size-5 shrink-0" aria-hidden="true" />
            <p className="min-w-0 flex-1 text-sm">يثبَّت على أندرويد من Chrome ويُفتح من الشاشة الرئيسية. ملف APK غير متاح من هنا.</p>
            <button type="button" className="h-11 shrink-0 rounded-lg bg-copper px-3 text-sm font-semibold text-copper-ink" onClick={() => setInstallOpen(true)}>
              طريقة التثبيت
            </button>
            <button type="button" className="inline-flex size-11 items-center justify-center" aria-label="إخفاء" onClick={dismissInstall}>
              <X className="size-4" />
            </button>
          </div>
        ) : null}
        {section == null ? <SectionMenu onOpen={setSection} /> : null}
        {section === "joint" ? <JointPanel /> : null}
        {section === "cover" ? <CoverPanel /> : null}
        {section === "insulated" ? <InsulatedPanel /> : null}
        {section === "time" ? <TimePanel /> : null}
        {section === "bom" ? <BomPanel /> : null}
        {section === "cost" ? <CostPanel /> : null}
        {section === "stock" ? <StockPanel /> : null}
        {section === "tables" ? <TablesPanel /> : null}
      </main>

      <PrintReport />
      {installOpen ? (
        <InstallDialog
          standalone={standalone}
          canPrompt={deferred != null}
          onClose={() => setInstallOpen(false)}
          onInstall={() => {
            void deferred?.prompt().then(() => setDeferred(null));
          }}
        />
      ) : null}
      {quotesOpen ? <QuotesDialog onClose={() => setQuotesOpen(false)} /> : null}
      {shareText ? (
        <Overlay title="انسخ الملخص" onClose={() => setShareText(null)}>
          <textarea className="h-48 w-full rounded-lg border border-line bg-paper p-3 font-mono text-xs text-ink" dir="ltr" readOnly value={shareText} />
        </Overlay>
      ) : null}
    </div>
  );
}

function SectionMenu({ onOpen }: { onOpen: (id: SectionId) => void }) {
  return (
    <div className="grid w-full gap-3">
      <div className="sm:col-span-2">
        <p className="text-sm text-muted">اختَر القائمة. الخطوط الأخرى هتتضاف جنب خط الفليكسيبل من غير ما تختلط الحسابات.</p>
      </div>
      {SECTIONS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            className="flex items-center gap-3 rounded-2xl bg-card p-4 text-start shadow-card"
            onClick={() => onOpen(item.id)}
          >
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-paper text-copper">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold text-ink">{item.label}</span>
              <span className="block text-xs text-muted">{item.hint}</span>
            </span>
          </button>
        );
      })}
      <p className="flex items-center gap-2 text-xs text-muted sm:col-span-2">
        <Boxes className="size-4" aria-hidden="true" />
        المواصفات محفوظة على هذا الجهاز.
      </p>
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick }: { icon: typeof Copy; label: string; onClick: () => void }) {
  return (
    <button type="button" className="flex h-11 w-full items-center gap-2 rounded-lg px-3 text-start text-sm" onClick={onClick}>
      <Icon className="size-4 text-muted" aria-hidden="true" />
      {label}
    </button>
  );
}

function InstallDialog({
  standalone,
  canPrompt,
  onClose,
  onInstall,
}: {
  standalone: boolean;
  canPrompt: boolean;
  onClose: () => void;
  onInstall: () => void;
}) {
  return (
    <Overlay title="التثبيت على الموبايل" onClose={onClose}>
      {standalone ? (
        <p className="text-sm text-ink">البرنامج مفتوح كتطبيق من الشاشة الرئيسية.</p>
      ) : (
        <>
          <p className="text-sm text-ink">
            لو Chrome قال «لا يمكن تثبيت هذا التطبيق»، متستخدمش زر تثبيت التطبيق. ضيفه على الشاشة الرئيسية بالطريقة دي.
          </p>
          <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm text-ink">
            <li>انشر البرنامج، وبعدين افتح رابطه في تطبيق Chrome نفسه على الموبايل، مش من جوه جروك.</li>
            <li>اضغط الثلاث نقاط فوق يمين Chrome.</li>
            <li>اختار «إضافة إلى الشاشة الرئيسية»، وبعدين «إضافة». متختارش «تثبيت التطبيق» لو ظهرت لك الرسالة.</li>
            <li>الأيقونة «فليكسيبل» تظهر على الشاشة وتفتح البرنامج كامل.</li>
          </ol>
          {canPrompt ? (
            <button type="button" className="mt-4 h-11 w-full rounded-lg bg-copper text-sm font-semibold text-copper-ink" onClick={onInstall}>
              تثبيت التطبيق
            </button>
          ) : (
            <p className="mt-4 rounded-xl bg-paper px-3 py-2 text-xs text-muted">زر التثبيت المباشر يظهر عندما يسمح المتصفح.</p>
          )}
        </>
      )}
    </Overlay>
  );
}

function QuotesDialog({ onClose }: { onClose: () => void }) {
  const quotes = useFlex((state) => state.quotes);
  const saveQuote = useFlex((state) => state.saveQuote);
  const loadQuote = useFlex((state) => state.loadQuote);
  const deleteQuote = useFlex((state) => state.deleteQuote);
  const [name, setName] = useState("");
  return (
    <Overlay title="الحسبات المحفوظة" onClose={onClose}>
      <p className="text-sm text-muted">تتحفظ على هذا الجهاز فقط، من غير رصيد المخزن.</p>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          saveQuote(name);
          setName("");
        }}
      >
        <input
          className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-card px-3 text-sm text-ink outline-none focus:border-copper"
          placeholder="اسم الحسبة"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button type="submit" className="h-11 shrink-0 rounded-lg bg-copper px-3 text-sm font-semibold text-copper-ink">
          حفظ الحالية
        </button>
      </form>
      <ul className="mt-3 grid gap-2">
        {quotes.length === 0 ? <li className="text-sm text-muted">لا توجد حسبات محفوظة بعد.</li> : null}
        {quotes.map((quote) => (
          <li key={quote.id} className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{quote.name}</p>
              <p className="text-xs text-muted">
                {new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short", numberingSystem: "latn" }).format(new Date(quote.savedAt))}
              </p>
            </div>
            <button
              type="button"
              className="h-10 rounded-lg bg-card px-3 text-sm font-medium text-ink shadow-card"
              onClick={() => {
                loadQuote(quote.id);
                onClose();
              }}
            >
              فتح
            </button>
            <button type="button" className="h-10 px-2 text-sm text-warn" onClick={() => deleteQuote(quote.id)}>
              حذف
            </button>
          </li>
        ))}
      </ul>
    </Overlay>
  );
}

function Overlay({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="no-print fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-3 md:items-center" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card p-4 shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          <button type="button" className="inline-flex size-11 items-center justify-center rounded-lg" aria-label="إغلاق" onClick={onClose}>
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

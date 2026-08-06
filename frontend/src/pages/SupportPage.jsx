import { useState } from "react";
import {
  TrendingDown,
  CheckCircle2,
  ShieldAlert,
  ChevronDown,
  Mail,
} from "lucide-react";
import { SAMPLE_NOTIFICATIONS, FAQS } from "../data/sampleData";

const TYPE_ICON = {
  price: TrendingDown,
  booking: CheckCircle2,
  security: ShieldAlert,
};
const TYPE_COLOR = {
  price: "#34E0A1",
  booking: "#4F9DFF",
  security: "#FF6FA5",
};

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-ink">
        Notification &amp; Support Centre
      </h1>
      <p className="text-mist text-sm mt-1.5 mb-7">
        Everything that needs your attention, and everything you might ask.
      </p>

      <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
        <section className="bg-surface border border-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-ink font-semibold text-sm mb-4">
            Recent notifications
          </h3>
          <div className="flex flex-col">
            {SAMPLE_NOTIFICATIONS.map((n) => {
              const Icon = TYPE_ICON[n.type];
              return (
                <div
                  key={n.id}
                  className="flex items-start gap-3 py-3 border-b border-line last:border-0"
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ background: TYPE_COLOR[n.type] }}
                  >
                    <Icon size={15} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink text-sm">
                      {n.title}
                    </div>
                    <div className="text-xs text-mist mt-0.5 leading-relaxed">
                      {n.body}
                    </div>
                  </div>
                  <span className="text-[0.7rem] text-mist-soft whitespace-nowrap">
                    {n.time}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-surface border border-line rounded-2xl p-6 shadow-sm">
          <h3 className="text-ink font-semibold text-sm mb-4">
            Frequently asked
          </h3>
          <div className="flex flex-col">
            {FAQS.map((f, i) => (
              <div key={i} className="border-b border-line last:border-0">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-3.5 text-left text-sm font-medium text-ink"
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-mist-soft shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <p className="text-mist text-sm leading-relaxed pb-4">
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-line text-mist text-sm">
            <Mail size={16} />
            <span>
              Still stuck?{" "}
              <a href="mailto:support@tripspot.app" className="text-violet">
                support@tripspot.app
              </a>
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

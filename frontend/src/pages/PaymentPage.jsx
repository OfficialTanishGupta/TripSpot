import { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "../components/ui/button";
import api from "../api/client";

const GST_RATE = 0.18;
const CONVENIENCE_FEE = 49;
const PROMO_CODES = { SAVE10: 0.1, FIRST50: 50 };

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    option,
    party,
    travelDate,
    cheapestAvailablePrice,
    contact,
    passengers,
  } = state || {};

  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [status, setStatus] = useState("idle"); // idle | processing | success | failed
  const [error, setError] = useState("");

  const totalPassengers = (party?.adults || 1) + (party?.children || 0);

  const { baseFare, gst, discount, total } = useMemo(() => {
    const base = (option?.price || 0) * totalPassengers;
    const gstAmt = Math.round(base * GST_RATE);
    let disc = 0;
    if (appliedPromo === "SAVE10") disc = Math.round(base * 0.1);
    if (appliedPromo === "FIRST50") disc = 50;
    const tot = Math.max(0, base + gstAmt + CONVENIENCE_FEE - disc);
    return { baseFare: base, gst: gstAmt, discount: disc, total: tot };
  }, [option, totalPassengers, appliedPromo]);

  if (!option) {
    return (
      <div className="max-w-md mx-auto text-center py-20 text-mist">
        No booking in progress.
        <div className="mt-4">
          <Button onClick={() => navigate("/dashboard")}>Back to search</Button>
        </div>
      </div>
    );
  }

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code");
    }
  };

  const createBooking = async (finalStatus) => {
    try {
      await api.post("/api/bookings", {
        mode: option.mode,
        providerName: option.providerName,
        origin: option.origin,
        destination: option.destination,
        departureTime: option.departureTime,
        price: total,
        adults: party?.adults ?? 1,
        children: party?.children ?? 0,
        isWeekend: travelDate
          ? [0, 6].includes(new Date(travelDate).getDay())
          : false,
        advanceDays: travelDate
          ? Math.max(
              0,
              Math.round((new Date(travelDate) - new Date()) / 86400000),
            )
          : 0,
        cheapestAvailablePrice,
        status: finalStatus,
      });
    } catch (e) {
      /* booking record still attempted; surfaced via ledger on next load */
    }
  };

  const payNow = async () => {
    setStatus("processing");
    setError("");
    await new Promise((r) => setTimeout(r, 1400));
    const succeeded = Math.random() > 0.15; // simulated gateway outcome
    if (succeeded) {
      await createBooking("CONFIRMED");
      setStatus("success");
    } else {
      await createBooking("PENDING");
      setStatus("failed");
      setError("Payment could not be processed by your bank.");
    }
  };

  const cancelPayment = async () => {
    await createBooking("PENDING");
    setStatus("failed");
    setError("Payment was cancelled before completion.");
  };

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <CheckCircle2 size={48} className="text-emerald mx-auto mb-4" />
        <h2 className="text-xl font-bold text-ink mb-2">Booking confirmed</h2>
        <p className="text-mist text-sm mb-1">
          {option.origin} → {option.destination} with {option.providerName}
        </p>
        <p className="text-ink font-bold mb-6">
          ₹{total.toLocaleString("en-IN")} paid
        </p>
        <Button onClick={() => navigate("/ledger")}>View bookings</Button>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <Clock size={48} className="text-amber mx-auto mb-4" />
        <h2 className="text-xl font-bold text-ink mb-2">Booking pending</h2>
        <p className="text-mist text-sm mb-1">{error}</p>
        <p className="text-mist-soft text-xs mb-6">
          Your seat is held. Retry payment from your bookings page.
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => navigate("/ledger")}>
            View bookings
          </Button>
          <Button onClick={() => setStatus("idle")}>Retry payment</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-mist text-sm mb-6 hover:text-ink"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="rounded-2xl border border-line bg-surface p-5 mb-5">
        <p className="text-xs text-mist-soft mb-1">
          {option.mode} · {option.providerName}
        </p>
        <p className="text-ink font-semibold">
          {option.origin} → {option.destination}
        </p>
        <p className="text-mist text-xs mt-1">
          {totalPassengers} passenger(s) · {travelDate}
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 mb-5">
        <h3 className="text-ink font-semibold text-sm mb-3">Fare breakdown</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-mist">
            <span>Base fare × {totalPassengers}</span>
            <span className="font-mono">
              ₹{baseFare.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-mist">
            <span>GST (18%)</span>
            <span className="font-mono">₹{gst.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between text-mist">
            <span>Convenience fee</span>
            <span className="font-mono">₹{CONVENIENCE_FEE}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald">
              <span>Discount ({appliedPromo})</span>
              <span className="font-mono">
                -₹{discount.toLocaleString("en-IN")}
              </span>
            </div>
          )}
          <div className="flex justify-between text-ink font-bold text-base border-t border-line pt-2 mt-1">
            <span>Total</span>
            <span className="font-mono">₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <input
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder="Promo code"
            className="flex-1 h-10 px-3 rounded-lg border border-line bg-canvas text-sm text-ink outline-none focus:border-violet"
          />
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={applyPromo}
          >
            <Tag size={14} /> Apply
          </Button>
        </div>
        {promoError && (
          <p className="text-red-500 text-xs mt-1.5">{promoError}</p>
        )}
        {appliedPromo && (
          <p className="text-emerald text-xs mt-1.5">
            Promo {appliedPromo} applied
          </p>
        )}
      </div>

      <div className="flex items-start gap-2 mb-5 p-2.5 rounded-lg bg-blue-soft text-mist text-[11px] leading-relaxed">
        <ShieldCheck size={14} className="shrink-0 mt-0.5 text-blue" />
        Payments are simulated for this demo — no real card is charged.
      </div>

      <Button
        className="w-full h-12"
        onClick={payNow}
        disabled={status === "processing"}
      >
        {status === "processing"
          ? "Processing payment…"
          : `Pay ₹${total.toLocaleString("en-IN")}`}
      </Button>
      <Button
        variant="ghost"
        className="w-full mt-2"
        onClick={cancelPayment}
        disabled={status === "processing"}
      >
        <XCircle size={14} /> Cancel payment
      </Button>
    </div>
  );
}

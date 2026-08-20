import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Users } from "lucide-react";
import { FloatingInput } from "../components/ui/floating-input";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";

export default function BookingPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { email } = useAuth();
  const option = state?.option;
  const party = state?.party || { adults: 1, children: 0 };
  const travelDate = state?.travelDate;
  const cheapestAvailablePrice = state?.cheapestAvailablePrice ?? option?.price;

  const totalPassengers = party.adults + party.children;
  const initialPassengers = Array.from({ length: totalPassengers }, (_, i) => ({
    name: "",
    age: "",
    type: i < party.adults ? "Adult" : "Child",
  }));

  const [contact, setContact] = useState({ email: email || "", phone: "" });
  const [passengers, setPassengers] = useState(initialPassengers);

  if (!option) {
    return (
      <div className="max-w-md mx-auto text-center py-20 text-mist">
        No option selected.
        <div className="mt-4">
          <Button onClick={() => navigate("/dashboard")}>Back to search</Button>
        </div>
      </div>
    );
  }

  const updatePassenger = (i, field) => (e) => {
    const next = [...passengers];
    next[i] = { ...next[i], [field]: e.target.value };
    setPassengers(next);
  };

  const submit = (e) => {
    e.preventDefault();
    navigate("/payment", {
      state: {
        option,
        party,
        travelDate,
        cheapestAvailablePrice,
        contact,
        passengers,
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-mist text-sm mb-6 hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to results
      </button>

      <div className="rounded-2xl border border-line bg-surface p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-mist-soft mb-1">
            {option.mode} · {option.providerName}
          </p>
          <p className="text-ink font-semibold text-lg">
            {option.origin} → {option.destination}
          </p>
          <p className="text-mist text-xs mt-1">
            {option.departureTime} – {option.arrivalTime} ·{" "}
            {option.durationLabel} · {travelDate}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-mist-soft">Base fare / passenger</p>
          <p className="text-ink font-bold text-lg">
            ₹{option.price.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-6">
        <div>
          <h3 className="text-ink font-semibold text-sm mb-3 flex items-center gap-2">
            <Users size={15} /> Passenger details ({totalPassengers})
          </h3>
          <div className="flex flex-col gap-3">
            {passengers.map((p, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_100px_110px] gap-2.5 rounded-xl border border-line p-3.5 bg-surface"
              >
                <FloatingInput
                  label={`${p.type} ${i + 1} — Full name`}
                  icon={User}
                  value={p.name}
                  onChange={updatePassenger(i, "name")}
                  required
                  className="h-11 text-sm"
                />
                <FloatingInput
                  label="Age"
                  type="number"
                  value={p.age}
                  onChange={updatePassenger(i, "age")}
                  required
                  className="h-11 text-sm"
                />
                <div className="flex items-center text-xs text-mist-soft font-medium">
                  {p.type}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-ink font-semibold text-sm mb-3">
            Contact details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <FloatingInput
              label="Email address"
              type="email"
              icon={Mail}
              value={contact.email}
              onChange={(e) =>
                setContact({ ...contact, email: e.target.value })
              }
              required
              className="h-11 text-sm"
            />
            <FloatingInput
              label="Phone number"
              icon={Phone}
              value={contact.phone}
              onChange={(e) =>
                setContact({ ...contact, phone: e.target.value })
              }
              required
              className="h-11 text-sm"
            />
          </div>
          <p className="text-mist-soft text-xs mt-2">
            Booking confirmation and e-tickets will be sent here.
          </p>
        </div>

        <Button type="submit" className="w-full h-12 text-sm">
          Continue to payment
        </Button>
      </form>
    </div>
  );
}

import React from "react";

export default function Footer() {
  return (
    <footer className="w-full pb-10 text-center    text-orange-800 bg-cream-100 border-t border-orange-200/30 backdrop-blur-sm font-bold text-l">
      © {new Date().getFullYear()} <span className="lobster-two-regular">CuraLink</span> — Bridging Patients & Researchers
    </footer>
  );
}

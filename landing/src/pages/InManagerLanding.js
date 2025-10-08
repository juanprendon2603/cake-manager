import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AboutSection from "../components/AboutSection";
import { FAQ } from "../components/FAQ";
import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { Navbar } from "../components/Navbar";
import { Pricing } from "../components/Pricing";
import { ProblemSolution } from "../components/ProblemSolution";
import { Reveal } from "../components/Reveal";
import { WhatsAppWidget } from "../components/WhatsAppWidget";
export default function InManagerLanding() {
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100 text-gray-900", children: [_jsx(Navbar, {}), _jsx(Reveal, { as: "div", y: 8, children: _jsx(Hero, {}) }), _jsx(Reveal, { as: "section", y: 12, delay: 60, children: _jsx(ProblemSolution, {}) }), _jsx(Reveal, { as: "section", y: 12, delay: 80, children: _jsx(Features, {}) }), _jsx(Reveal, { as: "section", y: 12, delay: 100, children: _jsx(Pricing, {}) }), _jsx(Reveal, { as: "section", y: 12, delay: 140, children: _jsx(FAQ, {}) }), _jsx(Reveal, { as: "section", y: 12, delay: 160, children: _jsx(AboutSection, {}) }), _jsx(Footer, {}), _jsx(WhatsAppWidget, { phone: "573168878200", logoSrc: "/whatsapp.png" })] }));
}

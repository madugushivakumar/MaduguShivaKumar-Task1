import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="paper-card bg-[#FFFDF7] rounded-3xl border border-[#D9D5CA] p-10 max-w-lg w-full shadow-sm relative overflow-hidden">
        {/* Decorative academic rubber stamp */}
        <div className="absolute top-6 right-6 opacity-30 pointer-events-none">
          <div className="rubber-stamp text-xs scale-90">
            RECORD NOT FOUND
          </div>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center mx-auto mb-4 shadow-2xs">
          <FileQuestion className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold text-[#1557D6] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase">
          ERROR 404 • UNINDEXED DOSSIER
        </span>

        <h1 className="text-3xl font-black font-editorial text-[#172033] mt-3">
          Document Not Found
        </h1>

        <p className="text-sm font-handwritten text-[#8A7E72] text-lg mt-1">
          "The archives have been queried, but this folio does not exist."
        </p>

        <p className="text-xs text-[#5A6578] mt-3 max-w-sm mx-auto leading-relaxed">
          The requested institutional route, dossier, or assignment catalog has either been relocated or never created in the academic ledger.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" icon={Home}>
              Return to Campus
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2.5 rounded-xl border border-[#D9D5CA] text-[#5A6578] font-mono font-bold text-xs hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;


import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PdsRecord } from '../../types/pds';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { openPdsPage1PdfInNewTab } from '../../utils/exportImport';
import { parseDMYDate } from '../../pdfExport/exportPdsPage1';

interface PdsPrintPreviewProps {
  record: PdsRecord;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Show saved value or dash for empty */
const v = (val: string | undefined | null): string =>
  val && val.trim() ? val.trim() : '—';

/** Tri-state display: true→YES, false→NO, null→(blank) */
const triState = (answer: boolean | null | undefined): string => {
  if (answer === true) return 'YES';
  if (answer === false) return 'NO';
  return '';
};

/** Format address parts into one string */
const fmtAddr = (a: {
  houseBlockLot: string;
  street: string;
  subdivisionVillage: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  zipCode: string;
}): string => {
  const parts = [
    a.houseBlockLot,
    a.street,
    a.subdivisionVillage,
    a.barangay,
    a.cityMunicipality,
    a.province,
    a.zipCode ? `ZIP: ${a.zipCode}` : '',
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
};

/* ------------------------------------------------------------------ */
/*  Shared table-cell style constants (Tailwind)                      */
/* ------------------------------------------------------------------ */
const LABEL = 'bg-gray-100 p-1 font-bold border-r border-black text-[9px]';
const CELL = 'p-1 border-r border-black text-[10px]';
const CELL_LAST = 'p-1 text-[10px]';
const SECTION_HEADER = 'bg-gray-200 text-black font-bold px-2 py-1 uppercase text-xs border border-black';

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export const PdsPrintPreview: React.FC<PdsPrintPreviewProps> = ({ record, onClose }) => {
  const portalRef = useRef<HTMLDivElement | null>(null);

  // Create and manage the portal container
  useEffect(() => {
    let el = document.getElementById('pds-print-portal') as HTMLDivElement | null;
    if (!el) {
      el = document.createElement('div');
      el.id = 'pds-print-portal';
      document.body.appendChild(el);
    }
    portalRef.current = el;
    // Force a re-render now that portalRef is set
    setReady(true);

    return () => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
      portalRef.current = null;
    };
  }, []);

  const [ready, setReady] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);


 

  const handleExportPdfPage1 = async () => {
    try {
      setIsExportingPdf(true);
      await openPdsPage1PdfInNewTab(record);
    } catch (err) {
      console.error('[GovFormsPH] PDF export failed:', err);
      alert('Failed to export PDF. Please check the console for details.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const p = record.personalInfo;
  const f = record.familyBackground;
  const e = record.education;
  const q = record.backgroundQuestions;
  const d = record.declaration;

  /* ---------------------------------------------------------------- */
  /*  The printable content (rendered into the portal)                */
  /* ---------------------------------------------------------------- */
  const printContent = (
    <>
      {/* ======= Web-only top bar (hidden in print via .pds-print-controls) ======= */}
      <div className="pds-print-controls sticky top-0 z-20 max-w-5xl mx-auto bg-slate-900 text-white rounded-xl p-3 mb-4 shadow-xl flex items-center justify-between border border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-sm font-semibold">
            CS Form No. 212 (Revised 2026) — Print &amp; PDF Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<ExternalLink className="w-4 h-4" />}
            onClick={handleExportPdfPage1}
            disabled={isExportingPdf}
            className="text-teal-300 border-teal-600 hover:bg-teal-950/50"
          >
            {isExportingPdf ? 'Opening PDF...' : 'Print'}
          </Button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ======= Printable Sheet Container ======= */}
      <div id="pds-print-area" className="max-w-5xl mx-auto bg-white text-black shadow-2xl rounded-xl font-sans text-[11px] leading-tight">

        {/* ====================== PAGE 1 ====================== */}
        <div className="pds-page p-6 sm:p-10">

          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
            <div>
              <p className="italic font-serif text-[10px]">CS Form No. 212</p>
              <p className="font-bold text-[10px]">Revised 2026</p>
            </div>
            <div className="text-center flex-1 px-4">
              <h1 className="font-black text-lg tracking-wider uppercase">Personal Data Sheet</h1>
              <p className="text-[8px] italic text-gray-600 max-w-xl mx-auto">
                WARNING: Any misrepresentation made in the Personal Data Sheet and the Work Experience Sheet shall cause the filing of administrative/criminal case/s against the person concerned.
              </p>
              <p className="text-[8px] italic text-gray-600 mt-0.5">
                READ THE ATTACHED GUIDE TO FILLING OUT THE PERSONAL DATA SHEET (PDS) BEFORE ACCOMPLISHING THE PDS FORM.
              </p>
            </div>
            <div className="text-right text-[9px] max-w-[180px]">
              <p>Print legibly. Tick appropriate boxes and use separate sheet if necessary. Indicate N/A if not applicable. DO NOT ABBREVIATE.</p>
            </div>
          </div>

          {/* I. PERSONAL INFORMATION */}
          <div className={SECTION_HEADER}>I. Personal Information</div>

          <table className="w-full border-collapse border border-black text-left">
            <tbody>
              {/* Surname */}
              <tr className="border-b border-black">
                <td className={`${LABEL} w-1/4`}>2. SURNAME</td>
                <td colSpan={3} className={`${CELL_LAST} font-bold uppercase`}>{v(p.surname)}</td>
              </tr>
              {/* First Name + Extension */}
              <tr className="border-b border-black">
                <td className={LABEL}>FIRST NAME</td>
                <td className={`${CELL} font-bold uppercase`}>{v(p.firstName)}</td>
                <td className={`${LABEL} w-32 text-[8px]`}>NAME EXTENSION (JR., SR)</td>
                <td className={`${CELL_LAST} w-20 uppercase`}>{p.nameExtension || 'N/A'}</td>
              </tr>
              {/* Middle Name */}
              <tr className="border-b border-black">
                <td className={LABEL}>MIDDLE NAME</td>
                <td colSpan={3} className={`${CELL_LAST} uppercase`}>{p.middleName || 'N/A'}</td>
              </tr>
              {/* DOB | Citizenship */}
              <tr className="border-b border-black">
                <td className={LABEL}>3. DATE OF BIRTH (dd/mm/yyyy)</td>
                <td className={`${CELL} font-mono`}>{v(p.dateOfBirth)}</td>
                <td className={LABEL}>16. CITIZENSHIP</td>
                <td className={CELL_LAST}>
                  {p.citizenship || '—'}
                  {p.dualCitizenshipMode ? ` (${p.dualCitizenshipMode})` : ''}
                  {p.dualCitizenshipCountry ? ` — ${p.dualCitizenshipCountry}` : ''}
                </td>
              </tr>
              {/* Place of Birth | Residential Address */}
              <tr className="border-b border-black">
                <td className={LABEL}>4. PLACE OF BIRTH</td>
                <td className={CELL}>{v(p.placeOfBirth)}</td>
                <td rowSpan={3} className={`${LABEL} align-top`}>17. RESIDENTIAL ADDRESS</td>
                <td rowSpan={3} className={`${CELL_LAST} align-top`}>
                  {fmtAddr(p.residentialAddress)}
                </td>
              </tr>
              {/* Sex at Birth */}
              <tr className="border-b border-black">
                <td className={LABEL}>5. SEX AT BIRTH</td>
                <td className={CELL}>{v(p.sexAtBirth)}</td>
              </tr>
              {/* Civil Status */}
              <tr className="border-b border-black">
                <td className={LABEL}>6. CIVIL STATUS</td>
                <td className={CELL}>
                  {v(p.civilStatus)}{p.civilStatusOthersSpecify ? ` (${p.civilStatusOthersSpecify})` : ''}
                </td>
              </tr>
              {/* Height | Permanent Address */}
              <tr className="border-b border-black">
                <td className={LABEL}>7. HEIGHT (m)</td>
                <td className={CELL}>{v(p.height)}</td>
                <td rowSpan={4} className={`${LABEL} align-top`}>18. PERMANENT ADDRESS</td>
                <td rowSpan={4} className={`${CELL_LAST} align-top`}>
                  {p.sameAsResidentialAddress
                    ? 'SAME AS RESIDENTIAL ADDRESS'
                    : fmtAddr(p.permanentAddress)}
                </td>
              </tr>
              {/* Weight */}
              <tr className="border-b border-black">
                <td className={LABEL}>8. WEIGHT (kg)</td>
                <td className={CELL}>{v(p.weight)}</td>
              </tr>
              {/* Blood Type */}
              <tr className="border-b border-black">
                <td className={LABEL}>9. BLOOD TYPE</td>
                <td className={CELL}>{v(p.bloodType)}</td>
              </tr>
              {/* UMID */}
              <tr className="border-b border-black">
                <td className={LABEL}>10. UMID ID NO.</td>
                <td className={`${CELL} font-mono`}>{v(p.umidIdNo)}</td>
              </tr>
              {/* Pag-IBIG | Telephone */}
              <tr className="border-b border-black">
                <td className={LABEL}>11. PAG-IBIG ID NO.</td>
                <td className={`${CELL} font-mono`}>{v(p.pagIbigIdNo)}</td>
                <td className={LABEL}>19. TELEPHONE NO.</td>
                <td className={CELL_LAST}>{v(p.telephoneNo)}</td>
              </tr>
              {/* PhilHealth | Mobile */}
              <tr className="border-b border-black">
                <td className={LABEL}>12. PHILHEALTH NO.</td>
                <td className={`${CELL} font-mono`}>{v(p.philhealthNo)}</td>
                <td className={LABEL}>20. MOBILE NO.</td>
                <td className={`${CELL_LAST} font-mono`}>{v(p.mobileNo)}</td>
              </tr>
              {/* PhilSys PCN | Email */}
              <tr className="border-b border-black">
                <td className={LABEL}>13. PHILSYS CARD NO. (PCN)</td>
                <td className={`${CELL} font-mono`}>{v(p.philSysCardNumber)}</td>
                <td className={LABEL}>21. E-MAIL ADDRESS (if any)</td>
                <td className={`${CELL_LAST} lowercase`}>{v(p.emailAddress)}</td>
              </tr>
              {/* TIN */}
              <tr className="border-b border-black">
                <td className={LABEL}>14. TIN NO.</td>
                <td className={`${CELL} font-mono`}>{v(p.tinNo)}</td>
                <td className={LABEL} colSpan={2} />
              </tr>
              {/* Agency Employee No */}
              <tr className="border-b border-black">
                <td className={LABEL}>15. AGENCY EMPLOYEE NO.</td>
                <td className={`${CELL} font-mono`}>{v(p.agencyEmployeeNo)}</td>
                <td className={LABEL} colSpan={2} />
              </tr>
            </tbody>
          </table>

          {/* II. FAMILY BACKGROUND */}
          <div className={`${SECTION_HEADER} mt-3`}>II. Family Background</div>

          <div className="grid grid-cols-2 border border-black">
            {/* Left: Spouse + Parents */}
            <div className="border-r border-black p-2 space-y-0.5 text-[10px]">
              <p><strong>22. SPOUSE'S SURNAME:</strong> {v(f.spouse.surname)}</p>
              <p><strong>FIRST NAME:</strong> {v(f.spouse.firstName)} <strong className="ml-2 text-[8px]">NAME EXT:</strong> {f.spouse.nameExtension || 'N/A'}</p>
              <p><strong>MIDDLE NAME:</strong> {v(f.spouse.middleName)}</p>
              <p><strong>OCCUPATION:</strong> {v(f.spouse.occupation)}</p>
              <p><strong>EMPLOYER/BUSINESS NAME:</strong> {v(f.spouse.employerBusinessName)}</p>
              <p><strong>BUSINESS ADDRESS:</strong> {v(f.spouse.businessAddress)}</p>
              <p><strong>TELEPHONE NO.:</strong> {v(f.spouse.telephoneNo)}</p>
              <hr className="my-1 border-black" />
              <p><strong>24. FATHER'S SURNAME:</strong> {v(f.father.surname)}</p>
              <p><strong>FIRST NAME:</strong> {v(f.father.firstName)} <strong className="ml-2 text-[8px]">NAME EXT:</strong> {f.father.nameExtension || 'N/A'}</p>
              <p><strong>MIDDLE NAME:</strong> {v(f.father.middleName)}</p>
              <hr className="my-1 border-black" />
              <p><strong>25. MOTHER'S MAIDEN NAME</strong></p>
              <p><strong>SURNAME:</strong> {v(f.mother.maidenSurname || f.mother.surname)}</p>
              <p><strong>FIRST NAME:</strong> {v(f.mother.firstName)}</p>
              <p><strong>MIDDLE NAME:</strong> {v(f.mother.middleName)}</p>
            </div>

            {/* Right: Children */}
            <div className="p-2 text-[10px]">
              <p className="font-bold mb-1 border-b border-black pb-1">
                23. NAME of CHILDREN (Write full name and list all)
              </p>
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left py-0.5 font-bold">Full Name</th>
                    <th className="text-right py-0.5 font-bold">Date of Birth (dd/mm/yyyy)</th>
                  </tr>
                </thead>
                <tbody>
                  {f.children.length === 0 || !f.children[0]?.fullName ? (
                    <tr><td colSpan={2} className="py-0.5">N/A</td></tr>
                  ) : (
                    f.children.map((c, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-0.5">{v(c.fullName)}</td>
                        <td className="py-0.5 text-right font-mono">{v(c.dateOfBirth)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* III. EDUCATIONAL BACKGROUND */}
          <div className={`${SECTION_HEADER} mt-3`}>III. Educational Background</div>

          <table className="w-full border-collapse border border-black text-center text-[9px]">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="border-r border-black p-1">26. LEVEL</th>
                <th className="border-r border-black p-1">NAME OF SCHOOL<br /><span className="font-normal text-[7px]">(Write in full)</span></th>
                <th className="border-r border-black p-1">BASIC EDUCATION/DEGREE/COURSE<br /><span className="font-normal text-[7px]">(Write in full)</span></th>
                <th className="border-r border-black p-1" colSpan={2}>PERIOD OF ATTENDANCE<br /><span className="font-normal text-[7px]">(yyyy)</span></th>
                <th className="border-r border-black p-1">HIGHEST LEVEL/<br />UNITS EARNED<br /><span className="font-normal text-[7px]">(if not graduated)</span></th>
                <th className="border-r border-black p-1">YEAR<br />GRADUATED</th>
                <th className="p-1">SCHOLARSHIP/<br />ACADEMIC HONORS<br />RECEIVED</th>
              </tr>
              <tr className="bg-gray-50 border-b border-black text-[8px]">
                <th className="border-r border-black p-0.5"></th>
                <th className="border-r border-black p-0.5"></th>
                <th className="border-r border-black p-0.5"></th>
                <th className="border-r border-black p-0.5">From</th>
                <th className="border-r border-black p-0.5">To</th>
                <th className="border-r border-black p-0.5"></th>
                <th className="border-r border-black p-0.5"></th>
                <th className="p-0.5"></th>
              </tr>
            </thead>
            <tbody>
              {/* Elementary */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">ELEMENTARY</td>
                <td className="border-r border-black p-1">{v(e.elementary.nameOfSchool)}</td>
                <td className="border-r border-black p-1">{v(e.elementary.degreeCourse)}</td>
                <td className="border-r border-black p-1 font-mono">{v(e.elementary.periodFromYear)}</td>
                <td className="border-r border-black p-1 font-mono">{v(e.elementary.periodToYear)}</td>
                <td className="border-r border-black p-1">{v(e.elementary.highestLevelUnitsEarned)}</td>
                <td className="border-r border-black p-1 font-mono">{v(e.elementary.yearGraduated)}</td>
                <td className="p-1">{v(e.elementary.scholarshipAcademicHonors)}</td>
              </tr>
              {/* Secondary */}
              <tr className="border-b border-black">
                <td className="border-r border-black p-1 font-bold bg-gray-50">SECONDARY</td>
                <td className="border-r border-black p-1">{v(e.secondary.nameOfSchool)}</td>
                <td className="border-r border-black p-1">{v(e.secondary.degreeCourse)}</td>
                <td className="border-r border-black p-1 font-mono">{v(e.secondary.periodFromYear)}</td>
                <td className="border-r border-black p-1 font-mono">{v(e.secondary.periodToYear)}</td>
                <td className="border-r border-black p-1">{v(e.secondary.highestLevelUnitsEarned)}</td>
                <td className="border-r border-black p-1 font-mono">{v(e.secondary.yearGraduated)}</td>
                <td className="p-1">{v(e.secondary.scholarshipAcademicHonors)}</td>
              </tr>
              {/* Vocational / Trade Course */}
              {e.vocationalTrade && e.vocationalTrade.length > 0 ? (
                e.vocationalTrade.map((vt, i) => (
                  <tr key={`voc-${i}`} className="border-b border-black">
                    <td className="border-r border-black p-1 font-bold bg-gray-50 text-[8px]">
                      VOCATIONAL / TRADE COURSE{e.vocationalTrade.length > 1 ? ` #${i + 1}` : ''}
                    </td>
                    <td className="border-r border-black p-1">{v(vt.nameOfSchool)}</td>
                    <td className="border-r border-black p-1">{v(vt.degreeCourse)}</td>
                    <td className="border-r border-black p-1 font-mono">{v(vt.periodFromYear)}</td>
                    <td className="border-r border-black p-1 font-mono">{v(vt.periodToYear)}</td>
                    <td className="border-r border-black p-1">{v(vt.highestLevelUnitsEarned)}</td>
                    <td className="border-r border-black p-1 font-mono">{v(vt.yearGraduated)}</td>
                    <td className="p-1">{v(vt.scholarshipAcademicHonors)}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-black">
                  <td className="border-r border-black p-1 font-bold bg-gray-50 text-[8px]">VOCATIONAL / TRADE COURSE</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="p-1">—</td>
                </tr>
              )}
              {/* College */}
              {e.college.length > 0 && e.college[0]?.nameOfSchool ? (
                e.college.map((c, i) => (
                  <tr key={`col-${i}`} className="border-b border-black">
                    <td className="border-r border-black p-1 font-bold bg-gray-50">
                      COLLEGE{e.college.length > 1 ? ` #${i + 1}` : ''}
                    </td>
                    <td className="border-r border-black p-1">{v(c.nameOfSchool)}</td>
                    <td className="border-r border-black p-1">{v(c.degreeCourse)}</td>
                    <td className="border-r border-black p-1 font-mono">{v(c.periodFromYear)}</td>
                    <td className="border-r border-black p-1 font-mono">{v(c.periodToYear)}</td>
                    <td className="border-r border-black p-1">{v(c.highestLevelUnitsEarned)}</td>
                    <td className="border-r border-black p-1 font-mono">{v(c.yearGraduated)}</td>
                    <td className="p-1">{v(c.scholarshipAcademicHonors)}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-black">
                  <td className="border-r border-black p-1 font-bold bg-gray-50">COLLEGE</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="p-1">—</td>
                </tr>
              )}
              {/* Graduate Studies */}
              {e.graduateStudies.length > 0 && e.graduateStudies[0]?.nameOfSchool ? (
                e.graduateStudies.map((g, i) => (
                  <tr key={`grad-${i}`} className="border-b border-black">
                    <td className="border-r border-black p-1 font-bold bg-gray-50">
                      GRADUATE STUDIES{e.graduateStudies.length > 1 ? ` #${i + 1}` : ''}
                    </td>
                    <td className="border-r border-black p-1">{v(g.nameOfSchool)}</td>
                    <td className="border-r border-black p-1">{v(g.degreeCourse)}</td>
                    <td className="border-r border-black p-1 font-mono">{v(g.periodFromYear)}</td>
                    <td className="border-r border-black p-1 font-mono">{v(g.periodToYear)}</td>
                    <td className="border-r border-black p-1">{v(g.highestLevelUnitsEarned)}</td>
                    <td className="border-r border-black p-1 font-mono">{v(g.yearGraduated)}</td>
                    <td className="p-1">{v(g.scholarshipAcademicHonors)}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-black">
                  <td className="border-r border-black p-1 font-bold bg-gray-50">GRADUATE STUDIES</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="border-r border-black p-1">—</td>
                  <td className="p-1">—</td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

        {/* ====================== PAGE 2 ====================== */}
        <div className="pds-page p-6 sm:p-10">

          {/* IV. CIVIL SERVICE ELIGIBILITY */}
          <div className={SECTION_HEADER}>IV. Civil Service Eligibility</div>

          <table className="w-full border-collapse border border-black text-center text-[9px]">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="border-r border-black p-1 w-[30%] text-left">27. CAREER SERVICE/ RA 1080 (BOARD/ BAR) UNDER SPECIAL LAWS/ CES/ CSEE</th>
                <th className="border-r border-black p-1">RATING<br /><span className="font-normal text-[7px]">(If Applicable)</span></th>
                <th className="border-r border-black p-1">DATE OF EXAMINATION /<br />CONFERMENT</th>
                <th className="border-r border-black p-1">PLACE OF EXAMINATION /<br />CONFERMENT</th>
                <th className="border-r border-black p-1">LICENSE<br />NUMBER</th>
                <th className="p-1">Date of<br />Validity</th>
              </tr>
            </thead>
            <tbody>
              {record.eligibility.length === 0 || !record.eligibility[0]?.careerServiceRA1080OrSpecialLaw ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i} className="border-b border-black h-6">
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="p-1"></td>
                  </tr>
                ))
              ) : (
                record.eligibility.map((el, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="border-r border-black p-1.5 text-left font-medium">{v(el.careerServiceRA1080OrSpecialLaw)}</td>
                    <td className="border-r border-black p-1.5">{v(el.rating)}</td>
                    <td className="border-r border-black p-1.5 font-mono">{v(el.dateOfExamConferment)}</td>
                    <td className="border-r border-black p-1.5">{v(el.placeOfExamConferment)}</td>
                    <td className="border-r border-black p-1.5 font-mono">{v(el.licenseNumber)}</td>
                    <td className="p-1.5 font-mono">{v(el.licenseValidityDate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* V. WORK EXPERIENCE */}
          <div className={`${SECTION_HEADER} mt-3`}>V. Work Experience</div>
          <p className="text-[8px] font-bold border border-black border-t-0 px-2 py-0.5 bg-gray-50">
            28. (Include private employment. Start from your recent work) Description of duties should be indicated in the attached Work Experience sheet.
          </p>

          <table className="w-full border-collapse border border-black text-center text-[9px]">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="border-r border-black p-1" colSpan={2}>INCLUSIVE DATES<br /><span className="font-normal text-[7px]">(dd/mm/yyyy)</span></th>
                <th className="border-r border-black p-1">POSITION TITLE<br /><span className="font-normal text-[7px]">(Write in full/Do not abbreviate)</span></th>
                <th className="border-r border-black p-1">DEPARTMENT / AGENCY / OFFICE / COMPANY<br /><span className="font-normal text-[7px]">(Write in full)</span></th>
                <th className="border-r border-black p-1">MONTHLY<br />SALARY</th>
                <th className="border-r border-black p-1 text-[7px]">SALARY/ JOB/ PAY<br />GRADE &amp; STEP<br />INCREMENT</th>
                <th className="border-r border-black p-1">STATUS OF<br />APPOINTMENT</th>
                <th className="p-1">GOV'T<br />SERVICE<br /><span className="font-normal text-[7px]">(Y/N)</span></th>
              </tr>
              <tr className="bg-gray-50 border-b border-black text-[8px]">
                <th className="border-r border-black p-0.5">From</th>
                <th className="border-r border-black p-0.5">To</th>
                <th className="border-r border-black p-0.5"></th>
                <th className="border-r border-black p-0.5"></th>
                <th className="border-r border-black p-0.5"></th>
                <th className="border-r border-black p-0.5"></th>
                <th className="border-r border-black p-0.5"></th>
                <th className="p-0.5"></th>
              </tr>
            </thead>
            <tbody>
              {record.workExperience.length === 0 || !record.workExperience[0]?.positionTitle ? (
                Array.from({ length: 22 }).map((_, i) => (
                  <tr key={i} className="border-b border-black h-5">
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="p-1"></td>
                  </tr>
                ))
              ) : (
                [...record.workExperience]
                  .sort((a, b) => {
                    if (a.isPresent !== b.isPresent) return a.isPresent ? -1 : 1;
                    const aDate = parseDMYDate(a.inclusiveDatesTo) || parseDMYDate(a.inclusiveDatesFrom);
                    const bDate = parseDMYDate(b.inclusiveDatesTo) || parseDMYDate(b.inclusiveDatesFrom);
                    return bDate - aDate;
                  })
                  .map((w, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="border-r border-black p-1 font-mono">{v(w.inclusiveDatesFrom)}</td>
                    <td className="border-r border-black p-1 font-mono">{w.isPresent ? 'PRESENT' : v(w.inclusiveDatesTo)}</td>
                    <td className="border-r border-black p-1.5 text-left font-medium">{v(w.positionTitle)}</td>
                    <td className="border-r border-black p-1.5 text-left">{v(w.departmentAgencyOfficeCompany)}</td>
                    <td className="border-r border-black p-1">{w.monthlySalary ? `₱${w.monthlySalary}` : '—'}</td>
                    <td className="border-r border-black p-1 font-mono">{v(w.salaryJobPayGradeStepIncrement)}</td>
                    <td className="border-r border-black p-1">{v(w.statusOfAppointment)}</td>
                    <td className="p-1">{w.isGovernmentService === true ? 'Y' : w.isGovernmentService === false ? 'N' : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

        </div>

        {/* ====================== PAGE 3 ====================== */}
        <div className="pds-page p-6 sm:p-10">

          {/* VI. L&D INTERVENTIONS / TRAINING */}
          <div className={SECTION_HEADER}>VI. Learning and Development (L&amp;D) Interventions/Training Programs Attended</div>

          <table className="w-full border-collapse border border-black text-center text-[9px]">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="border-r border-black p-1 w-[30%] text-left">29. TITLE OF LEARNING AND DEVELOPMENT INTERVENTIONS/TRAINING PROGRAMS<br /><span className="font-normal text-[7px]">(Write in full)</span></th>
                <th className="border-r border-black p-1" colSpan={2}>INCLUSIVE DATES OF ATTENDANCE<br /><span className="font-normal text-[7px]">(dd/mm/yyyy)</span></th>
                <th className="border-r border-black p-1">NUMBER<br />OF HOURS</th>
                <th className="border-r border-black p-1">Type of LD<br /><span className="font-normal text-[7px]">(Managerial/ Supervisory/ Technical/etc)</span></th>
                <th className="p-1">CONDUCTED/ SPONSORED BY<br /><span className="font-normal text-[7px]">(Write in full)</span></th>
              </tr>
              <tr className="bg-gray-50 border-b border-black text-[8px]">
                <th className="border-r border-black p-0.5"></th>
                <th className="border-r border-black p-0.5">From</th>
                <th className="border-r border-black p-0.5">To</th>
                <th className="border-r border-black p-0.5"></th>
                <th className="border-r border-black p-0.5"></th>
                <th className="p-0.5"></th>
              </tr>
            </thead>
            <tbody>
              {record.trainings.length === 0 || !record.trainings[0]?.title ? (
                Array.from({ length: 16 }).map((_, i) => (
                  <tr key={i} className="border-b border-black h-5">
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="p-1"></td>
                  </tr>
                ))
              ) : (
                record.trainings.map((t, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="border-r border-black p-1.5 text-left font-medium">{v(t.title)}</td>
                    <td className="border-r border-black p-1 font-mono">{v(t.inclusiveDatesFrom)}</td>
                    <td className="border-r border-black p-1 font-mono">{v(t.inclusiveDatesTo)}</td>
                    <td className="border-r border-black p-1">{v(t.numberOfHours)}</td>
                    <td className="border-r border-black p-1">{v(t.typeOfLD)}</td>
                    <td className="p-1 text-left">{v(t.conductedSponsoredBy)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* VII. VOLUNTARY WORK */}
          <div className={`${SECTION_HEADER} mt-3`}>VII. Voluntary Work or Involvement in Civic / Non-Government / People / Voluntary Organization/s</div>

          <table className="w-full border-collapse border border-black text-center text-[9px]">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="border-r border-black p-1 w-[40%] text-left">30. NAME &amp; ADDRESS OF ORGANIZATION<br /><span className="font-normal text-[7px]">(Write in full)</span></th>
                <th className="border-r border-black p-1" colSpan={2}>INCLUSIVE DATES<br /><span className="font-normal text-[7px]">(dd/mm/yyyy)</span></th>
                <th className="border-r border-black p-1">NUMBER<br />OF HOURS</th>
                <th className="p-1">POSITION / NATURE OF WORK</th>
              </tr>
              <tr className="bg-gray-50 border-b border-black text-[8px]">
                <th className="border-r border-black p-0.5"></th>
                <th className="border-r border-black p-0.5">From</th>
                <th className="border-r border-black p-0.5">To</th>
                <th className="border-r border-black p-0.5"></th>
                <th className="p-0.5"></th>
              </tr>
            </thead>
            <tbody>
              {record.voluntaryWork.length === 0 || !record.voluntaryWork[0]?.organizationNameAddress ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i} className="border-b border-black h-5">
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="p-1"></td>
                  </tr>
                ))
              ) : (
                record.voluntaryWork.map((vw, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="border-r border-black p-1.5 text-left font-medium">{v(vw.organizationNameAddress)}</td>
                    <td className="border-r border-black p-1 font-mono">{v(vw.inclusiveDatesFrom)}</td>
                    <td className="border-r border-black p-1 font-mono">{v(vw.inclusiveDatesTo)}</td>
                    <td className="border-r border-black p-1">{v(vw.numberOfHours)}</td>
                    <td className="p-1 text-left">{v(vw.positionNatureOfWork)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* VIII. OTHER INFORMATION */}
          <div className={`${SECTION_HEADER} mt-3`}>VIII. Other Information</div>

          <table className="w-full border-collapse border border-black text-left text-[9px]">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="border-r border-black p-1 w-1/3">31. SPECIAL SKILLS and HOBBIES</th>
                <th className="border-r border-black p-1 w-1/3">32. NON-ACADEMIC DISTINCTIONS / RECOGNITION<br /><span className="font-normal text-[7px]">(Write in full)</span></th>
                <th className="p-1 w-1/3">33. MEMBERSHIP IN ASSOCIATION/ORGANIZATION<br /><span className="font-normal text-[7px]">(Write in full)</span></th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const skills = record.otherInfo.specialSkillsHobbies.filter(Boolean);
                const distinctions = record.otherInfo.nonAcademicDistinctions.filter(Boolean);
                const memberships = record.otherInfo.membershipInAssociations.filter(Boolean);
                const maxRows = Math.max(skills.length, distinctions.length, memberships.length, 7);
                return Array.from({ length: maxRows }).map((_, i) => (
                  <tr key={i} className="border-b border-black">
                    <td className="border-r border-black p-1">{skills[i] || ''}</td>
                    <td className="border-r border-black p-1">{distinctions[i] || ''}</td>
                    <td className="p-1">{memberships[i] || ''}</td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>

        </div>

        {/* ====================== PAGE 4 ====================== */}
        <div className="pds-page p-6 sm:p-10">

          {/* IX. BACKGROUND QUESTIONS */}
          <table className="w-full border-collapse border border-black text-[10px]">
            <tbody>
              {/* Q34 */}
              <tr className="border-b border-black">
                <td className={`${LABEL} w-8`}>34.</td>
                <td className="p-1.5 border-r border-black" colSpan={2}>
                  Are you related by consanguinity or affinity to the appointing or recommending authority, or to the
                  chief of bureau or office or to the person who has immediate supervision over you in the Office,
                  Bureau or Department where you will be appointed,
                </td>
                <td className="p-1.5 w-20 text-center border-r border-black font-bold">{triState(q.relatedWithinThirdDegree.answer)}</td>
                <td className="p-1.5" rowSpan={2}>
                  {(q.relatedWithinThirdDegree.details || q.relatedWithinFourthDegreeLGU.details)
                    ? `If YES: ${q.relatedWithinThirdDegree.details || ''} ${q.relatedWithinFourthDegreeLGU.details || ''}`
                    : ''}
                </td>
              </tr>
              <tr className="border-b border-black">
                <td className={LABEL}></td>
                <td className="p-1.5 border-r border-black">a. within the third degree?</td>
                <td className="p-1.5 border-r border-black">b. within the fourth degree (for Local Government Unit — Career Employees)?</td>
                <td className="p-1.5 text-center font-bold border-r border-black">{triState(q.relatedWithinFourthDegreeLGU.answer)}</td>
              </tr>

              {/* Q35a */}
              <tr className="border-b border-black">
                <td className={LABEL}>35.</td>
                <td className="p-1.5 border-r border-black" colSpan={2}>a. Have you ever been found guilty of any administrative offense?</td>
                <td className="p-1.5 text-center border-r border-black font-bold">{triState(q.foundGuiltyOfAdminOffense.answer)}</td>
                <td className="p-1.5">{q.foundGuiltyOfAdminOffense.details || ''}</td>
              </tr>
              {/* Q35b */}
              <tr className="border-b border-black">
                <td className={LABEL}></td>
                <td className="p-1.5 border-r border-black" colSpan={2}>b. Have you been criminally charged before any court?</td>
                <td className="p-1.5 text-center border-r border-black font-bold">{triState(q.criminallyChargedInCourt.answer)}</td>
                <td className="p-1.5">{q.criminallyChargedInCourt.details || ''}</td>
              </tr>
              {/* Q36 */}
              <tr className="border-b border-black">
                <td className={LABEL}>36.</td>
                <td className="p-1.5 border-r border-black" colSpan={2}>Have you ever been convicted of any crime or violation of any law, decree, ordinance or regulation by any court or tribunal?</td>
                <td className="p-1.5 text-center border-r border-black font-bold">{triState(q.convictedOfCrimeOrViolation.answer)}</td>
                <td className="p-1.5">{q.convictedOfCrimeOrViolation.details || ''}</td>
              </tr>
              {/* Q37 */}
              <tr className="border-b border-black">
                <td className={LABEL}>37.</td>
                <td className="p-1.5 border-r border-black" colSpan={2}>Have you ever been separated from the service in any of the following modes: resignation, retirement, dropped from the rolls, dismissal, termination, end of term, finished contract or phased out (abolition) in the public or private sector?</td>
                <td className="p-1.5 text-center border-r border-black font-bold">{triState(q.separatedFromService.answer)}</td>
                <td className="p-1.5">{q.separatedFromService.details || ''}</td>
              </tr>
              {/* Q38a */}
              <tr className="border-b border-black">
                <td className={LABEL}>38.</td>
                <td className="p-1.5 border-r border-black" colSpan={2}>a. Have you ever been a candidate in a national or local election held within the last year (except Barangay election)?</td>
                <td className="p-1.5 text-center border-r border-black font-bold">{triState(q.candidateInNationalLocalElection.answer)}</td>
                <td className="p-1.5">{q.candidateInNationalLocalElection.details || ''}</td>
              </tr>
              {/* Q38b */}
              <tr className="border-b border-black">
                <td className={LABEL}></td>
                <td className="p-1.5 border-r border-black" colSpan={2}>b. Have you resigned from the government service during the three (3)-month period before the last election to promote/actively campaign for a national or local candidate?</td>
                <td className="p-1.5 text-center border-r border-black font-bold">{triState(q.resignedToCampaignForCandidate.answer)}</td>
                <td className="p-1.5">{q.resignedToCampaignForCandidate.details || ''}</td>
              </tr>
              {/* Q39 */}
              <tr className="border-b border-black">
                <td className={LABEL}>39.</td>
                <td className="p-1.5 border-r border-black" colSpan={2}>Have you acquired the status of an immigrant or permanent resident of another country?</td>
                <td className="p-1.5 text-center border-r border-black font-bold">{triState(q.immigrantOrPermanentResidentAbroad.answer)}</td>
                <td className="p-1.5">{q.immigrantOrPermanentResidentAbroad.country || ''}</td>
              </tr>
              {/* Q40 preamble */}
              <tr className="border-b border-black">
                <td className={LABEL}>40.</td>
                <td className="p-1 border-r border-black text-[9px]" colSpan={4}>
                  Pursuant to: (a) Indigenous People's Act (RA 8371); (b) Magna Carta for Disabled Persons (RA 7277, as amended); and (c) Expanded Solo Parents Welfare Act (RA 8972, as amended by RA 11861):
                </td>
              </tr>
              {/* Q40a */}
              <tr className="border-b border-black">
                <td className={LABEL}>a.</td>
                <td className="p-1.5 border-r border-black" colSpan={2}>Are you a member of any indigenous group?</td>
                <td className="p-1.5 text-center border-r border-black font-bold">{triState(q.indigenousGroupMember.answer)}</td>
                <td className="p-1.5">{q.indigenousGroupMember.specify || ''}</td>
              </tr>
              {/* Q40b */}
              <tr className="border-b border-black">
                <td className={LABEL}>b.</td>
                <td className="p-1.5 border-r border-black" colSpan={2}>Are you a person with disability?</td>
                <td className="p-1.5 text-center border-r border-black font-bold">{triState(q.personWithDisability.answer)}</td>
                <td className="p-1.5">{q.personWithDisability.pwdIdNo || ''}</td>
              </tr>
              {/* Q40c */}
              <tr className="border-b border-black">
                <td className={LABEL}>c.</td>
                <td className="p-1.5 border-r border-black" colSpan={2}>Are you a solo parent?</td>
                <td className="p-1.5 text-center border-r border-black font-bold">{triState(q.soloParent.answer)}</td>
                <td className="p-1.5">{q.soloParent.soloParentIdNo || ''}</td>
              </tr>
            </tbody>
          </table>

          {/* 41. REFERENCES */}
          <div className={`${SECTION_HEADER} mt-3`}>
            41. References <span className="font-normal text-[8px]">(Person not related by consanguinity or affinity to applicant/appointee)</span>
          </div>

          <table className="w-full border-collapse border border-black text-left text-[10px]">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="border-r border-black p-1 w-1/3">NAME</th>
                <th className="border-r border-black p-1 w-1/3">OFFICE / RESIDENTIAL ADDRESS</th>
                <th className="p-1 w-1/3">CONTACT NO. AND/OR EMAIL</th>
              </tr>
            </thead>
            <tbody>
              {record.references.map((r, i) => (
                <tr key={i} className="border-b border-black">
                  <td className="border-r border-black p-1 font-medium uppercase">{v(r.name)}</td>
                  <td className="border-r border-black p-1">{v(r.officeResidentialAddress)}</td>
                  <td className="p-1">{v(r.contactNoOrEmail)}</td>
                </tr>
              ))}
              {/* Pad to at least 3 rows */}
              {record.references.length < 3 &&
                Array.from({ length: 3 - record.references.length }).map((_, i) => (
                  <tr key={`pad-${i}`} className="border-b border-black h-6">
                    <td className="border-r border-black p-1"></td>
                    <td className="border-r border-black p-1"></td>
                    <td className="p-1"></td>
                  </tr>
                ))
              }
            </tbody>
          </table>

          {/* 42. DECLARATION */}
          <div className="border border-black p-3 space-y-2 mt-3">
            <p className="text-[9px] text-justify">
              <strong>42.</strong> I declare under oath that I have personally accomplished this Personal Data Sheet which is a true,
              correct and complete statement pursuant to the provisions of pertinent laws, rules and regulations of the
              Republic of the Philippines. I authorize the agency head / authorized representative to verify/validate the
              contents stated herein. I agree that any misrepresentation made in this document and its attachments shall
              cause the filing of administrative/criminal case/s against me.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {/* Left: Gov't ID Details */}
              <div className="space-y-1 text-[10px] border border-black p-2">
                <p className="font-bold border-b border-black pb-1 text-[9px]">Government Issued ID (i.e. Passport, GSIS, SSS, PRC, Driver's License, etc.)</p>
                <p><strong>Government Issued ID:</strong> {v(d.governmentIssuedId)}</p>
                <p><strong>ID/License/Passport No.:</strong> {v(d.idLicensePassportNo)}</p>
                <p><strong>Date/Place of Issuance:</strong> {v(d.dateOfIssuance)}{d.placeOfIssuance ? ` / ${d.placeOfIssuance}` : ''}</p>
              </div>

              {/* Middle: Signature + Date + Thumbmark */}
              <div className="flex flex-col items-center justify-between border border-black p-2 text-center">
                <div className="w-full flex-1 flex flex-col items-center justify-center">
                  {d.signature ? (
                    <img src={d.signature} alt="Signature" className="max-h-16 object-contain" />
                  ) : (
                    <div className="h-14 flex items-center justify-center text-gray-400 italic text-[9px]">
                      (Signature)
                    </div>
                  )}
                  <div className="w-full border-t border-black pt-1 font-bold text-[8px] uppercase">
                    Signature (Sign inside the box)
                  </div>
                </div>
              </div>

              {/* Right: ID Photo */}
              <div className="border border-black p-2 flex flex-col items-center justify-center text-center">
                <p className="text-[8px] font-bold mb-1">PHOTO</p>
                {d.idPhoto ? (
                  <img src={d.idPhoto} alt="Passport ID" className="w-24 h-32 object-cover border border-black shadow-sm" />
                ) : (
                  <div className="w-24 h-32 border-2 border-dashed border-black flex flex-col items-center justify-center p-1 text-[8px] text-gray-500">
                    <span>ID PHOTO</span>
                    <span>(3.5 cm x 4.5 cm)</span>
                    <span className="text-[7px] mt-1">White background</span>
                  </div>
                )}
                <span className="text-[8px] mt-1 text-gray-500">Passport size photo</span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </>
  );

  /* ---------------------------------------------------------------- */
  /*  Render: portal for print isolation                              */
  /* ---------------------------------------------------------------- */
  if (!ready || !portalRef.current) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-2 sm:p-6">
      {printContent}
    </div>,
    portalRef.current
  );
};

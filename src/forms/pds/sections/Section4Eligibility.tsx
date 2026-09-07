import React from "react";
import { EligibilityItem } from "../../../types/pds";
import { createEmptyEligibility } from "../../../db/defaultPdsData";
import { DateInput } from "../../../components/common/DateInput";
import { Button } from "../../../components/common/Button";
import { Plus, Trash2, Award } from "lucide-react";

interface Section4EligibilityProps {
  data: EligibilityItem[];
  onChange: (updated: EligibilityItem[]) => void;
}

export const Section4Eligibility: React.FC<Section4EligibilityProps> = ({
  data,
  onChange,
}) => {
  const addRow = () => {
    onChange([...data, createEmptyEligibility()]);
  };

  const removeRow = (index: number) => {
    const list = [...data];
    list.splice(index, 1);
    onChange(list);
  };

  const updateRow = (
    index: number,
    field: keyof EligibilityItem,
    val: string,
  ) => {
    const list = [...data];
    list[index] = { ...list[index], [field]: val };
    onChange(list);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border-light dark:border-border-dark pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-xs flex items-center justify-center font-bold">
              IV
            </span>
            Civil Service Eligibility (Item 27)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Career Service, RA 1080 (Board/Bar), CES, CSEE, Barangay Health
            Worker, Driver's License, etc.
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No Civil Service Eligibility Listed
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            If you have passed Civil Service Exams or PRC Board Exams, add them
            here.
          </p>
          <Button type="button" variant="primary" size="sm" onClick={addRow}>
            Add First Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                  Eligibility #{idx + 1}
                </span>
                {data.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                    title="Remove row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Career Service / RA 1080 / Special Law / CES / Barangay
                    Eligibility
                  </label>
                  <input
                    type="text"
                    value={item.careerServiceRA1080OrSpecialLaw}
                    onChange={(e) =>
                      updateRow(
                        idx,
                        "careerServiceRA1080OrSpecialLaw",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. CAREER SERVICE PROFESSIONAL / RA 1080 (CPA/RN)"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rating (If Applicable)
                  </label>
                  <input
                    type="text"
                    value={item.rating}
                    onChange={(e) => updateRow(idx, "rating", e.target.value)}
                    placeholder="e.g. 85.60% (or N/A)"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <DateInput
                    label="Date of Exam / Conferment"
                    value={item.dateOfExamConferment}
                    onChange={(val) =>
                      updateRow(idx, "dateOfExamConferment", val)
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Place of Exam / Conferment
                  </label>
                  <input
                    type="text"
                    value={item.placeOfExamConferment}
                    onChange={(e) =>
                      updateRow(idx, "placeOfExamConferment", e.target.value)
                    }
                    placeholder="e.g. CSC NCR / Manila"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    License Number (If Applicable)
                  </label>
                  <input
                    type="text"
                    value={item.licenseNumber}
                    onChange={(e) =>
                      updateRow(idx, "licenseNumber", e.target.value)
                    }
                    placeholder="e.g. 0123456"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>

                <div>
                  <DateInput
                    label="License Validity Date"
                    value={item.licenseValidityDate}
                    onChange={(val) =>
                      updateRow(idx, "licenseValidityDate", val)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        icon={<Plus className="w-3.5 h-3.5" />}
        onClick={addRow}
      >
        Add Eligibility
      </Button>
    </div>
  );
};

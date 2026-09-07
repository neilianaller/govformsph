import React from "react";
import { WorkExperienceItem } from "../../../types/pds";
import { createEmptyWorkExperience } from "../../../db/defaultPdsData";
import { DateInput } from "../../../components/common/DateInput";
import { Button } from "../../../components/common/Button";
import { Plus, Trash2, Briefcase, FileText } from "lucide-react";

interface Section5WorkExperienceProps {
  data: WorkExperienceItem[];
  onChange: (updated: WorkExperienceItem[]) => void;
}

export const Section5WorkExperience: React.FC<Section5WorkExperienceProps> = ({
  data,
  onChange,
}) => {
  const addRow = () => {
    onChange([...data, createEmptyWorkExperience()]);
  };

  const removeRow = (index: number) => {
    const list = [...data];
    list.splice(index, 1);
    onChange(list);
  };

  const updateRow = <K extends keyof WorkExperienceItem>(
    index: number,
    field: K,
    val: WorkExperienceItem[K],
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
              V
            </span>
            Work Experience (Item 28)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Include all private and government employment starting from your
            most recent position.
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No Work Experience Added
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            Add your current and previous job positions here.
          </p>
          <Button type="button" variant="primary" size="sm" onClick={addRow}>
            Add First Work Experience
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
                  Position #{idx + 1} {idx === 0 && "(Latest / Current)"}
                </span>
                {data.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                    title="Remove position"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Position Title (Write in full)
                  </label>
                  <input
                    type="text"
                    value={item.positionTitle}
                    onChange={(e) =>
                      updateRow(idx, "positionTitle", e.target.value)
                    }
                    placeholder="e.g. ADMINISTRATIVE OFFICER V"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 "
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Department / Agency / Office / Company
                  </label>
                  <input
                    type="text"
                    value={item.departmentAgencyOfficeCompany}
                    onChange={(e) =>
                      updateRow(
                        idx,
                        "departmentAgencyOfficeCompany",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. Department of Budget and Management"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 "
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <DateInput
                    label="Inclusive Date: From"
                    value={item.inclusiveDatesFrom}
                    onChange={(val) =>
                      updateRow(idx, "inclusiveDatesFrom", val)
                    }
                  />
                </div>

                <div>
                  <DateInput
                    label="Inclusive Date: To"
                    value={item.inclusiveDatesTo}
                    onChange={(val) => updateRow(idx, "inclusiveDatesTo", val)}
                    placeholder="DD/MM/YYYY or PRESENT"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Salary (PHP)
                  </label>
                  <input
                    type="text"
                    value={item.monthlySalary}
                    onChange={(e) =>
                      updateRow(idx, "monthlySalary", e.target.value)
                    }
                    placeholder="e.g. 51,357.00"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Salary Grade & Step
                  </label>
                  <input
                    type="text"
                    value={item.salaryJobPayGradeStepIncrement}
                    onChange={(e) =>
                      updateRow(
                        idx,
                        "salaryJobPayGradeStepIncrement",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. SG 18-1"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 "
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status of Appointment
                  </label>
                  <select
                    value={item.statusOfAppointment}
                    onChange={(e) =>
                      updateRow(idx, "statusOfAppointment", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  >
                    <option value="">Select Appointment Status</option>
                    <option value="PERMANENT">PERMANENT</option>
                    <option value="TEMPORARY">TEMPORARY</option>
                    <option value="CONTRACTUAL">CONTRACTUAL</option>
                    <option value="CASUAL">CASUAL</option>
                    <option value="JOB ORDER">JOB ORDER</option>
                    <option value="CO-TERMINUS">CO-TERMINUS</option>
                    <option value="ELECTIVE">ELECTIVE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Gov't Service (Y / N)
                  </label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-1.5 text-sm text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name={`gov_${item.id || idx}`}
                        checked={item.isGovernmentService === true}
                        onChange={() =>
                          updateRow(idx, "isGovernmentService", true)
                        }
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>Yes (Government)</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-sm text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name={`gov_${item.id || idx}`}
                        checked={item.isGovernmentService === false}
                        onChange={() =>
                          updateRow(idx, "isGovernmentService", false)
                        }
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>No (Private / NGO)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Work Experience Sheet Duties Attachment Note */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-slate-400" />
                  Summary of Actual Duties (Work Experience Sheet Attachment)
                </label>
                <textarea
                  rows={2}
                  value={item.dutiesDescription || ""}
                  onChange={(e) =>
                    updateRow(idx, "dutiesDescription", e.target.value)
                  }
                  placeholder="Describe main responsibilities, supervisory scope, accomplishments..."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
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
        Add Experience
      </Button>
    </div>
  );
};

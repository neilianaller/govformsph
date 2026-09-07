import React from "react";
import { VoluntaryWorkItem } from "../../../types/pds";
import { createEmptyVoluntaryWork } from "../../../db/defaultPdsData";
import { DateInput } from "../../../components/common/DateInput";
import { Button } from "../../../components/common/Button";
import { Plus, Trash2, HeartHandshake } from "lucide-react";

interface Section7VoluntaryProps {
  data: VoluntaryWorkItem[];
  onChange: (updated: VoluntaryWorkItem[]) => void;
}

export const Section7Voluntary: React.FC<Section7VoluntaryProps> = ({
  data,
  onChange,
}) => {
  const addRow = () => {
    onChange([...data, createEmptyVoluntaryWork()]);
  };

  const removeRow = (index: number) => {
    const list = [...data];
    list.splice(index, 1);
    onChange(list);
  };

  const updateRow = (
    index: number,
    field: keyof VoluntaryWorkItem,
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
              VII
            </span>
            Voluntary Work or Involvement in Civic/NGO/PO/CSO (Item 30)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Non-profit, non-governmental, or community service engagements.
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          <HeartHandshake className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No Voluntary Work Listed
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
            If you participate in NGO or community organizations, add them here.
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
                  Involvement #{idx + 1}
                </span>
                {data.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                    title="Remove involvement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Name & Address of Organization (Write in full)
                </label>
                <input
                  type="text"
                  value={item.organizationNameAddress}
                  onChange={(e) =>
                    updateRow(idx, "organizationNameAddress", e.target.value)
                  }
                  placeholder="e.g. Philippine Red Cross - Manila Chapter, Bonifacio Drive, Port Area"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 "
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Number of Hours
                  </label>
                  <input
                    type="text"
                    value={item.numberOfHours}
                    onChange={(e) =>
                      updateRow(idx, "numberOfHours", e.target.value)
                    }
                    placeholder="e.g. 120"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Position / Nature of Work
                </label>
                <input
                  type="text"
                  value={item.positionNatureOfWork}
                  onChange={(e) =>
                    updateRow(idx, "positionNatureOfWork", e.target.value)
                  }
                  placeholder="e.g. Volunteer Disaster Relief Coordinator"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 "
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
        Add Voluntary Work
      </Button>
    </div>
  );
};

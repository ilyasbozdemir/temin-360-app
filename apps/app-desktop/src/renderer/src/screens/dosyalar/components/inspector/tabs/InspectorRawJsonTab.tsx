import React from "react";

interface InspectorRawJsonTabProps {
  payload: any;
}

export const InspectorRawJsonTab: React.FC<InspectorRawJsonTabProps> = ({
  payload,
}) => {
  return (
    <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-auto max-h-[60vh] border border-slate-800 select-all">
      {JSON.stringify(payload, null, 2)}
    </pre>
  );
};

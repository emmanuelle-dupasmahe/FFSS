'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateDevisIndicators } from "@/app/actions/dps";

interface Props {
  devisId: string;
  initialP2: number;
  initialE1: number;
  initialE2: number;
  lightMode?: boolean;
}

export default function IndicatorTable({ devisId, initialP2, initialE1, initialE2, lightMode = false }: Props) {
  const [vals, setVals] = useState({ p2: initialP2, e1: initialE1, e2: initialE2 });
  const scores = [0.25, 0.30, 0.35, 0.40];

  const handleUpdate = async (key: 'p2' | 'e1' | 'e2', value: number) => {
    setVals(prev => ({ ...prev, [key]: value }));
    try { await updateDevisIndicators(devisId, { [key]: value }); }
    catch (error) { console.error("Erreur de sauvegarde", error); }
  };

  const rows = [
    { id: 'p2', name: 'P2', value: vals.p2 },
    { id: 'e1', name: 'E1', value: vals.e1 },
    { id: 'e2', name: 'E2', value: vals.e2 },
  ];

  const bgColor = lightMode ? "bg-slate-50" : "bg-[#0B1E43]";
  const headerColor = lightMode ? "bg-slate-100" : "bg-slate-800/50";
  const textColor = lightMode ? "text-slate-900" : "text-slate-200";
  const borderColor = lightMode ? "border-slate-200" : "border-slate-700/50";

  return (
    // J'ai réduit le padding global et le rounded
    <div className={`rounded-xl border ${borderColor} overflow-hidden ${bgColor}`}>
      <Table>
        <TableHeader className={`${headerColor} border-b ${borderColor}`}>
          <TableRow className="h-6 border-none">
            <TableHead className="text-[8px] font-black uppercase py-0 px-2 text-slate-500">Indicateur</TableHead>
            {scores.map(s => (
              <TableHead key={s} className="text-[8px] font-black uppercase text-center py-0 px-1 text-slate-500">{s.toFixed(2)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className={`text-[9px] ${textColor}`}>
          {rows.map((row) => (
            <TableRow key={row.id} className={`h-6 border-b ${borderColor}`}>
              <TableCell className="font-black py-0.5 px-2">{row.name}</TableCell>
              {scores.map(s => (
                <TableCell
                  key={s}
                  className={`text-center py-0.5 px-1 cursor-pointer transition-colors ${lightMode ? 'hover:bg-slate-200' : 'hover:bg-slate-800'}`}
                  onClick={() => handleUpdate(row.id as any, s)}
                >
                  {row.value === s ? (
                    <span className="inline-block px-1.5 py-0 rounded bg-blue-600 text-white font-black text-[8px]">X</span>
                  ) : (
                    <span className="opacity-20">-</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={`p-1.5 ${lightMode ? 'bg-slate-100' : 'bg-slate-900/50'} text-[8px] text-center italic border-t ${borderColor} text-slate-500`}>
        Total (i) : {(vals.p2 + vals.e1 + vals.e2).toFixed(2).replace('.', ',')}
      </div>
    </div>
  );
}
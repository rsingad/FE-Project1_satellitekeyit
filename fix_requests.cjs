const fs = require('fs');
const file = '/media/data2/code-blaster/setellitekey-it/project0/frontend/src/pages/Requests.jsx';
let code = fs.readFileSync(file, 'utf8');

// Fix handleApprove
const oldApprove = `  const handleApprove = async (id, reqType, e) => {
    e.preventDefault();
    const payload = {};`;

const newApprove = `  const handleApprove = async (id, reqType, e) => {
    e.preventDefault();
    const payload = {};

    if (reqType === 'Non-Consumable') {
      const selectEl = e.target.elements.assetSelect;
      if (selectEl) {
        if (!selectEl.value) {
          return toast.error('Please manually select an asset to assign for this legacy request');
        }
        payload.assignedAssetId = selectEl.value;
      }
    }`;

code = code.replace(oldApprove, newApprove);

// Fix JSX
const oldJsx = `<form onSubmit={(e) => handleApprove(req._id, req.assetType, e)} className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                            <button type="submit" title="Approve" className="p-1.5 bg-emerald-500 text-white rounded-md shadow-sm hover:bg-emerald-600 transition-colors flex items-center gap-1 text-xs font-bold px-2">`;

const newJsx = `<form onSubmit={(e) => handleApprove(req._id, req.assetType, e)} className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                            {req.assetType === 'Non-Consumable' && !req.requestedAssetId && (
                              <div className="relative">
                                <select name="assetSelect" className="text-xs border-none bg-transparent font-medium text-slate-700 focus:ring-0 appearance-none pr-6 pl-2 py-1 cursor-pointer max-w-[150px]">
                                  <option value="">Assign manually...</option>
                                  {availableAssets.filter(a => a.name.toLowerCase().includes(req.assetName.toLowerCase()) || req.assetName.toLowerCase().includes(a.name.toLowerCase())).map(a => (
                                    <option key={a._id} value={a._id}>{a.name} ({a.serialNumber})</option>
                                  ))}
                                  {availableAssets.length > 0 && <option disabled>──────────</option>}
                                  {availableAssets.map(a => (
                                    <option key={a._id} value={a._id}>{a.name} ({a.serialNumber})</option>
                                  ))}
                                </select>
                                <ChevronDown size={14} className="absolute right-2 top-1.5 text-slate-400 pointer-events-none" />
                              </div>
                            )}
                            <button type="submit" title="Approve" className="p-1.5 bg-emerald-500 text-white rounded-md shadow-sm hover:bg-emerald-600 transition-colors flex items-center gap-1 text-xs font-bold px-2">`;

code = code.replace(oldJsx, newJsx);

fs.writeFileSync(file, code);
console.log("Restored manual fallback.");

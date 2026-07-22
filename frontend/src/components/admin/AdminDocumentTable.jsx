import React from 'react';
import { FileCheck, Eye, Download, Trash2 } from 'lucide-react';

export default function AdminDocumentTable({
  documents,
  isLoading,
  onPreview,
  onDelete,
  getFileUrl,
}) {
  if (isLoading) {
    return <div className="py-16 text-center text-slate-400 text-sm">Loading uploaded documents...</div>;
  }

  if (documents.length === 0) {
    return <div className="py-16 text-center text-slate-400 text-sm">No documents found in database</div>;
  }

  return (
    <table className="w-full text-left text-xs">
      <thead className="uppercase bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
        <tr>
          <th className="px-4 py-3 font-semibold">Document Name</th>
          <th className="px-4 py-3 font-semibold">Uploaded By</th>
          <th className="px-4 py-3 font-semibold">Upload Date</th>
          <th className="px-4 py-3 font-semibold">Pages / Size</th>
          <th className="px-4 py-3 font-semibold text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
        {documents.map((doc) => (
          <tr key={doc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-lg">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs">{doc.originalName}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{doc.filename}</div>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 font-medium">
              {doc.uploadedBy ? (
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {doc.uploadedBy.firstName} {doc.uploadedBy.lastName}
                  </div>
                  <div className="text-[10px] text-slate-400">{doc.uploadedBy.email}</div>
                </div>
              ) : (
                <span className="text-slate-400 italic">Student Upload</span>
              )}
            </td>
            <td className="px-4 py-3 text-slate-400">
              {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
            </td>
            <td className="px-4 py-3 text-slate-500 font-medium">
              {doc.pages || 1} Pages ({(doc.size / (1024 * 1024)).toFixed(2)} MB)
            </td>
            <td className="px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => onPreview(doc)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 transition-all"
                  title="Preview Extracted Content"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <a
                  href={getFileUrl(doc.path)}
                  target="_blank"
                  rel="noreferrer"
                  download={doc.originalName}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 transition-all"
                  title="Download Original PDF"
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  onClick={() => onDelete(doc._id, doc.originalName)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

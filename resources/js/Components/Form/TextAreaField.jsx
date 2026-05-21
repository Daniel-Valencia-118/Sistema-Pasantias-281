export default function TextAreaField({ label, error, rows = 3, ...props }) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
                {...props}
                rows={rows}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                }`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
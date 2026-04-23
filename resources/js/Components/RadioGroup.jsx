export default function RadioGroup({ options, name, selected, onChange, className = '' }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {options.map((option) => (
                <label key={option.value} className="flex items-center">
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={selected === option.value}
                        onChange={onChange}
                        className="h-4 w-4 text-primary-blue focus:ring-primary-sky-blue/20 border-gray-300"
                    />
                    <span className="ml-3 text-sm text-gray-700">{option.label}</span>
                </label>
            ))}
        </div>
    );
}
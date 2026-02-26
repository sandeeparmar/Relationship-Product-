import { useState, useEffect } from "react";
import api from "../api/api";
import { FaHeartbeat, FaFileExport, FaPlus } from "react-icons/fa";

export default function IDMPanel({ patientId, patientName }) {
    const [programs, setPrograms] = useState([]);
    const [metrics, setMetrics] = useState([]);
    const [showAddProgram, setShowAddProgram] = useState(false);
    const [showAddMetric, setShowAddMetric] = useState(false);

    // Form states
    const [newProgram, setNewProgram] = useState({ diseaseName: "", status: "ACTIVE", carePlan: "" });
    const [newMetric, setNewMetric] = useState({ metricName: "", value: "", unit: "", category: "QUALITY", disease: "" });

    useEffect(() => {
        if (patientId) {
            fetchPrograms();
            fetchMetrics();
        }
    }, [patientId]);

    const fetchPrograms = async () => {
        try {
            const res = await api.get(`/idm/programs/${patientId}`);
            setPrograms(res.data);
        } catch (err) {
            console.error("Failed to fetch programs", err);
        }
    };

    const fetchMetrics = async () => {
        try {
            const res = await api.get(`/idm/metrics/${patientId}`);
            setMetrics(res.data);
        } catch (err) {
            console.error("Failed to fetch metrics", err);
        }
    };

    const handleAddProgram = async (e) => {
        e.preventDefault();
        try {
            await api.post("/idm/programs", {
                ...newProgram,
                patientId,
                carePlan: { lifestyleAdvice: [newProgram.carePlan] } // Simplified for demo
            });
            setShowAddProgram(false);
            fetchPrograms();
            setNewProgram({ diseaseName: "", status: "ACTIVE", carePlan: "" });
        } catch (err) {
            alert("Failed to add program: " + (err.response?.data?.message || err.message));
        }
    };

    const handleAddMetric = async (e) => {
        e.preventDefault();
        try {
            await api.post("/idm/metrics", {
                ...newMetric,
                patientId
            });
            setShowAddMetric(false);
            fetchMetrics();
            setNewMetric({ metricName: "", value: "", unit: "", category: "QUALITY", disease: "" });
        } catch (err) {
            alert("Failed to add metric");
        }
    };

    const handleExportODM = async () => {
        try {
            const res = await api.get(`/odm/${patientId}/export`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `patient-${patientId}-odm.xml`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            alert("Failed to export ODM");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-inner mt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center">
                    <FaHeartbeat className="mr-2 text-red-500" />
                    Disease Management: {patientName}
                </h3>
                <button
                    onClick={handleExportODM}
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded flex items-center"
                >
                    <FaFileExport className="mr-1" /> Export ODM
                </button>
            </div>

            {/* Programs Section */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Active Programs</h4>
                    <button
                        onClick={() => setShowAddProgram(!showAddProgram)}
                        className="text-xs bg-green-600 text-white px-2 py-1 rounded flex items-center"
                    >
                        <FaPlus className="mr-1" /> Add Program
                    </button>
                </div>

                {showAddProgram && (
                    <form onSubmit={handleAddProgram} className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <input
                            className="w-full mb-2 p-1 border rounded dark:bg-gray-800 dark:text-white"
                            placeholder="Disease Name (e.g. Diabetes)"
                            value={newProgram.diseaseName}
                            onChange={e => setNewProgram({ ...newProgram, diseaseName: e.target.value })}
                            required
                        />
                        <input
                            className="w-full mb-2 p-1 border rounded dark:bg-gray-800 dark:text-white"
                            placeholder="Care Plan Note"
                            value={newProgram.carePlan}
                            onChange={e => setNewProgram({ ...newProgram, carePlan: e.target.value })}
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowAddProgram(false)} className="text-sm text-gray-500">Cancel</button>
                            <button type="submit" className="text-sm bg-indigo-600 text-white px-3 py-1 rounded">Save</button>
                        </div>
                    </form>
                )}

                {programs.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No active disease programs.</p>
                ) : (
                    <div className="space-y-2">
                        {programs.map(p => (
                            <div key={p._id} className="text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded flex justify-between">
                                <span className="font-medium text-gray-800 dark:text-gray-200">{p.diseaseName}</span>
                                <span className="text-xs px-2 py-0.5 rounded bg-green-200 text-green-800">{p.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Metrics Section */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">Health Metrics (IDM)</h4>
                    <button
                        onClick={() => setShowAddMetric(!showAddMetric)}
                        className="text-xs bg-indigo-600 text-white px-2 py-1 rounded flex items-center"
                    >
                        <FaPlus className="mr-1" /> Add Metric
                    </button>
                </div>

                {showAddMetric && (
                    <form onSubmit={handleAddMetric} className="mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                                className="p-1 border rounded dark:bg-gray-800 dark:text-white"
                                placeholder="Metric (e.g. HbA1c)"
                                value={newMetric.metricName}
                                onChange={e => setNewMetric({ ...newMetric, metricName: e.target.value })}
                                required
                            />
                            <input
                                className="p-1 border rounded dark:bg-gray-800 dark:text-white"
                                placeholder="Value"
                                type="number"
                                value={newMetric.value}
                                onChange={e => setNewMetric({ ...newMetric, value: e.target.value })}
                                required
                            />
                            <input
                                className="p-1 border rounded dark:bg-gray-800 dark:text-white"
                                placeholder="Unit (e.g. %)"
                                value={newMetric.unit}
                                onChange={e => setNewMetric({ ...newMetric, unit: e.target.value })}
                                required
                            />
                            <select
                                className="p-1 border rounded dark:bg-gray-800 dark:text-white"
                                value={newMetric.category}
                                onChange={e => setNewMetric({ ...newMetric, category: e.target.value })}
                            >
                                <option value="QUALITY">Quality</option>
                                <option value="OUTCOME">Outcome</option>
                                <option value="PROCESS">Process</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowAddMetric(false)} className="text-sm text-gray-500">Cancel</button>
                            <button type="submit" className="text-sm bg-indigo-600 text-white px-3 py-1 rounded">Save</button>
                        </div>
                    </form>
                )}

                <div className="max-h-40 overflow-y-auto space-y-1">
                    {metrics.map(m => (
                        <div key={m._id} className="text-xs grid grid-cols-4 gap-2 p-2 border-b border-gray-100 dark:border-gray-600">
                            <span className="font-medium text-gray-700 dark:text-gray-300">{m.metricName}</span>
                            <span className="text-gray-600 dark:text-gray-400">{m.value} {m.unit}</span>
                            <span className="text-gray-500 dark:text-gray-500">{m.category}</span>
                            <span className="text-right text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

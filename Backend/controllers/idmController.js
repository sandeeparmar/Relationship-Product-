import { diseaseSchema as DiseaseProgram } from "../models/DiseaseProgram.js";
import { idmMetric as IDMMetric } from "../models/IDMMetric.js";
import { User } from "../models/User.js";

export const createProgram = async (req, res) => {
    try {
        const { diseaseName, patientId, carePlan, status } = req.body;

        const existingProgram = await DiseaseProgram.findOne({ diseaseName, patientId });
        if (existingProgram) {
            return res.status(400).json({ message: "Program for this disease already exists for the patient." });
        }

        const newProgram = new DiseaseProgram({
            diseaseName,
            patientId,
            carePlan,
            assignedDoctor: req.user.id, // Assuming req.user is set by auth middleware
            status: status || "ACTIVE"
        });

        await newProgram.save();
        res.status(201).json(newProgram);
    } catch (error) {
        res.status(500).json({ message: "Error creating program", error: error.message });
    }
};

export const getPatientPrograms = async (req, res) => {
    try {
        const { patientId } = req.params;
        const programs = await DiseaseProgram.find({ patientId });
        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching programs", error: error.message });
    }
};

export const updateProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const program = await DiseaseProgram.findByIdAndUpdate(id, updates, { new: true });

        if (!program) {
            return res.status(404).json({ message: "Program not found" });
        }

        res.json(program);
    } catch (error) {
        res.status(500).json({ message: "Error updating program", error: error.message });
    }
};

export const addMetric = async (req, res) => {
    try {
        const { metricName, category, value, unit, patientId, disease } = req.body;

        const newMetric = new IDMMetric({
            metricName,
            category,
            value,
            unit,
            context: {
                doctorId: req.user.id,
                patientId,
                disease
            }
        });

        await newMetric.save();
        res.status(201).json(newMetric);
    } catch (error) {
        res.status(500).json({ message: "Error adding metric", error: error.message });
    }
};

export const getPatientMetrics = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { disease } = req.query;

        let query = { "context.patientId": patientId };
        if (disease) {
            query["context.disease"] = disease;
        }

        const metrics = await IDMMetric.find(query).sort({ createdAt: -1 });
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ message: "Error fetching metrics", error: error.message });
    }
};

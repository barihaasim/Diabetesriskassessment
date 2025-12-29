/* Path: diabetes-project/backend-node/server.js */
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Path to cpp-logic folder
const cppLogicPath = path.resolve(__dirname, '..', 'cpp-logic');

// Helper function to parse C++ output
const parseCppOutput = (output) => {
    const lines = output.split('\n');
    let result = {
        score: 0,
        bmi: 0,
        bmiCategory: "",
        riskFactors: [],
        assessment: "Unknown",
        recommendations: [],
        averageScore: 0,
        totalAssessments: 0
    };

    let inRecommendations = false;

    lines.forEach(line => {
        if (line.includes("Total Risk Score:")) {
            result.score = parseInt(line.split(":")[1].trim());
        }
        if (line.includes("BMI:")) {
            const bmiMatch = line.match(/BMI:\s*([\d.]+)\s*\(([^)]+)\)/);
            if (bmiMatch) {
                result.bmi = parseFloat(bmiMatch[1]);
                result.bmiCategory = bmiMatch[2];
            }
        }
        if (line.includes("Question") && line.includes("Points:")) {
            result.riskFactors.push(line.trim());
        }
        // Check for any of the 6 risk levels
        if (line.includes("CRITICAL Risk:") || line.includes("HIGH Risk:") ||
            line.includes("ELEVATED Risk:") || line.includes("MODERATE Risk:") ||
            line.includes("LOW Risk:") || line.includes("MINIMAL Risk:")) {
            result.assessment = line.trim();
            inRecommendations = false;
        }
        // Parse recommendations
        if (line.includes("RECOMMENDATIONS:")) {
            inRecommendations = true;
        }
        else if (inRecommendations && line.trim().startsWith("-")) {
            result.recommendations.push(line.trim().substring(2).trim());
        }
        // Parse statistics
        if (line.includes("Average Score:")) {
            result.averageScore = parseFloat(line.split(":")[1].trim());
        }
        if (line.includes("Total Assessments:")) {
            result.totalAssessments = parseInt(line.split(":")[1].trim());
        }
    });
    return result;
};

// Main evaluation endpoint
app.post('/api/evaluate', (req, res) => {
    const { answers, height, weight } = req.body;

    if (!answers || answers.length === 0) {
        return res.status(400).json({ error: "No answers provided" });
    }

    const exePath = path.resolve(cppLogicPath, 'diabetes_tool');
    const child = spawn(exePath, [], { cwd: cppLogicPath });

    let outputData = "";
    let errorData = "";

    // Send height, weight first, then answers
    const inputData = [height || 0, weight || 0, ...answers].join('\n');
    child.stdin.write(inputData);
    child.stdin.end();

    child.stdout.on('data', (data) => {
        outputData += data.toString();
    });

    child.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error(`C++ Error: ${data}`);
    });

    child.on('close', (code) => {
        if (code !== 0) {
            console.error("C++ process failed:", errorData);
            return res.status(500).json({ error: "Assessment process failed" });
        }
        const parsedResult = parseCppOutput(outputData);
        res.json(parsedResult);
    });
});

// History endpoint
app.get('/api/history', (req, res) => {
    const historyPath = path.resolve(cppLogicPath, 'history.txt');

    if (!fs.existsSync(historyPath)) {
        return res.json({ history: [] });
    }

    try {
        const content = fs.readFileSync(historyPath, 'utf-8');
        const lines = content.trim().split('\n').filter(line => line.trim());

        const history = lines.map(line => {
            // Parse: "2025-12-22 15:00:00 | Score: 15 | BMI: 24.5 | Risk: MODERATE"
            const parts = line.split(' | ');
            return {
                timestamp: parts[0] || '',
                score: parts[1] ? parts[1].replace('Score: ', '') : '',
                bmi: parts[2] ? parts[2].replace('BMI: ', '') : '',
                risk: parts[3] ? parts[3].replace('Risk: ', '') : ''
            };
        }).reverse(); // Most recent first

        res.json({ history });
    } catch (error) {
        console.error("Error reading history:", error);
        res.status(500).json({ error: "Failed to read history" });
    }
});

// Get statistics
app.get('/api/stats', (req, res) => {
    const statsPath = path.resolve(cppLogicPath, 'stats.txt');

    if (!fs.existsSync(statsPath)) {
        return res.json({ totalUsers: 0, averageScore: 0 });
    }

    try {
        const content = fs.readFileSync(statsPath, 'utf-8').trim();
        const [totalUsers, sumOfScores] = content.split(' ').map(Number);
        const averageScore = totalUsers > 0 ? sumOfScores / totalUsers : 0;

        res.json({ totalUsers, averageScore });
    } catch (error) {
        console.error("Error reading stats:", error);
        res.status(500).json({ error: "Failed to read stats" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend Server running on port ${PORT}`);
});
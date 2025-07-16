import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, LineChart, Line
} from 'recharts';

// Data for Machine Learning Algorithm descriptions
const algorithmDescriptions = {
  'Logistic Regression': {
    title: 'Logistic Regression',
    description: 'Logistic Regression is a statistical model that in its basic form uses a logistic function to model a binary dependent variable, although many more complex extensions exist. In regression analysis, logistic regression (or logit regression) is estimating the parameters of a logistic model (a form of binary regression). Mathematically, it models the probability of a certain class or event existing, such as pass/fail, win/lose, alive/dead or healthy/sick. This can be extended to model several classes of events, such as determining whether an image contains a cat, dog, lion, etc.',
    type: 'Classification'
  },
  'Decision Tree': {
    title: 'Decision Tree',
    description: 'A Decision Tree is a flowchart-like structure in which each internal node represents a "test" on an attribute (e.g., whether a coin flip comes up heads or tails), each branch represents the outcome of the test, and each leaf node represents a class label (decision taken after computing all attributes). The paths from root to leaf represent classification rules.',
    type: 'Classification/Regression'
  },
  'Random Forest': {
    title: 'Random Forest',
    description: 'Random Forest is an ensemble learning method for classification, regression and other tasks that operates by constructing a multitude of decision trees at training time. For classification tasks, the output of the random forest is the class selected by most trees. For regression tasks, the mean or average prediction of the individual trees is returned. Random forests correct for decision trees\' habit of overfitting to their training set.',
    type: 'Classification/Regression'
  },
  'KNN': {
    title: 'K-Nearest Neighbors (KNN)',
    description: 'K-Nearest Neighbors (KNN) is a non-parametric, lazy learning algorithm. It is used for both classification and regression. In both cases, the input consists of the k closest training examples in the feature space. The output depends on whether KNN is used for classification or regression: in KNN classification, the output is a class membership. An object is classified by a majority vote of its neighbors, with the object being assigned to the class most common among its k nearest neighbors (k is a positive integer, typically small). In KNN regression, the output is the property value for the object. This value is the average of the values of k nearest neighbors.',
    type: 'Classification/Regression'
  },
  'SVM': {
    title: 'Support Vector Machine (SVM)',
    description: 'Support Vector Machines (SVMs) are supervised learning models with associated learning algorithms that analyze data for classification and regression analysis. Given a set of training examples, each marked as belonging to one of two categories, an SVM training algorithm builds a model that assigns new examples to one category or the other, making it a non-probabilistic binary linear classifier. An SVM model is a representation of the examples as points in space, mapped so that the examples of the separate categories are divided by a clear gap that is as wide as possible. New examples are then mapped into that same space and predicted to belong to a category based on which side of the gap they fall.',
    type: 'Classification/Regression'
  },
  'Gradient Boosting': {
    title: 'Gradient Boosting',
    description: 'Gradient Boosting is a machine learning technique for regression and classification problems, which produces a prediction model in the form of an ensemble of weak prediction models, typically decision trees. It builds the model in a stage-wise fashion like other boosting methods, and it generalizes them by allowing optimization of an arbitrary differentiable loss function. It is one of the most powerful techniques for building predictive models.',
    type: 'Classification/Regression'
  },
  'Neural Network': {
    title: 'Neural Network',
    description: 'A Neural Network is a series of algorithms that endeavors to recognize underlying relationships in a set of data through a process that mimics the way the human brain operates. Neural networks can adapt to changing input; so the network generates the best possible result without needing to redesign the output criteria. They are used for a wide variety of tasks, including image recognition, natural language processing, and pattern recognition.',
    type: 'Classification/Regression/Clustering'
  },
  'K-Means Clustering': {
    title: 'K-Means Clustering',
    description: 'K-Means Clustering is an unsupervised learning algorithm that aims to partition n observations into k clusters in which each observation belongs to the cluster with the nearest mean (cluster centers or cluster centroid), serving as a prototype of the cluster. This results in a partitioning of the data space into Voronoi cells. K-Means clustering is used to group data points into distinct clusters based on their similarity.',
    type: 'Clustering (Unsupervised)'
  }
};


// Main App component
const App = () => {
  // State variables for managing application data and UI
  const [csvData, setCsvData] = useState(null); // Stores parsed CSV data
  const [columnInfo, setColumnInfo] = useState([]); // Stores metadata about each column
  const [llmSummary, setLlmSummary] = useState(''); // Stores the AI-generated dataset summary
  const [selectedChartType, setSelectedChartType] = useState('bar'); // Controls which chart type is displayed
  const [selectedXAxis, setSelectedXAxis] = useState(''); // Selected column for X-axis in charts
  const [selectedYAxis, setSelectedYAxis] = useState(''); // Selected column for Y-axis in charts
  const [targetVariable, setTargetVariable] = useState(''); // Selected column for ML target
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(''); // Selected ML algorithm
  const [modelMetrics, setModelMetrics] = useState(null); // Stores simulated ML model metrics
  const [isLoading, setIsLoading] = useState(false); // General loading indicator
  const [error, setError] = useState(''); // Stores error messages
  const [showModal, setShowModal] = useState(false); // State for custom modal (general purpose)
  const [modalMessage, setModalMessage] = useState(''); // Message for custom modal
  const [showAlgorithmInfoModal, setShowAlgorithmInfoModal] = useState(false); // State for algorithm info modal
  const [currentAlgorithmInfo, setCurrentAlgorithmInfo] = useState(null); // Stores info for selected algorithm


  // Helper function to show a custom modal instead of alert/confirm
  const showCustomModal = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Utility function to parse CSV text into an array of objects
  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue; // Skip malformed rows

      const row = {};
      headers.forEach((header, index) => {
        let value = values[index];
        // Attempt to convert to number
        if (!isNaN(Number(value)) && value !== '') {
          row[header] = Number(value);
        } else if (value.toLowerCase() === 'true') {
          row[header] = true;
        } else if (value.toLowerCase() === 'false') {
          row[header] = false;
        } else {
          row[header] = value;
        }
      });
      data.push(row);
    }
    return data;
  };

  // Handles the file upload event
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setError('No file selected.');
      return;
    }
    if (file.type !== 'text/csv') {
      setError('Please upload a CSV file.');
      return;
    }

    setIsLoading(true);
    setError('');
    setLlmSummary('');
    setColumnInfo([]);
    setCsvData(null);
    setModelMetrics(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const parsedData = parseCSV(text);
        if (parsedData.length === 0) {
          setError('CSV file is empty or could not be parsed.');
          setIsLoading(false);
          return;
        }
        setCsvData(parsedData);
        const info = analyzeData(parsedData);
        await generateLLMSummary(info, parsedData);
      } catch (err) {
        setError(`Error parsing file: ${err.message}`);
        console.error("File parsing error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  // Analyzes the parsed data to extract column information and statistics
  const analyzeData = (data) => {
    if (!data || data.length === 0) return [];

    const firstRow = data[0];
    const columns = Object.keys(firstRow);
    const info = columns.map(colName => {
      let uniqueValues = new Set();
      let missingCount = 0;
      let numericalValues = [];
      let isNumerical = true;
      let isDate = false;

      data.forEach(row => {
        const value = row[colName];
        if (value === undefined || value === null || value === '') {
          missingCount++;
        } else {
          uniqueValues.add(value);
          if (typeof value === 'number') {
            numericalValues.push(value);
          } else if (!isNaN(Number(value)) && value !== '') {
            numericalValues.push(Number(value));
          } else {
            isNumerical = false;
            // Basic date detection (can be improved)
            if (!isNaN(new Date(value).getTime()) && (new Date(value).toISOString().slice(0, 10) === value || new Date(value).getFullYear() > 1900)) {
                isDate = true;
            }
          }
        }
      });

      let dataType = 'Categorical'; // Default
      if (isNumerical && numericalValues.length > 0) {
        dataType = 'Numerical';
      } else if (isDate) {
        dataType = 'Date';
      }
      else if (uniqueValues.size / data.length < 0.1 && uniqueValues.size > 1 && uniqueValues.size < 50) { // Heuristic for categorical
        dataType = 'Categorical';
      } else if (uniqueValues.size === data.length) {
        dataType = 'ID/Unique';
      } else {
        dataType = 'Text';
      }

      let stats = {};
      if (dataType === 'Numerical' && numericalValues.length > 0) {
        const sortedValues = [...numericalValues].sort((a, b) => a - b);
        const sum = numericalValues.reduce((acc, val) => acc + val, 0);
        const mean = sum / numericalValues.length;
        const median = numericalValues.length % 2 === 0
          ? (sortedValues[numericalValues.length / 2 - 1] + sortedValues[numericalValues.length / 2]) / 2
          : sortedValues[Math.floor(numericalValues.length / 2)];
        const min = sortedValues[0];
        const max = sortedValues[sortedValues.length - 1];
        const variance = numericalValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericalValues.length;
        const stdDev = Math.sqrt(variance);

        stats = { mean: parseFloat(mean.toFixed(2)), median: parseFloat(median.toFixed(2)), min, max, stdDev: parseFloat(stdDev.toFixed(2)) };
      }

      return {
        name: colName,
        dataType,
        uniqueCount: uniqueValues.size,
        missingCount,
        missingPercentage: ((missingCount / data.length) * 100).toFixed(2),
        stats,
        values: Array.from(uniqueValues) // Store unique values for categorical charts
      };
    });
    setColumnInfo(info);
    return info;
  };

  // Generates a summary of the dataset using the Gemini API
  const generateLLMSummary = async (info, sampleData) => {
    setIsLoading(true);
    setError('');
    try {
      const prompt = `Analyze the following dataset information and provide a concise, clear understanding of what the dataset is about, its main characteristics, and what kind of data it contains. Focus on key columns and their types, and any interesting patterns or missing data.

Dataset Structure (Column Info):
${JSON.stringify(info.map(col => ({ name: col.name, dataType: col.dataType, uniqueCount: col.uniqueCount, missingPercentage: col.missingPercentage, stats: col.stats })), null, 2)}

Sample Data (first 5 rows):
${JSON.stringify(sampleData.slice(0, 5), null, 2)}

Provide a summary in a paragraph or two.`;

      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this.
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setLlmSummary(text);
      } else {
        setError('Failed to get AI summary. Unexpected response structure.');
        console.error('AI response error:', result);
      }
    } catch (err) {
      setError(`Error generating AI summary: ${err.message}`);
      console.error('AI fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulates the training of a machine learning model
  const trainModel = () => {
    // K-Means is unsupervised, so it doesn't require a target variable
    if (selectedAlgorithm !== 'K-Means Clustering' && (!targetVariable || !selectedAlgorithm)) {
      showCustomModal("Please select a target variable and an algorithm before training.");
      return;
    }
    // For K-Means, ensure at least one numerical feature is available
    if (selectedAlgorithm === 'K-Means Clustering' && numericalColumns.length === 0) {
      showCustomModal("K-Means Clustering requires at least one numerical column for features.");
      return;
    }


    setIsLoading(true);
    setError('');
    setModelMetrics(null); // Clear previous metrics

    // Simulate training time
    setTimeout(() => {
      let metrics = {};
      const targetColInfo = columnInfo.find(col => col.name === targetVariable);

      if (selectedAlgorithm === 'K-Means Clustering') {
        metrics = {
          algorithm: selectedAlgorithm,
          message: `Simulated K-Means Clustering completed! (e.g., 3 clusters formed)`
        };
      } else if (targetColInfo && targetColInfo.dataType === 'Numerical') {
        // Simulated Regression metrics for Numerical target
        metrics = {
          algorithm: selectedAlgorithm,
          target: targetVariable,
          rSquared: (Math.random() * 0.5 + 0.5).toFixed(2), // 0.5 to 1.0
          mse: (Math.random() * 100).toFixed(2),
          message: `Simulated ${selectedAlgorithm} Regression Model Trained Successfully!`
        };
      } else if (targetColInfo && (targetColInfo.dataType === 'Categorical' || targetColInfo.dataType === 'Text')) {
        // Simulated Classification metrics for Categorical/Text target
        metrics = {
          algorithm: selectedAlgorithm,
          target: targetVariable,
          accuracy: (Math.random() * 0.2 + 0.7).toFixed(2), // 0.7 to 0.9
          precision: (Math.random() * 0.2 + 0.7).toFixed(2),
          recall: (Math.random() * 0.2 + 0.7).toFixed(2),
          message: `Simulated ${selectedAlgorithm} Classification Model Trained Successfully!`
        };
      } else {
        metrics = {
          algorithm: selectedAlgorithm,
          target: targetVariable,
          message: `Simulated ${selectedAlgorithm} Model Trained! (No specific metrics for this target type)`
        };
      }
      setModelMetrics(metrics);
      setIsLoading(false);
      showCustomModal(metrics.message);
    }, 1500); // Simulate 1.5 seconds training
  };

  // Memoize data for charts to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    if (!csvData || !selectedXAxis) return [];

    const xColInfo = columnInfo.find(col => col.name === selectedXAxis);
    const yColInfo = columnInfo.find(col => col.name === selectedYAxis);

    if (selectedChartType === 'bar' && xColInfo && xColInfo.dataType === 'Categorical') {
      // For categorical bar charts, count occurrences
      const counts = {};
      csvData.forEach(row => {
        const value = row[selectedXAxis];
        if (value !== undefined && value !== null && value !== '') {
          counts[value] = (counts[value] || 0) + 1;
        }
      });
      return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    } else if (selectedChartType === 'histogram' && xColInfo && xColInfo.dataType === 'Numerical') {
      // For numerical histograms, create bins
      const values = csvData.map(row => row[selectedXAxis]).filter(v => typeof v === 'number' && !isNaN(v));
      if (values.length === 0) return [];

      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const binCount = 10; // Fixed number of bins for simplicity
      const binWidth = (maxVal - minVal) / binCount;

      const bins = Array(binCount).fill(0).map((_, i) => ({
        range: `${(minVal + i * binWidth).toFixed(2)} - ${(minVal + (i + 1) * binWidth).toFixed(2)}`,
        count: 0
      }));

      values.forEach(val => {
        let binIndex = Math.floor((val - minVal) / binWidth);
        if (binIndex === binCount) binIndex--; // Adjust for max value falling into last bin
        if (binIndex >= 0 && binIndex < binCount) {
          bins[binIndex].count++;
        }
      });
      return bins;
    } else if (selectedChartType === 'scatter' && xColInfo && xColInfo.dataType === 'Numerical' && yColInfo && yColInfo.dataType === 'Numerical') {
      // For scatter plots, use raw numerical data
      return csvData.map(row => ({
        x: row[selectedXAxis],
        y: row[selectedYAxis]
      })).filter(d => typeof d.x === 'number' && !isNaN(d.x) && typeof d.y === 'number' && !isNaN(d.y));
    } else if (selectedChartType === 'line' && xColInfo && xColInfo.dataType === 'Date' && yColInfo && yColInfo.dataType === 'Numerical') {
      // For line charts, sort by date and use numerical value
      return csvData
        .map(row => ({
          date: new Date(row[selectedXAxis]),
          value: row[selectedYAxis]
        }))
        .filter(d => !isNaN(d.date) && typeof d.value === 'number' && !isNaN(d.value))
        .sort((a, b) => a.date - b.date)
        .map(d => ({ ...d, date: d.date.toLocaleDateString() })); // Format date for display
    }
    return [];
  }, [csvData, selectedChartType, selectedXAxis, selectedYAxis, columnInfo]);


  // Effect to set initial selected axes when column info changes
  useEffect(() => {
    if (columnInfo.length > 0) {
      // Set default X-axis to the first categorical or numerical column
      const firstCategorical = columnInfo.find(col => col.dataType === 'Categorical');
      const firstNumerical = columnInfo.find(col => col.dataType === 'Numerical');
      const firstDate = columnInfo.find(col => col.dataType === 'Date');

      if (firstCategorical) {
        setSelectedXAxis(firstCategorical.name);
        setSelectedChartType('bar');
      } else if (firstNumerical) {
        setSelectedXAxis(firstNumerical.name);
        setSelectedChartType('histogram');
      }

      // Set default Y-axis for scatter/line if applicable
      if (firstNumerical && columnInfo.length > 1) {
        const secondNumerical = columnInfo.find(col => col.name !== firstNumerical.name && col.dataType === 'Numerical');
        if (secondNumerical) {
          setSelectedYAxis(secondNumerical.name);
        }
      }
      if (firstDate && firstNumerical) {
        setSelectedYAxis(firstNumerical.name);
      }
    }
  }, [columnInfo]);

  // Filter columns for dropdowns
  const numericalColumns = columnInfo.filter(col => col.dataType === 'Numerical');
  const categoricalColumns = columnInfo.filter(col => col.dataType === 'Categorical');
  const allFeatureColumns = columnInfo.filter(col => col.dataType !== 'ID/Unique'); // All columns except IDs for ML features
  const mlTargetOptions = columnInfo.filter(col => col.dataType === 'Numerical' || col.dataType === 'Categorical' || col.dataType === 'Text');


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 font-inter p-4 sm:p-8">
      {/* Custom Modal (General Purpose) */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Notification</h3>
            <p className="text-gray-700 mb-6">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Algorithm Info Modal */}
      {showAlgorithmInfoModal && currentAlgorithmInfo && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg text-left">
            <h3 className="text-2xl font-bold mb-4 text-blue-700">{currentAlgorithmInfo.title}</h3>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Type:</span> {currentAlgorithmInfo.type}
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">{currentAlgorithmInfo.description}</p>
            <button
              onClick={() => setShowAlgorithmInfoModal(false)}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200"
            >
              Got It!
            </button>
          </div>
        </div>
      )}

      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 mb-2">
          Data Insights & ML Playground
        </h1>
        <p className="text-lg sm:text-xl text-gray-600">
          Upload your CSV, understand your data, visualize, and experiment with ML algorithms.
        </p>
      </header>

      {/* File Upload Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">1. Upload Your Dataset</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <label htmlFor="csv-upload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
            Choose CSV File
          </label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          {csvData && (
            <span className="text-green-700 font-medium">
              File uploaded successfully! ({csvData.length} rows)
            </span>
          )}
        </div>
        {isLoading && (
          <p className="text-center text-blue-500 mt-4 flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing data...
          </p>
        )}
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </section>

      {csvData && (
        <>
          {/* Dataset Overview Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">2. Dataset Overview</h2>

            {/* AI-Generated Summary */}
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">AI-Generated Summary:</h3>
              {llmSummary ? (
                <p className="text-gray-700 leading-relaxed">{llmSummary}</p>
              ) : (
                <p className="text-gray-500 italic">Generating AI summary...</p>
              )}
            </div>

            {/* Data Preview Table */}
            <h3 className="text-xl font-semibold text-blue-700 mb-3">Data Preview (First 5 Rows):</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                <thead className="bg-blue-100">
                  <tr>
                    {Object.keys(csvData[0]).map((key) => (
                      <th key={key} className="py-2 px-4 border-b border-gray-300 text-left text-sm font-semibold text-blue-700">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Column Information Table */}
            <h3 className="text-xl font-semibold text-blue-700 mb-3">Column Information:</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-300 text-left text-sm font-semibold text-blue-700">Column Name</th>
                    <th className="py-2 px-4 border-b border-gray-300 text-left text-sm font-semibold text-blue-700">Data Type</th>
                    <th className="py-2 px-4 border-b border-gray-300 text-left text-sm font-semibold text-blue-700">Unique Values</th>
                    <th className="py-2 px-4 border-b border-gray-300 text-left text-sm font-semibold text-blue-700">Missing (%)</th>
                    <th className="py-2 px-4 border-b border-gray-300 text-left text-sm font-semibold text-blue-700">Min</th>
                    <th className="py-2 px-4 border-b border-gray-300 text-left text-sm font-semibold text-blue-700">Max</th>
                    <th className="py-2 px-4 border-b border-gray-300 text-left text-sm font-semibold text-blue-700">Mean</th>
                    <th className="py-2 px-4 border-b border-gray-300 text-left text-sm font-semibold text-blue-700">Median</th>
                    <th className="py-2 px-4 border-b border-gray-300 text-left text-sm font-semibold text-blue-700">Std Dev</th>
                  </tr>
                </thead>
                <tbody>
                  {columnInfo.map((col, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700 font-medium">{col.name}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{col.dataType}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{col.uniqueCount}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{col.missingPercentage}%</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{col.stats.min !== undefined ? col.stats.min : 'N/A'}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{col.stats.max !== undefined ? col.stats.max : 'N/A'}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{col.stats.mean !== undefined ? col.stats.mean : 'N/A'}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{col.stats.median !== undefined ? col.stats.median : 'N/A'}</td>
                      <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-700">{col.stats.stdDev !== undefined ? col.stats.stdDev : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Data Visualization Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">3. Data Visualization</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Chart Type Selector */}
              <div>
                <label htmlFor="chart-type" className="block text-sm font-medium text-gray-700 mb-1">Chart Type:</label>
                <select
                  id="chart-type"
                  value={selectedChartType}
                  onChange={(e) => setSelectedChartType(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                >
                  <option value="">Select Chart Type</option>
                  <option value="bar">Bar Chart (Categorical X)</option>
                  <option value="histogram">Histogram (Numerical X)</option>
                  <option value="scatter">Scatter Plot (Numerical X & Y)</option>
                  <option value="line">Line Chart (Date X, Numerical Y)</option>
                </select>
              </div>

              {/* X-Axis Selector */}
              <div>
                <label htmlFor="x-axis" className="block text-sm font-medium text-gray-700 mb-1">X-Axis:</label>
                <select
                  id="x-axis"
                  value={selectedXAxis}
                  onChange={(e) => setSelectedXAxis(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                >
                  <option value="">Select X-Axis Column</option>
                  {columnInfo.map(col => (
                    <option key={col.name} value={col.name}>{col.name} ({col.dataType})</option>
                  ))}
                </select>
              </div>

              {/* Y-Axis Selector (Conditional) */}
              {(selectedChartType === 'scatter' || selectedChartType === 'line') && (
                <div>
                  <label htmlFor="y-axis" className="block text-sm font-medium text-gray-700 mb-1">Y-Axis:</label>
                  <select
                    id="y-axis"
                    value={selectedYAxis}
                    onChange={(e) => setSelectedYAxis(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                  >
                    <option value="">Select Y-Axis Column</option>
                    {numericalColumns.map(col => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Chart Rendering Area */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[300px] flex items-center justify-center">
              {chartData.length > 0 && selectedXAxis ? (
                <ResponsiveContainer width="100%" height={400}>
                  {selectedChartType === 'bar' && columnInfo.find(col => col.name === selectedXAxis)?.dataType === 'Categorical' && (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
                      <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#4299e1" name="Count" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  )}
                  {selectedChartType === 'histogram' && columnInfo.find(col => col.name === selectedXAxis)?.dataType === 'Numerical' && (
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
                      <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#48bb78" name="Frequency" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  )}
                  {selectedChartType === 'scatter' &&
                    columnInfo.find(col => col.name === selectedXAxis)?.dataType === 'Numerical' &&
                    columnInfo.find(col => col.name === selectedYAxis)?.dataType === 'Numerical' && (
                      <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis type="number" dataKey="x" name={selectedXAxis} label={{ value: selectedXAxis, position: 'bottom', offset: 0 }} />
                        <YAxis type="number" dataKey="y" name={selectedYAxis} label={{ value: selectedYAxis, angle: -90, position: 'insideLeft' }} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Legend />
                        <Scatter name="Data Points" data={chartData} fill="#f6ad55" />
                      </ScatterChart>
                    )}
                  {selectedChartType === 'line' &&
                    columnInfo.find(col => col.name === selectedXAxis)?.dataType === 'Date' &&
                    columnInfo.find(col => col.name === selectedYAxis)?.dataType === 'Numerical' && (
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="date" label={{ value: selectedXAxis, position: 'bottom', offset: 0 }} />
                        <YAxis label={{ value: selectedYAxis, angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} name={selectedYAxis} />
                      </LineChart>
                    )}
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 italic">Select a chart type and appropriate columns to see a visualization.</p>
              )}
            </div>
          </section>

          {/* Machine Learning Section */}
          <section className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">4. Machine Learning Playground</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Target Variable Selector */}
              <div>
                <label htmlFor="target-variable" className="block text-sm font-medium text-gray-700 mb-1">Select Target Variable:</label>
                <select
                  id="target-variable"
                  value={targetVariable}
                  onChange={(e) => setTargetVariable(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                  // Disable target selection for K-Means
                  disabled={selectedAlgorithm === 'K-Means Clustering'}
                >
                  <option value="">Choose a column</option>
                  {mlTargetOptions.map(col => (
                    <option key={col.name} value={col.name}>{col.name} ({col.dataType})</option>
                  ))}
                </select>
              </div>

              {/* Algorithm Selector */}
              <div>
                <label htmlFor="ml-algorithm" className="block text-sm font-medium text-gray-700 mb-1">Select Algorithm:</label>
                <select
                  id="ml-algorithm"
                  value={selectedAlgorithm}
                  onChange={(e) => {
                    const algoName = e.target.value;
                    setSelectedAlgorithm(algoName);
                    // Clear target variable if K-Means is selected
                    if (algoName === 'K-Means Clustering') {
                      setTargetVariable('');
                    }
                    // Show algorithm info modal
                    if (algoName && algorithmDescriptions[algoName]) {
                      setCurrentAlgorithmInfo(algorithmDescriptions[algoName]);
                      setShowAlgorithmInfoModal(true);
                    } else {
                      setCurrentAlgorithmInfo(null);
                      setShowAlgorithmInfoModal(false);
                    }
                  }}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                >
                  <option value="">Choose an algorithm</option>
                  <option value="Logistic Regression">Logistic Regression</option>
                  <option value="Decision Tree">Decision Tree</option>
                  <option value="Random Forest">Random Forest</option>
                  <option value="KNN">K-Nearest Neighbors (KNN)</option>
                  <option value="SVM">Support Vector Machine (SVM)</option>
                  <option value="Gradient Boosting">Gradient Boosting</option>
                  <option value="Neural Network">Neural Network</option>
                  <option value="K-Means Clustering">K-Means Clustering (Unsupervised)</option>
                </select>
              </div>
            </div>

            <button
              onClick={trainModel}
              disabled={isLoading || (!targetVariable && selectedAlgorithm !== 'K-Means Clustering') || !selectedAlgorithm || (selectedAlgorithm === 'K-Means Clustering' && numericalColumns.length === 0)}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-md transition duration-300 ease-in-out ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 transform hover:scale-105'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Training Model...
                </span>
              ) : (
                'Train Model (Simulated)'
              )}
            </button>

            {/* Model Metrics Display */}
            {modelMetrics && (
              <div className="mt-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-xl font-semibold text-purple-700 mb-3">Simulated Model Results:</h3>
                <p className="text-gray-700">
                  <span className="font-medium">Algorithm:</span> {modelMetrics.algorithm}
                </p>
                {modelMetrics.target && (
                  <p className="text-gray-700">
                    <span className="font-medium">Target Variable:</span> {modelMetrics.target}
                  </p>
                )}
                {modelMetrics.accuracy && (
                  <p className="text-gray-700">
                    <span className="font-medium">Accuracy:</span> {modelMetrics.accuracy}
                  </p>
                )}
                {modelMetrics.rSquared && (
                  <p className="text-gray-700">
                    <span className="font-medium">R-squared:</span> {modelMetrics.rSquared}
                  </p>
                )}
                {modelMetrics.precision && (
                  <p className="text-gray-700">
                    <span className="font-medium">Precision:</span> {modelMetrics.precision}
                  </p>
                )}
                {modelMetrics.recall && (
                  <p className="text-gray-700">
                    <span className="font-medium">Recall:</span> {modelMetrics.recall}
                  </p>
                )}
                <p className="text-gray-600 italic mt-2">{modelMetrics.message}</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default App;

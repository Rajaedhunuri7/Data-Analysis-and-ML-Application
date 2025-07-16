# Data-Analysis-and-ML-Application

Data Insights & ML Playground
This is a client-side React web application designed to help users explore datasets, visualize data, and experiment with various machine learning algorithms in a simulated environment. Users can upload their own CSV files and gain quick insights into their data.

Features
CSV File Upload: Easily upload any CSV dataset.

Dataset Overview:

Data Preview: See the first few rows of your uploaded dataset.

Column Information: Get detailed insights into each column, including:

Column Name

Inferred Data Type (Numerical, Categorical, Text, Date, ID/Unique)

Number of Unique Values

Count and Percentage of Missing Values

Summary Statistics (Mean, Median, Min, Max, Standard Deviation) for numerical columns.

AI-Generated Summary: A concise, human-readable summary of the dataset's characteristics, powered by the Gemini API, providing immediate understanding.

Data Visualization:

Generate interactive charts to visualize your data.

Supported chart types include:

Bar Charts: For categorical data distributions.

Histograms: For numerical data distributions.

Scatter Plots: To explore relationships between two numerical variables.

Line Charts: For time-series data (Date vs. Numerical).

Select X and Y axes dynamically.

Machine Learning Playground (Simulated):

Select a target variable for supervised learning tasks.

Choose from a variety of machine learning algorithms:

Logistic Regression

Decision Tree

Random Forest

K-Nearest Neighbors (KNN)

Support Vector Machine (SVM)

Gradient Boosting

Neural Network

K-Means Clustering (Unsupervised - no target variable needed)

Simulated Training: Experience a basic, client-side simulation of model training.

Simulated Metrics: View basic evaluation metrics (e.g., Accuracy, R-squared, Precision, Recall) for classification and regression tasks.

Technologies Used
React.js: For building the user interface.

Tailwind CSS: For responsive and utility-first styling.

Recharts: For creating interactive data visualizations.

Google Gemini API: For generating AI-powered dataset summaries.

How to Set Up and Run Locally
Clone the repository:

git clone <your-repository-url>
cd data-insights-ml-playground

Install dependencies:

npm install
# or
yarn install

Run the application:

npm start
# or
yarn start

The application will open in your browser, usually at http://localhost:3000.

Important Notes
Client-Side ML Simulation: The machine learning algorithms implemented in this application are simulated for demonstration purposes. They do not perform actual complex model training or predictions on the client side. For real-world machine learning tasks, a dedicated backend with libraries like Python's Scikit-learn, TensorFlow, or PyTorch would be required.

API Key for Gemini: The Gemini API key is handled by the Canvas environment. If you are running this outside of Canvas, you would need to manage your own API key for the Gemini API call.

Future Enhancements
Integration with a backend for real machine learning model training and prediction.

More advanced data preprocessing and cleaning options (e.g., imputation, encoding categorical features).

Additional visualization types and customization options.

Support for other data formats (e.g., JSON).

Saving and loading of analysis sessions or trained models.

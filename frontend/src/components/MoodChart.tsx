import React, { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import { API_BASE_URL } from "../api";

Chart.register(...registerables);

interface MoodSummaryResponse {
  mood_counts: { [key: string]: number };
  total_entries: number;
  range: string;
}

type RangeOption = "week" | "month" | "year";

const MoodChart: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("week");
  const [moodData, setMoodData] = useState<MoodSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    fetchMoodData();
  }, [selectedRange]);

  useEffect(() => {
    if (moodData && chartRef.current) {
      createChart();
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [moodData]);

  const fetchMoodData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("access_token");
      if (!token) {
        setError("No access token found.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/moods/summary?range=${selectedRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `application/json`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error. status: ${response.status}`);
      }

      const data: MoodSummaryResponse = await response.json();
      setMoodData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mood data");
    } finally {
      setLoading(false);
    }
  };

  const createChart = () => {
    if (!chartRef.current || !moodData) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const moods = Object.keys(moodData.mood_counts);
    const counts = Object.values(moodData.mood_counts);

    const colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#FF6384",
      "#C9CBCF",
    ];

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: moods,
        datasets: [
          {
            label: "Count",
            data: counts,
            backgroundColor: colors.slice(0, moods.length),
            borderColor: colors.slice(0, moods.length),
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Mood Distribution - ${
              selectedRange.charAt(0).toUpperCase() + selectedRange.slice(1)
            }`,
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
            title: {
              display: true,
              text: "Number of Songs",
            },
          },
          x: {
            title: {
              display: true,
              text: "Mood",
            },
          },
        },
      },
    });
  };

  const handleRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRange(event.target.value as RangeOption);
  };

  if (loading) {
    return (
      <div className="mood-chart-container">
        <div className="mood-chart-header">
          <h2>Mood Trends</h2>
        </div>
        <div className="loading">Loading mood data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mood-chart-container">
        <div className="mood-chart-header">
          <h2>Mood Trends</h2>
        </div>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!moodData || moodData.total_entries === 0) {
    return (
      <div className="mood-chart-container">
        <div className="mood-chart-header">
          <h2>Mood Trends</h2>
          <select 
            value={selectedRange} 
            onChange={handleRangeChange}
            className="range-selector"
          >
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
          </select>
        </div>
        <div className="no-data">
          No mood data available for the selected time period. 
          Start logging some songs to see your mood trends!
        </div>
      </div>
    );
  }

  return (
    <div className="mood-chart-container">
      <div className="mood-chart-header">
        <h2>Mood Trends</h2>
        <select 
          value={selectedRange} 
          onChange={handleRangeChange}
          className="range-selector"
        >
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="year">Past Year</option>
        </select>
      </div>
      <div className="chart-wrapper">
        <canvas ref={chartRef} />
      </div>
      <div className="chart-summary">
        <p>Total songs logged: <strong>{moodData.total_entries}</strong></p>
      </div>
    </div>
  );



};


export default MoodChart;

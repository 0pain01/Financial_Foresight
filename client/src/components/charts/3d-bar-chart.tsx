import React from 'react';
import Plot from 'react-plotly.js';

interface SpendingData {
  category: string;
  year: number;
  amount: number;
}

interface SpendingAnalysisChartProps {
  data: SpendingData[];
  width?: number;
  height?: number;
}

export default function SpendingAnalysisChart({ data, width = 800, height = 500 }: SpendingAnalysisChartProps) {
  // Transform data for Plotly charts
  const categories = ["Food & Dining", "Transportation", "Shopping", "Bills & Utilities", "Entertainment", "Healthcare", "Housing", "Income", "Other"];
  
  // Get actual years from data
  const years = Array.from(new Set(data.map(d => d.year))).sort();
  
  // Create 2D matrix for data processing
  const zMatrix: number[][] = [];
  
  categories.forEach(category => {
    const row: number[] = [];
    years.forEach(year => {
      const dataPoint = data.find(d => d.category === category && d.year === year);
      row.push(dataPoint ? dataPoint.amount : 0);
    });
    zMatrix.push(row);
  });

  // Find min and max values for proper scaling
  const allValues = zMatrix.flat();
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);

  // Create data for Cost vs Year chart (Line Chart)
  const costVsYearData = [
    {
      type: 'scatter' as const,
      x: data.map(d => d.year),
      y: data.map(d => d.amount),
      mode: 'lines+markers' as const,
      line: {
        color: '#3B82F6',
        width: 3
      },
      marker: {
        size: 8,
        color: '#3B82F6',
        opacity: 0.8
      },
      text: data.map(d => `${d.category} - ${d.year}: $${d.amount.toLocaleString()}`),
      hovertemplate: 
        '<b>%{text}</b><br>' +
        'Year: %{x}<br>' +
        'Amount: $%{y:,.0f}<br>' +
        '<extra></extra>'
    }
  ];

  // Create data for Category vs Cost chart
  const categoryVsCostData = [
    {
      type: 'bar' as const,
      x: data.map(d => d.category),
      y: data.map(d => d.amount),
      marker: {
        color: data.map(d => {
          if (d.amount > 5000) return '#ef4444'; // Red for high spending
          if (d.amount > 2000) return '#f59e0b'; // Orange for medium spending
          return '#10b981'; // Green for low spending
        }),
        opacity: 0.8
      },
      text: data.map(d => `$${d.amount.toLocaleString()}`),
      textposition: 'auto' as const,
      hovertemplate: 
        '<b>%{x}</b><br>' +
        'Amount: $%{y:,.0f}<br>' +
        '<extra></extra>'
    }
  ];



  const costVsYearLayout = {
    title: { text: 'Cost vs Year Analysis' },
    xaxis: { title: 'Years' },
    yaxis: { title: 'Amount ($)' },
    width: width / 2 - 20,
    height: height
  };

  const categoryVsCostLayout = {
    title: { text: 'Category vs Cost Analysis' },
    xaxis: { title: 'Categories' },
    yaxis: { title: 'Amount ($)' },
    width: width / 2 - 20,
    height: height
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'] as any[],
    responsive: true
  };

  return (
    <div className="w-full">
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between' }}>
        {/* Cost vs Year Chart */}
        <div style={{ flex: 1 }}>
          <Plot
            data={costVsYearData}
            layout={costVsYearLayout}
            config={config}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        </div>
        
        {/* Category vs Cost Chart */}
        <div style={{ flex: 1 }}>
          <Plot
            data={categoryVsCostData}
            layout={categoryVsCostLayout}
            config={config}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler={true}
          />
        </div>
      </div>
    </div>
  );
}
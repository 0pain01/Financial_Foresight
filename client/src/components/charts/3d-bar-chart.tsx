import React from 'react';
import Plot from 'react-plotly.js';

interface SpendingData {
  category: string;
  year: number;
  amount: number;
}

interface ThreeDBarChartProps {
  data: SpendingData[];
  width?: number;
  height?: number;
}

export default function ThreeDBarChart({ data, width = 800, height = 500 }: ThreeDBarChartProps) {
  console.log('ThreeDBarChart component received data:', data);
  console.log('Data length:', data?.length);
  
  // Transform data for Plotly 3D bar chart
  const categories = ["Food & Dining", "Transportation", "Shopping", "Bills & Utilities", "Entertainment", "Healthcare", "Housing", "Income", "Other"];
  
  // Get actual years from data
  const years = [...new Set(data.map(d => d.year))].sort();
  console.log('Years in 3D chart component:', years);
  console.log('Input data:', data);
  
  // Create 2D matrix for surface plot
  const zMatrix: number[][] = [];
  
  categories.forEach(category => {
    const row: number[] = [];
    years.forEach(year => {
      const dataPoint = data.find(d => d.category === category && d.year === year);
      row.push(dataPoint ? dataPoint.amount : 0);
    });
    zMatrix.push(row);
  });
  
  console.log('Z Matrix:', zMatrix);
  console.log('Flat Z values:', zMatrix.flat());

  // Find min and max values for proper scaling
  const allValues = zMatrix.flat();
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);

  // Create simple 2D scatter data first to test
  const plotData = [
    {
      type: 'scatter' as const,
      x: data.map(d => d.year),
      y: data.map(d => d.amount),
      mode: 'markers' as const,
      marker: {
        size: data.map(d => Math.max(8, d.amount / 100)),
        color: data.map(d => {
          if (d.amount > 5000) return '#ef4444'; // Red for high spending
          if (d.amount > 2000) return '#f59e0b'; // Orange for medium spending
          return '#10b981'; // Green for low spending
        }),
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
  
  console.log('Plot data:', plotData);

  const layout = {
    title: '2D Spending Analysis by Year (Testing)',
    xaxis: { title: 'Years' },
    yaxis: { title: 'Amount ($)' },
    width: width,
    height: height
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    responsive: true
  };

  return (
    <div className="w-full">
      <div style={{ border: '1px solid red', padding: '10px', margin: '10px' }}>
        <p>Debug Info:</p>
        <p>Data length: {data?.length}</p>
        <p>Years: {years.join(', ')}</p>
        <p>Sample data point: {data?.[0] ? JSON.stringify(data[0]) : 'No data'}</p>
      </div>
      <Plot
        data={plotData}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
}
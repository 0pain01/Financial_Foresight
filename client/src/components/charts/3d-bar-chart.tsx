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

  const plotData = [
    {
      type: 'scatter3d' as const,
      x: years.flatMap(year => Array(categories.length).fill(year)),
      y: categories.flatMap(category => Array(years.length).fill(category)),
      z: zMatrix.flat(),
      mode: 'markers' as const,
      marker: {
        size: zMatrix.flat().map(val => Math.max(8, val / 100)),
        color: zMatrix.flat().map(val => {
          if (val > 5000) return '#ef4444'; // Red for high spending
          if (val > 2000) return '#f59e0b'; // Orange for medium spending
          return '#10b981'; // Green for low spending
        }),
        opacity: 0.8,
        colorscale: [
          [0, '#10b981'],    // Green for low values
          [0.5, '#f59e0b'],  // Orange for medium values
          [1, '#ef4444']     // Red for high values
        ]
      },
      text: zMatrix.flat().map((val, i) => {
        const categoryIndex = Math.floor(i / years.length);
        const yearIndex = i % years.length;
        return `${categories[categoryIndex]} - ${years[yearIndex]}: $${val.toLocaleString()}`;
      }),
      hovertemplate: 
        '<b>%{text}</b><br>' +
        'Category: %{y}<br>' +
        'Year: %{x}<br>' +
        'Amount: $%{z:,.0f}<br>' +
        '<extra></extra>'
    }
  ];

  const layout = {
    title: {
      text: '3D Spending Analysis by Category and Year',
      font: { size: 16, color: 'var(--foreground)' }
    },
    scene: {
      xaxis: {
        title: 'Years',
        titlefont: { color: 'var(--foreground)' },
        tickfont: { color: 'var(--foreground)' },
        gridcolor: 'var(--border)',
        tickmode: 'array',
        tickvals: years,
        ticktext: years.map(y => y.toString())
      },
      yaxis: {
        title: 'Categories',
        titlefont: { color: 'var(--foreground)' },
        tickfont: { color: 'var(--foreground)' },
        gridcolor: 'var(--border)',
        tickmode: 'array',
        tickvals: categories,
        ticktext: categories
      },
      zaxis: {
        title: 'Amount ($)',
        titlefont: { color: 'var(--foreground)' },
        tickfont: { color: 'var(--foreground)' },
        gridcolor: 'var(--border)',
        tickformat: ',.0f'
      },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.5 }
      },
      bgcolor: 'var(--background)'
    },
    width: width,
    height: height,
    paper_bgcolor: 'var(--background)',
    plot_bgcolor: 'var(--background)',
    font: {
      color: 'var(--foreground)'
    },
    margin: {
      l: 50,
      r: 50,
      b: 50,
      t: 50,
      pad: 4
    }
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    responsive: true
  };

  return (
    <div className="w-full">
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